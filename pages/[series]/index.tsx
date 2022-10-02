import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { GroupedByGP } from '../../types/myTypes';
import { Button, Form } from 'react-bootstrap';
import { renderDocsGroupedByGP } from '../../lib/utils';
import axios from 'axios';
import LoadingBar from '../../components/LoadingBar';

const FormulaSeries: NextPage = () => {
	const [docsData, setDocsData] = useState<GroupedByGP | null>(null);
	const [showSearchInput, setShowSearchInput] = useState(false);
	const [searchInput, setSearchInput] = useState('');
	const [selectInput, setSelectInput] = useState(
		new Date().getFullYear().toString()
	);
	const [fetching, setFetching] = useState(false);

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
		setSelectInput(value);
	};

	const getDocuments = useCallback(async () => {
		try {
			setFetching(true);
			const res = await axios.get(
				`/api/document/${router.query.series}/${selectInput}`
			);
			setFetching(false);
			setDocsData(res.data);
		} catch (error) {
			setDocsData(null);
		}
	}, [selectInput, router]);

	useEffect(() => {
		if (selectInput) {
			getDocuments();
		}
	}, [selectInput, getDocuments]);

	return (
		<div className='m-2 my-lg-3'>
			<div className='position-relative'>
				<div
					className={`custom-search mb-2 
					${showSearchInput ? 'expanded mb-lg-0' : 'mb-sm-0'}`}
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
								name='searchInput'
								id='searchInput'
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
				<Form className='position-absolute top-0 end-0 mb-2 custom-select'>
					<Form.Group>
						<Form.Select
							className='py-0 px-1 me-2 fs-5'
							name='selectInput'
							id='selectInput'
							onChange={handleSelectChange}
							value={selectInput}
							disabled={fetching}
						>
							<option value='2022'>2022</option>
							<option value='2021'>2021</option>
							<option value='2020'>2020</option>
							<option value='2019'>2019</option>
							{/* {supportedSeries.map((s, i) => (
								<option key={i} value={s}>
									{s.replace('formula', 'Formula ')}
								</option>
							))} */}
						</Form.Select>
					</Form.Group>
				</Form>
			</div>
			<h2
				className='text-center text-capitalize fw-bolder fst-italic'
				style={{ lineHeight: '2.15rem' }}
			>{`Formula ${router.query.series?.slice(-1)} Penalties`}</h2>
			<div className='my-lg-3'>
				{fetching ? (
					<LoadingBar margin='5rem 10rem' />
				) : docsData ? (
					renderDocsGroupedByGP(docsData, searchInput)
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
