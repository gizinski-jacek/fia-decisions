import { useCallback, useContext, useEffect, useState } from 'react';
import { GetServerSidePropsContext, NextApiRequest, NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	ContactDocModel,
	DocumentsResponseData,
	GroupedByGP,
	MissingDocModel,
	SelectDocsValues,
} from '../../types/myTypes';
import { Button, Form, Modal } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { supportedSeries } from '../../lib/myData';
import LoadingBar from '../../components/LoadingBar';
import { renderBySeries, verifyToken } from '../../lib/utils';
import MissingDocWrapper from '../../components/wrappers/MissingDocWrapper';
import ContactDocWrapper from '../../components/wrappers/ContactDocWrapper';
import SeriesDataForm from '../../components/forms/SeriesDataForm';
import { SupportedSeriesDataContext } from '../../hooks/SupportedYearsProvider';
import UpdateDocsForm from '../../components/forms/UpdateDocsForm';

interface Props {
	signedIn: boolean;
}

const Dashboard: NextPage<Props> = ({ signedIn }) => {
	const { yearsBySeries } = useContext(SupportedSeriesDataContext);
	const [selectedDocs, setSelectedDocs] =
		useState<SelectDocsValues>('contact-message');
	const [docsData, setDocsData] = useState<
		GroupedByGP | MissingDocModel[] | ContactDocModel[] | null
	>(null);
	const [fetching, setFetching] = useState(false);
	const [fetchingErrors, setFetchingErrors] = useState<string[] | null>(null);
	const [searchInput, setSearchInput] = useState('');
	const [yearSelect, setYearSelect] = useState<number | null>(null);
	const [showUpdateDocsModal, setShowUpdateDocsModal] =
		useState<boolean>(false);
	const [showUpdateSeriesDataModal, setShowUpdateSeriesDataModal] =
		useState<boolean>(false);

	const router = useRouter();

	const fetchDocuments = useCallback(
		async (documents: SelectDocsValues, year: number | null) => {
			try {
				if (!documents) {
					setFetchingErrors(['Must select valid Documents from the list.']);
					return;
				}
				const [docType, series, manualUpload] = documents.split('__');
				if (docType === 'penalties' && !year) {
					setFetchingErrors(['Must select valid Year from the list.']);
					return;
				}
				setFetching(true);
				const res: DocumentsResponseData = await axios.get(
					`/api/dashboard/${docType}/${series}/${year}/${manualUpload || ''}`,
					{ timeout: 15000 }
				);
				setFetchingErrors(null);
				setDocsData(res.data);
				setFetching(false);
			} catch (error: any) {
				if (error instanceof AxiosError) {
					if (error.response?.status === 401) {
						router.reload();
					} else {
						Array.isArray(error?.response?.data)
							? setFetchingErrors(
									error?.response?.data || [
										'Unknown server error. Fetching documents failed.',
									]
							  )
							: setFetchingErrors([
									error?.response?.data ||
										'Unknown server error. Fetching documents failed.',
							  ]);
					}
				} else {
					if (error.status === 401) {
						router.reload();
					} else {
						setFetchingErrors([
							(error as Error).message ||
								'Unknown server error. Fetching documents failed.',
						]);
					}
				}
				setFetching(false);
			}
		},
		[router]
	);

	const handleDeleteDocument = async (query: string, docId: string) => {
		try {
			if (
				confirm(
					'This action is irreversible. Are you sure You want to Delete this document?'
				) === false
			) {
				return;
			}
			if (!yearSelect) {
				setFetchingErrors(['Must select year from the list.']);
				return;
			}
			if (!query || !docId) {
				setFetchingErrors(['Must select document from the list.']);
				return;
			}
			const [docType, series, manualUpload] = query.split('__');
			setFetching(true);
			await axios.delete(
				`/api/dashboard/${docType}/${series}/${docId}/${yearSelect || ''}`,
				{ timeout: 15000 }
			);
			fetchDocuments(selectedDocs, yearSelect);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					router.reload();
				} else {
					Array.isArray(error?.response?.data)
						? setFetchingErrors(
								error?.response?.data || [
									'Unknown server error. Delete request failed.',
								]
						  )
						: setFetchingErrors([
								error?.response?.data ||
									'Unknown server error. Delete request failed.',
						  ]);
				}
			} else {
				if (error.status === 401) {
					router.reload();
				} else {
					setFetchingErrors([
						(error as Error).message ||
							'Unknown server error. Delete request failed.',
					]);
				}
			}
			setFetching(false);
		}
	};

	const handleAcceptDocument = async (series: string, docId: string) => {
		try {
			if (confirm('Are you sure You want to Accept this document?') === false) {
				return;
			}
			if (!series || !docId) {
				setFetchingErrors(['Series and document Id is required.']);
				return;
			}
			setFetching(true);
			await axios.put(`/api/dashboard/accept-document/${docId}`, {
				timeout: 15000,
			});
			fetchDocuments(selectedDocs, yearSelect);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					router.reload();
				} else {
					Array.isArray(error?.response?.data)
						? setFetchingErrors(
								error?.response?.data || [
									'Unknown server error. Accept request failed.',
								]
						  )
						: setFetchingErrors([
								error?.response?.data ||
									'Unknown server error. Accept request failed.',
						  ]);
				}
			} else {
				if (error.status === 401) {
					router.reload();
				} else {
					setFetchingErrors([
						(error as Error).message ||
							'Unknown server error. Accept request failed.',
					]);
				}
			}
			setFetching(false);
		}
	};

	const handleDocSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (!yearsBySeries) return;
		const { value } = e.target as {
			value: SelectDocsValues;
		};
		const [docType, series, manualUpload] = value.split('__');
		if (docType === 'penalties' && series) {
			if (yearSelect && yearsBySeries[series]?.includes(yearSelect)) {
				setYearSelect(yearSelect);
			} else if (yearsBySeries[series][0]) {
				setYearSelect(yearsBySeries[series][0]);
			} else {
				setYearSelect(null);
			}
		}
		setSelectedDocs(value);
		setDocsData(null);
	};

	useEffect(() => {
		if (signedIn) {
			fetchDocuments('contact-message', null);
		} else {
			router.push('/sign-in');
		}
	}, [signedIn, fetchDocuments, router]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setSearchInput(value);
	};

	const handleYearSelectChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		const { value } = e.target;
		setYearSelect(parseInt(value));
	};

	const openUpdateDocsModal = () => {
		setShowUpdateDocsModal(true);
	};

	const closeUpdateDocsModal = () => {
		setShowUpdateDocsModal(false);
	};

	const openUpdateSeriesDataModal = async () => {
		setShowUpdateSeriesDataModal(true);
	};

	const closeUpdateSeriesDataModal = () => {
		setShowUpdateSeriesDataModal(false);
	};

	return signedIn ? (
		<div className='d-flex flex-column gap-3 mx-2 my-4'>
			<div className='d-flex gap-2 justify-content-between'>
				<Form className='flex-grow-0 rounded-2 p-2 bg-light'>
					<Form.Group>
						<Form.Label htmlFor='documents_select' className='fw-bolder'>
							Documents
						</Form.Label>
						<Form.Select
							name='documents_select'
							id='documents_select'
							onChange={handleDocSelectChange}
							value={selectedDocs}
							disabled={fetching}
							required
						>
							<option value='contact-message'>Contact Messages</option>
							<option value='missing-info'>Missing Penalty - Info</option>
							<option value='missing-file'>Missing Penalty - File</option>
							<option disabled>───────────────</option>
							{yearsBySeries &&
								supportedSeries.map((series, i) => (
									<option
										key={series + i}
										value={'penalties__' + series + '__manual-upload'}
										disabled={!yearsBySeries[series]?.length}
									>
										{series.replace('f', 'F') + ' Penalties - Uploads'}
									</option>
								))}
							<option disabled>───────────────</option>
							{yearsBySeries &&
								supportedSeries.map((series, i) => (
									<option
										key={series + i}
										value={'penalties__' + series}
										disabled={!yearsBySeries[series]?.length}
									>
										{series.replace('f', 'F') + ' Penalties - API'}
									</option>
								))}
						</Form.Select>
					</Form.Group>
					<div className='d-flex justify-content-between align-items-end'>
						{selectedDocs.includes('penalties') &&
							(() => {
								const series = selectedDocs.split('__')[1];
								if (!series || !yearsBySeries) return;
								return (
									<Form.Group>
										<Form.Label
											htmlFor='year_select'
											className='fw-bolder my-1'
										>
											Year
										</Form.Label>
										<Form.Select
											name='year_select'
											id='year_select'
											onChange={handleYearSelectChange}
											value={yearSelect || undefined}
											disabled={fetching}
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
						<Button
							variant='primary'
							size='sm'
							className='text-nowrap fw-bold ms-auto text-uppercase mt-3'
							disabled={fetching}
							onClick={() => fetchDocuments(selectedDocs, yearSelect)}
						>
							Fetch
						</Button>
					</div>
				</Form>
				<div className='d-flex flex-column justify-content-between align-items-end'>
					<div className='d-flex flex-column gap-3'>
						<Button
							className='fw-bold text-black'
							variant='danger'
							size='sm'
							disabled={fetching || !!fetchingErrors}
							onClick={openUpdateSeriesDataModal}
						>
							Update Series Data
						</Button>
						<Modal
							show={showUpdateSeriesDataModal}
							onHide={closeUpdateSeriesDataModal}
							dialogClassName='modal-lg custom-minwidth'
						>
							<Modal.Header closeButton>
								<Modal.Title className='d-flex gap-5 me-3'>
									<h3>Update Series Data</h3>
								</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								<SeriesDataForm reloadRoute={router.reload} />
							</Modal.Body>
						</Modal>
						<Button
							className='fw-bold text-black'
							variant='warning'
							size='sm'
							disabled={fetching || !!fetchingErrors}
							onClick={openUpdateDocsModal}
						>
							Update Penalties
						</Button>
						<Modal
							show={showUpdateDocsModal}
							onHide={closeUpdateDocsModal}
							dialogClassName='modal-md custom-minwidth'
						>
							<Modal.Header closeButton>
								<Modal.Title className='d-flex gap-5 me-3'>
									<h3>Update Documents</h3>
								</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								<UpdateDocsForm reloadRoute={router.reload} />
							</Modal.Body>
						</Modal>
					</div>
					{selectedDocs.includes('penalties') && (
						<Form
							className='d-flex gap-5 rounded-2 p-2 bg-light'
							onSubmit={(e) => e.preventDefault()}
						>
							<Form.Group className='d-flex gap-2'>
								<Form.Control
									className='py-0 px-2'
									type='search'
									name='search_input'
									id='search_input'
									maxLength={32}
									onChange={handleInputChange}
									value={searchInput}
									placeholder='Penalty / Name / Car #'
									disabled={!docsData || fetching}
								/>
								<Button
									variant='dark'
									size='sm'
									className='px-1 py-0'
									disabled={!docsData || fetching}
									onClick={() => setSearchInput('')}
								>
									<i className='bi bi-x fs-5'></i>
								</Button>
							</Form.Group>
						</Form>
					)}
				</div>
			</div>
			{fetchingErrors && (
				<div className='m-0 my-2 mx-sm-auto alert alert-danger alert-dismissible overflow-auto custom-alert-maxheight text-start'>
					{fetchingErrors.map((message, index) => (
						<div className='d-flex mb-2' key={index}>
							<i className='bi bi-exclamation-triangle-fill fs-5 m-0 me-2'></i>
							<strong className='ms-2 me-4'>{message}</strong>
						</div>
					))}
					<button
						type='button'
						className='btn btn-close p-2'
						id='live-alert'
						onClick={() => setFetchingErrors(null)}
					></button>
				</div>
			)}
			{!fetching ? (
				selectedDocs && docsData ? (
					typeof docsData === 'object' &&
					!Array.isArray(docsData) &&
					docsData !== null ? (
						selectedDocs.match(/(penalties__|missing-file)/im) ? (
							Object.keys(docsData).length ? (
								renderBySeries(docsData as GroupedByGP, searchInput, {
									deleteHandler: handleDeleteDocument,
									docType: selectedDocs,
									acceptHandler: handleAcceptDocument,
								})
							) : (
								<div className='m-5 text-center'>
									<h3>No Penalties Found</h3>
								</div>
							)
						) : null
					) : Array.isArray(docsData) && docsData.length ? (
						selectedDocs === 'missing-info' ? (
							<MissingDocWrapper
								data={docsData as MissingDocModel[]}
								docType={selectedDocs}
								handleDelete={handleDeleteDocument}
							/>
						) : selectedDocs === 'contact-message' ? (
							<ContactDocWrapper
								data={docsData as ContactDocModel[]}
								docType={selectedDocs}
								handleDelete={handleDeleteDocument}
							/>
						) : null
					) : (
						<div className='m-5 text-center'>
							<h3>No Documents Found</h3>
						</div>
					)
				) : null
			) : (
				<LoadingBar margin='2rem 5rem' />
			)}
		</div>
	) : null;
};

export const getServerSideProps = (context: GetServerSidePropsContext) => {
	if (!process.env.JWT_STRATEGY_SECRET) {
		throw new Error(
			'Please define JWT_STRATEGY_SECRET environment variable inside .env.local'
		);
	}
	const tokenValid = verifyToken(context.req as NextApiRequest);
	if (tokenValid) {
		return {
			props: { signedIn: true },
		};
	} else {
		context.res.setHeader(
			'Set-Cookie',
			`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
		);
		return {
			props: { signedIn: false },
		};
	}
};

export default Dashboard;
