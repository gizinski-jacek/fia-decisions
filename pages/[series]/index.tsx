import { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { GroupedByGP } from '../../types/myTypes';
import { Button, Form } from 'react-bootstrap';
import { renderDocsGroupedByGP } from '../../lib/utils';
import axios from 'axios';
import LoadingBar from '../../components/LoadingBar';
import { dbNameList } from '../../lib/myData';
import { DrawerContext } from '../../hooks/DrawerProvider';

const FormulaSeries: NextPage = () => {
	const { drawer } = useContext(DrawerContext);
	const [docsData, setDocsData] = useState<GroupedByGP | null>(null);
	const [showSearchInput, setShowSearchInput] = useState(false);
	const [searchInput, setSearchInput] = useState('');
	const [yearSelect, setYearSelect] = useState(
		new Date().getFullYear().toString()
	);
	const [fetching, setFetching] = useState(true);
	const [fetchingError, setFetchingError] = useState<string | null>(null);

	const router = useRouter();

	const handleShowSearchInput = () => {
		setShowSearchInput(true);
	};

	const handleHideSearchInput = () => {
		setSearchInput('');
		setShowSearchInput(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setSearchInput(value);
	};

	const handleSelectChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		const { value } = e.target;
		setYearSelect(value);
	};

	const getDocuments = useCallback(async () => {
		if (!yearSelect || !router.query.series) {
			return;
		}
		try {
			setFetchingError(null);
			setFetching(true);
			const res = await axios.get(
				`/api/document/${router.query.series}/${yearSelect}`,
				{ timeout: 15000 }
			);
			setFetching(false);
			setDocsData(res.data);
		} catch (error: any) {
			setFetchingError(
				'Failed to get documents. Try refreshing the page. If this issue persists, please use the Contact form to report this issue.'
			);
			setDocsData(null);
		}
	}, [yearSelect, router.query.series]);

	useEffect(() => {
		if (yearSelect) {
			getDocuments();
		}
	}, [yearSelect, getDocuments]);

	useEffect(() => {
		setSearchInput('');
		setYearSelect(new Date().getFullYear().toString());
	}, [router.query.series]);

	return (
		<div className='m-2'>
			<div className='position-relative'>
				<div
					className={`custom-search  
					${showSearchInput ? 'expanded mb-2 mb-lg-0' : ''}`}
				>
					<Button variant='dark' size='sm' onClick={handleShowSearchInput}>
						<i className='bi bi-search fs-6'></i>
					</Button>
					<Form className='position-absolute top-0 start-0 d-flex'>
						<Form.Group className='d-flex'>
							<Button variant='dark' size='sm' onClick={handleHideSearchInput}>
								<i className='bi bi-arrow-left fs-6'></i>
							</Button>
							<Form.Control
								className='py-0 px-2 mx-1'
								type='search'
								name='search_input'
								id='search_input'
								maxLength={32}
								onChange={handleInputChange}
								value={searchInput}
								placeholder='Penalty / Name / Car #'
								disabled={!showSearchInput || !docsData}
							/>
							<Button
								variant='dark'
								size='sm'
								disabled={!showSearchInput || !docsData}
								onClick={() => setSearchInput('')}
							>
								<i className='bi bi-x fs-6'></i>
							</Button>
						</Form.Group>
					</Form>
				</div>
				<Form
					className={`position-absolute top-0 end-0 mb-2 me-xl-0 custom-select 
					${drawer.isHidden ? 'me-5' : ''} `}
				>
					<Form.Group>
						<Form.Select
							className='py-0 px-1 fs-5'
							name='year_select'
							id='year_select'
							onChange={handleSelectChange}
							value={yearSelect}
							disabled={fetching}
						>
							{(() => {
								const seriesDbList = [];
								for (const key of Object.keys(dbNameList)) {
									if (key.includes(router.query.series as string)) {
										seriesDbList.push(key);
									}
								}
								const yearsList = seriesDbList.map((s) => s.split('_')[1]);
								return yearsList.map((y, i) => (
									<option key={i} value={y}>
										{y}
									</option>
								));
							})()}
						</Form.Select>
					</Form.Group>
				</Form>
			</div>
			<h2
				className='text-center text-capitalize fw-bolder fst-italic'
				style={{ lineHeight: '2.15rem' }}
			>
				{router.query.series &&
					`Formula ${router.query.series?.slice(-1)} Penalties`}
			</h2>
			<div className='my-lg-2'>
				{fetching ? (
					<LoadingBar margin='5rem' />
				) : docsData ? (
					renderDocsGroupedByGP(docsData, searchInput)
				) : fetchingError ? (
					<div className='m-0 mt-4 alert alert-danger alert-dismissible'>
						<strong>{fetchingError}</strong>
						<Button
							variant='primary'
							className='position-absolute top-0 end-0 m-2'
							onClick={getDocuments}
						>
							Refresh
						</Button>
					</div>
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
