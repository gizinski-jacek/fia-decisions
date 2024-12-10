import { useCallback, useContext, useEffect, useState } from 'react';
import { GetServerSidePropsContext, NextApiRequest, NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	ContactDocModel,
	DocumentsResponseData,
	PenaltyModel,
	MissingDocModel,
	SelectDocumentsValues,
} from '../../types/myTypes';
import { Button, Form, Modal } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { supportedSeries } from '../../lib/myData';
import LoadingBar from '../../components/LoadingBar';
import {
	groupBySeriesAndGrandPrix,
	renderGroupedBySeries,
	verifyToken,
} from '../../lib/utils';
import MissingDocWrapper from '../../components/wrappers/MissingDocWrapper';
import ContactDocWrapper from '../../components/wrappers/ContactDocWrapper';
import SeriesDataForm from '../../components/forms/SeriesDataForm';
import { SeriesDataContext } from '../../hooks/SeriesDataContextProvider';
import UpdatePenaltiesForm from '../../components/forms/UpdatePenaltiesForm';
import ErrorMsg from '../../components/ErrorMsg';

interface Props {
	signedIn: boolean;
}

const Dashboard: NextPage<Props> = ({ signedIn }) => {
	const { yearsBySeries } = useContext(SeriesDataContext);
	const [selectedDocuments, setSelectedDocuments] =
		useState<SelectDocumentsValues>('contact-message');
	const [documentsData, setDocumentsData] = useState<
		PenaltyModel[] | MissingDocModel[] | ContactDocModel[] | null
	>(null);
	const [fetching, setFetching] = useState(false);
	const [fetchingErrors, setFetchingErrors] = useState<string[] | null>(null);
	const [searchInput, setSearchInput] = useState('');
	const [selectedYear, setSelectedYear] = useState<number | null>(null);
	const [showUpdatePenaltiesModal, setShowUpdatePenaltiesModal] =
		useState<boolean>(false);
	const [showUpdateSeriesDataModal, setShowUpdateSeriesDataModal] =
		useState<boolean>(false);

	const router = useRouter();

	const fetchDocuments = useCallback(
		async (documents: SelectDocumentsValues, year: number | null) => {
			try {
				handleDismissAlert();
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
				setDocumentsData(res.data);
				setFetching(false);
			} catch (error: any) {
				if (error instanceof AxiosError) {
					if (error.response?.status === 401) {
						router.push('/sign-in');
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
						router.push('/sign-in');
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

	const handleDeletePenaltyDocument = async (
		e: React.MouseEvent<HTMLButtonElement>,
		queryType: SelectDocumentsValues,
		docSeries: string,
		docId: string,
		docYear: string
	) => {
		try {
			e.preventDefault();
			handleDismissAlert();
			const confirm = window.confirm(
				'This action is irreversible. Are you sure You want to Delete this document?'
			);
			if (!confirm) return;
			if (!yearsBySeries) return;
			if (!queryType.includes('penalties') && queryType !== 'missing-file') {
				setFetchingErrors(['Wrong document type.']);
				return;
			}
			if (!docSeries || !docId || !docYear) {
				setFetchingErrors(['Must select document from the list.']);
				return;
			}
			if (
				yearsBySeries &&
				!yearsBySeries[docSeries].find((year) => year === parseInt(docYear))
			) {
				setFetchingErrors(['Document year error.']);
				return;
			}
			const [docType, series, manualUpload] = queryType.split('__');
			setFetching(true);
			await axios.delete(
				`/api/dashboard/${docType}/${docSeries}/${docId}/${docYear}`,
				{ timeout: 15000 }
			);
			fetchDocuments(selectedDocuments, selectedYear);
			setFetching(false);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					router.push('/sign-in');
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
					router.push('/sign-in');
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

	const handleDeleteDocument = async (
		e: React.MouseEvent<HTMLButtonElement>,
		queryType: SelectDocumentsValues,
		docId: string
	) => {
		try {
			e.preventDefault();
			handleDismissAlert();
			const confirm = window.confirm(
				'This action is irreversible. Are you sure You want to Delete this document?'
			);
			if (!confirm) return;
			if (
				!queryType.includes('contact-message') &&
				!queryType.includes('missing-info')
			) {
				setFetchingErrors(['Wrong document type.']);
				return;
			}
			if (!docId) {
				setFetchingErrors(['Must select document from the list.']);
				return;
			}
			setFetching(true);
			await axios.delete(`/api/dashboard/${queryType}/null/${docId}`, {
				timeout: 15000,
			});
			fetchDocuments(selectedDocuments, selectedYear);
			setFetching(false);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					router.push('/sign-in');
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
					router.push('/sign-in');
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

	const handleAcceptDocument = async (
		e: React.MouseEvent<HTMLButtonElement>,
		docSeries: string,
		docId: string
	) => {
		try {
			e.preventDefault();
			handleDismissAlert();
			const confirm = window.confirm(
				'Are you sure You want to Accept this document?'
			);
			if (!confirm) return;
			if (!docSeries || !docId) {
				setFetchingErrors(['Series and document Id is required.']);
				return;
			}
			setFetching(true);
			await axios.put(`/api/dashboard/accept-document/${docId}`, {
				timeout: 15000,
			});
			fetchDocuments(selectedDocuments, selectedYear);
			setFetching(false);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					router.push('/sign-in');
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
					router.push('/sign-in');
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

	const handleSelectedDocumentChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		if (!yearsBySeries) return;
		const { value } = e.target as {
			value: SelectDocumentsValues;
		};
		const [docType, series, manualUpload] = value.split('__');
		if (docType === 'penalties' && series) {
			if (selectedYear && yearsBySeries[series]?.includes(selectedYear)) {
				setSelectedYear(selectedYear);
			} else if (yearsBySeries[series][0]) {
				setSelectedYear(yearsBySeries[series][0]);
			} else {
				setSelectedYear(null);
			}
		}
		setSelectedDocuments(value);
		setDocumentsData(null);
	};

	useEffect(() => {
		if (signedIn) {
			fetchDocuments('contact-message', null);
		} else {
			router.push('/sign-in');
		}
	}, [signedIn, fetchDocuments, router]);

	const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleDismissAlert();
		const { value } = e.target;
		setSearchInput(value);
	};

	const handleSelectedYearChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		handleDismissAlert();
		const { value } = e.target;
		setSelectedYear(parseInt(value));
	};

	const openUpdatePenaltiesModal = () => {
		setShowUpdatePenaltiesModal(true);
	};

	const closeUpdatePenaltiesModal = () => {
		setShowUpdatePenaltiesModal(false);
	};

	const openUpdateSeriesDataModal = async () => {
		setShowUpdateSeriesDataModal(true);
	};

	const closeUpdateSeriesDataModal = () => {
		setShowUpdateSeriesDataModal(false);
	};

	const handleDismissAlert = () => {
		setFetchingErrors(null);
	};

	return signedIn ? (
		<div className='d-flex flex-column gap-3 mx-2 my-4'>
			<div className='d-flex gap-2 justify-content-between mb-2'>
				<Form className='flex-grow-0 rounded-2 p-2 bg-light'>
					<Form.Group>
						<Form.Label htmlFor='documents_select' className='fw-bolder'>
							Documents
						</Form.Label>
						<Form.Select
							name='documents_select'
							id='documents_select'
							onChange={handleSelectedDocumentChange}
							value={selectedDocuments}
							disabled={fetching || !!fetchingErrors}
							required
						>
							<option value='contact-message'>Contact Messages</option>
							<option value='missing-info'>Missing Penalty - Info</option>
							<option value='missing-file'>Missing Penalty - File</option>
							{yearsBySeries && <option disabled>───────────────</option>}
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
							{yearsBySeries && <option disabled>───────────────</option>}
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
					<div className='d-flex justify-content-between align-items-end mt-2'>
						{selectedDocuments.includes('penalties') &&
							(() => {
								const series = selectedDocuments.split('__')[1];
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
											onChange={handleSelectedYearChange}
											value={selectedYear || undefined}
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
						<Button
							variant='primary'
							className='text-nowrap fw-bold ms-auto text-uppercase mt-5'
							disabled={fetching || !!fetchingErrors}
							onClick={() => fetchDocuments(selectedDocuments, selectedYear)}
						>
							Fetch
						</Button>
					</div>
				</Form>
				<div className='d-flex flex-column justify-content-between align-items-end'>
					<div className='d-flex flex-column gap-3'>
						<Button
							className='fw-bold text-black'
							variant='warning'
							size='sm'
							disabled={fetching || !!fetchingErrors}
							onClick={openUpdatePenaltiesModal}
						>
							Update Penalties
						</Button>
						<Modal
							show={showUpdatePenaltiesModal}
							onHide={closeUpdatePenaltiesModal}
							dialogClassName='modal-md custom-minwidth'
						>
							<Modal.Header closeButton>
								<Modal.Title className='d-flex gap-5 me-3'>
									<h3>Update Documents</h3>
								</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								<UpdatePenaltiesForm />
							</Modal.Body>
						</Modal>
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
								<SeriesDataForm />
							</Modal.Body>
						</Modal>
					</div>
					{selectedDocuments.includes('penalties') && (
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
									onChange={handleSearchInputChange}
									value={searchInput}
									placeholder='Penalty / Name / Car #'
									disabled={!documentsData || fetching}
								/>
								<Button
									variant='dark'
									size='sm'
									className='px-1 py-0'
									disabled={!documentsData || fetching}
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
				<ErrorMsg errors={fetchingErrors} dismiss={handleDismissAlert} />
			)}
			{!fetching ? (
				selectedDocuments && documentsData ? (
					documentsData.length ? (
						selectedDocuments.match(/(penalties__|missing-file)/im) ? (
							renderGroupedBySeries(
								groupBySeriesAndGrandPrix(documentsData as PenaltyModel[]),
								searchInput,
								{
									handleDelete: handleDeletePenaltyDocument,
									queryType: selectedDocuments,
									handleAccept: handleAcceptDocument,
								}
							)
						) : selectedDocuments === 'missing-info' ? (
							<MissingDocWrapper
								data={documentsData as MissingDocModel[]}
								docType={selectedDocuments}
								handleDelete={handleDeleteDocument}
							/>
						) : selectedDocuments === 'contact-message' ? (
							<ContactDocWrapper
								data={documentsData as ContactDocModel[]}
								docType={selectedDocuments}
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
