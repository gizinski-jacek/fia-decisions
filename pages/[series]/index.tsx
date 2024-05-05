import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { FormulaSeriesResponseData, GroupedByGP } from '../../types/myTypes';
import { Button, Form } from 'react-bootstrap';
import { renderGroupedByGP } from '../../lib/utils';
import axios, { AxiosError } from 'axios';
import LoadingBar from '../../components/LoadingBar';
import { DrawerContext } from '../../hooks/DrawerContextProvider';
import { SeriesDataContext } from '../../hooks/SeriesDataContextProvider';

const FormulaSeries: NextPage = () => {
	const { drawer } = useContext(DrawerContext);
	const { yearsBySeries } = useContext(SeriesDataContext);
	const [penaltiesDocsData, setPenaltiesDocsData] =
		useState<GroupedByGP | null>(null);
	const [showSearchInput, setShowSearchInput] = useState(false);
	const [searchInput, setSearchInput] = useState('');
	const [selectedYear, setSelectedYear] = useState<number | null>(null);
	const [fetching, setFetching] = useState(true);
	const [fetchingErrors, setFetchingErrors] = useState<string[] | null>(null);
	const [screenIsSmall, setSmallScreen] = useState(false);

	const router = useRouter();

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setSmallScreen(window.innerWidth < 576);
		}
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const toggleScreenIsSmall = () => {
				setSmallScreen(window.innerWidth < 576);
			};

			window.addEventListener('resize', toggleScreenIsSmall);

			return () => window.removeEventListener('resize', toggleScreenIsSmall);
		}
	}, []);

	const fetchDocuments = useCallback(async () => {
		try {
			setFetchingErrors(null);
			if (!selectedYear || !router.query.series) {
				return;
			}
			setFetching(true);
			const res: FormulaSeriesResponseData = await axios.get(
				`/api/document/penalties/${router.query.series}/${selectedYear}`,
				{ timeout: 15000 }
			);
			setPenaltiesDocsData(res.data);
			setFetching(false);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				Array.isArray(error?.response?.data)
					? setFetchingErrors(
							error?.response?.data || [
								'Failed to get documents. Try refreshing the page. If this issue persists, please use the Contact form to report this issue.',
							]
					  )
					: setFetchingErrors([
							error?.response?.data ||
								'Failed to get documents. Try refreshing the page. If this issue persists, please use the Contact form to report this issue.',
					  ]);
			} else {
				setFetchingErrors([
					(error as Error).message ||
						'Failed to get documents. Try refreshing the page. If this issue persists, please use the Contact form to report this issue.',
				]);
			}
			setPenaltiesDocsData(null);
		}
	}, [selectedYear, router.query.series]);

	const handleShowSearchInput = () => {
		setShowSearchInput(true);
	};

	const handleHideSearchInput = () => {
		setSearchInput('');
		setShowSearchInput(false);
	};

	const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setSearchInput(value);
	};

	const handleSelectedYearChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		if (!yearsBySeries) return;
		const { series } = router.query as { series: string };
		const { value } = e.target;
		if (series) {
			if (yearsBySeries[series]?.includes(parseInt(value))) {
				router.push(`/${series}?year=${value}`, undefined, {
					shallow: true,
				});
			} else {
				router.push(`/${series}`, undefined, {
					shallow: true,
				});
			}
			setSelectedYear(parseInt(value));
		}
	};

	useEffect(() => {
		const { series, year } = router.query as { series: string; year: string };
		setSearchInput('');
		if (series && yearsBySeries) {
			if (year && yearsBySeries[series]?.includes(parseInt(year))) {
				setSelectedYear(parseInt(year));
			} else if (yearsBySeries[series]?.length) {
				setSelectedYear(yearsBySeries[series][0]);
			} else {
				setSelectedYear(null);
			}
		}
	}, [router, yearsBySeries]);

	useEffect(() => {
		if (selectedYear) {
			fetchDocuments();
		}
	}, [selectedYear, fetchDocuments, router]);

	const handleDocsRefresh = () => {
		if (selectedYear) {
			fetchDocuments();
		}
	};

	return (
		<div className='d-flex flex-column gap-2 m-2'>
			<div className='position-relative'>
				<div
					className={`custom-search 
					${showSearchInput ? 'expanded mb-2 mb-lg-0' : ''}`}
				>
					<Button size='sm' variant='dark' onClick={handleShowSearchInput}>
						<i className='bi bi-search fs-6'></i>
					</Button>
					<Form
						className='position-absolute top-0 start-0 d-flex'
						onSubmit={(e) => e.preventDefault()}
					>
						<Form.Group className='d-flex'>
							<Button size='sm' variant='dark' onClick={handleHideSearchInput}>
								<i className='bi bi-arrow-left fs-6'></i>
							</Button>
							<Form.Control
								className='py-0 px-2 mx-2'
								type='search'
								name='search_input'
								id='search_input'
								maxLength={32}
								onChange={handleSearchInputChange}
								value={searchInput}
								placeholder='Penalty / Name / Car #'
								disabled={!showSearchInput || !penaltiesDocsData || fetching}
							/>
							<Button
								size='sm'
								variant='dark'
								disabled={!showSearchInput || !penaltiesDocsData || fetching}
								onClick={() => setSearchInput('')}
							>
								<i className='bi bi-x fs-6'></i>
							</Button>
						</Form.Group>
					</Form>
				</div>

				<div
					className={`position-absolute top-0 end-0 d-flex align-items-center gap-2 custom-select 
					${drawer.isHidden && screenIsSmall ? 'me-5' : ''} `}
				>
					<Button
						variant='light'
						type='button'
						className='py-1 px-2 border border-primary'
						onClick={handleDocsRefresh}
						disabled={!selectedYear}
					>
						<i className='bi bi-arrow-repeat fs-6 text-primary'></i>
					</Button>
					<Form>
						{(() => {
							const series = router.query.series as string;
							if (!series || !yearsBySeries) return;
							return (
								<Form.Group>
									<Form.Label
										htmlFor='year_select'
										className='fw-bolder my-1 d-none'
									>
										Year
									</Form.Label>
									<Form.Select
										name='year_select'
										id='year_select'
										onChange={handleSelectedYearChange}
										value={selectedYear || ''}
										disabled={fetching || !!fetchingErrors}
									>
										{yearsBySeries[series]?.map((year) => (
											<option key={year} value={year}>
												{year}
											</option>
										))}
									</Form.Select>
								</Form.Group>
							);
						})()}
					</Form>
				</div>
			</div>
			<h2
				className='text-center text-capitalize fw-bolder fst-italic'
				style={{ lineHeight: '2.15rem' }}
			>
				{router.query.series &&
					`${selectedYear ? selectedYear : ''} F${router.query.series?.slice(
						-1
					)} Penalties`}
			</h2>
			<div className='d-flex flex-column gap-2'>
				{fetching ? (
					<LoadingBar margin='5rem' />
				) : fetchingErrors ? (
					<div className='m-0 alert alert-danger alert-dismissible overflow-auto custom-alert-maxheight text-start'>
						{fetchingErrors.map((message, index) => (
							<div className='d-flex mb-2' key={index}>
								<i className='bi bi-exclamation-triangle-fill fs-4 m-0 me-2'></i>
								<strong className='ms-2 me-5'>{message}</strong>
							</div>
						))}
						<Button
							variant='primary'
							size='sm'
							className='position-absolute top-0 end-0 m-2'
							onClick={fetchDocuments}
						>
							Refresh
						</Button>
					</div>
				) : penaltiesDocsData ? (
					renderGroupedByGP(penaltiesDocsData, searchInput)
				) : (
					<div className='m-5 text-center'>
						<h3>No Documents Found</h3>
					</div>
				)}
			</div>
		</div>
	);
};

export default FormulaSeries;
