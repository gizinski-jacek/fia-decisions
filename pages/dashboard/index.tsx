import { useCallback, useEffect, useState } from 'react';
import { GetServerSidePropsContext, NextApiRequest, NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	ContactDocModel,
	GroupedByGP,
	MissingDocModel,
} from '../../types/myTypes';
import DashboardForm from '../../components/forms/DashboardForm';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { dbNameList, supportedSeries } from '../../lib/myData';
import LoadingBar from '../../components/LoadingBar';
import { renderBySeries, verifyToken } from '../../lib/utils';
import MissingDocWrapper from '../../components/wrappers/MissingDocWrapper';
import ContactDocWrapper from '../../components/wrappers/ContactDocWrapper';

interface Props {
	validToken: boolean;
}

const Dashboard: NextPage<Props> = ({ validToken }) => {
	const [signedIn, setSignedIn] = useState(validToken);
	const [chosenDocs, setChosenDocs] = useState<
		| 'contact-message'
		| 'missing-info'
		| 'penalties__missing-file'
		| 'penalties__f1__manual-upload'
		| 'penalties__f1__manual-upload'
		| 'penalties__f2__manual-upload'
		| 'penalties__f3__manual-upload'
		| 'penalties__f1'
		| 'penalties__f2'
		| 'penalties__f3'
	>('contact-message');
	const [docsData, setDocsData] = useState<
		GroupedByGP | MissingDocModel[] | ContactDocModel[] | null
	>(null);
	const [fetching, setFetching] = useState(false);
	const [fetchingError, setFetchingError] = useState<string | null>(null);
	const [searchInput, setSearchInput] = useState('');
	const [yearSelect, setYearSelect] = useState(
		new Date().getFullYear().toString()
	);

	const router = useRouter();

	const handleSignIn = () => {
		getDocuments();
		setSignedIn(true);
	};

	const getDocuments = useCallback(async () => {
		if (!chosenDocs) {
			setFetchingError('Must choose valid documents from the list.');
			return;
		}
		const [docType, series, manualUpload] = chosenDocs.split('__');
		try {
			setFetching(true);
			const res = await axios.get(
				`/api/dashboard/${docType}/${series}/${yearSelect}/${
					manualUpload || ''
				}`,
				{ timeout: 15000 }
			);
			setFetching(false);
			setFetchingError(null);
			setDocsData(res.data);
		} catch (error: any) {
			setFetching(false);
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					router.reload();
				} else {
					setFetchingError(
						error?.response?.data ||
							'Unknown server error. Fetching documents failed.'
					);
					setDocsData(null);
				}
			} else {
				if (error.status === 401) {
					router.reload();
				} else {
					setFetchingError(
						(error as Error).message ||
							'Unknown server error. Fetching documents failed.'
					);
					setDocsData(null);
				}
			}
		}
	}, [chosenDocs, yearSelect, router]);

	const handleDeleteDocument = async (query: string, docId: string) => {
		// Error when deleting:
		// XML Parsing Error: no element found
		// Location: http://localhost:3000/api/dashboard/missing?doc_id=6334be6da875c7c312b0f82e
		// Line Number 1, Column 1:
		if (
			confirm(
				'Are you sure You want to Delete this document? This action is irreversible.'
			) === false
		) {
			return;
		}
		if (!query || !docId || !yearSelect) {
			setFetchingError('Must choose documents and year from the list.');
			return;
		}
		const [docType, series, manualUpload] = query.split('__');
		try {
			setFetching(true);
			const res = await axios.delete(
				`/api/dashboard/${docType}/${series}/${docId}/${yearSelect || ''}`,
				{ timeout: 15000 }
			);
			getDocuments();
		} catch (error: any) {
			setFetching(false);
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					router.reload();
				} else {
					Array.isArray(error?.response?.data)
						? setFetchingError(
								error?.response?.data.join(' ') ||
									'Unknown server error. Delete request failed.'
						  )
						: setFetchingError(
								error?.response?.data ||
									'Unknown server error. Delete request failed.'
						  );
				}
			} else {
				if (error.status === 401) {
					router.reload();
				} else {
					setFetchingError(
						(error as Error).message ||
							'Unknown server error. Delete request failed.'
					);
				}
			}
		}
	};

	const handleAcceptDocument = async (series: string, docId: string) => {
		// Error when deleting:
		// XML Parsing Error: no element found
		// Location: http://localhost:3000/api/dashboard/missing?doc_id=6334be6da875c7c312b0f82e
		// Line Number 1, Column 1:
		if (confirm('Are you sure You want to Accept this document?') === false) {
			return;
		}
		if (!series || !docId) {
			setFetchingError('Series and document Id is required.');
			return;
		}
		try {
			setFetching(true);
			await axios.put(`/api/dashboard/accept-document/${docId}`, {
				timeout: 15000,
			});
			getDocuments();
		} catch (error: any) {
			setFetching(false);
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					router.reload();
				} else {
					Array.isArray(error?.response?.data)
						? setFetchingError(
								error?.response?.data.join(' ') ||
									'Unknown server error. Accept request failed.'
						  )
						: setFetchingError(
								error?.response?.data ||
									'Unknown server error. Accept request failed.'
						  );
				}
			} else {
				if (error.status === 401) {
					router.reload();
				} else {
					setFetchingError(
						(error as Error).message ||
							'Unknown server error. Delete request failed.'
					);
				}
			}
		}
	};

	const handleDocSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { value } = e.target as {
			value:
				| 'contact-message'
				| 'missing-info'
				| 'penalties__missing-file'
				| 'penalties__f1__manual-upload'
				| 'penalties__f1__manual-upload'
				| 'penalties__f2__manual-upload'
				| 'penalties__f3__manual-upload'
				| 'penalties__f1'
				| 'penalties__f2'
				| 'penalties__f3';
		};
		setChosenDocs(value);
		setDocsData(null);
	};

	const handleDocsRefresh = () => {
		getDocuments();
	};

	useEffect(() => {
		if (signedIn) {
			(() => {
				setSearchInput('');
				getDocuments();
			})();
		}
	}, [signedIn, getDocuments]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setSearchInput(value);
	};

	const handleYearSelectChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		const { value } = e.target;
		setYearSelect(value);
	};

	return signedIn ? (
		<div className='mt-5 m-2'>
			<div className='d-flex my-2'>
				<Form className='rounded-2 p-2 my-2 bg-light'>
					<Form.Group>
						<Form.Label
							htmlFor='documents'
							className='fw-bolder d-flex justify-content-between align-items-center'
						>
							Documents
							<span
								className='d-flex align-items-center'
								style={{ cursor: 'pointer' }}
								onClick={handleDocsRefresh}
							>
								<h6 className='m-0'>Refresh</h6>
								<i className='bi bi-arrow-repeat fs-6 ms-1'></i>
							</span>
						</Form.Label>
						<Form.Select
							name='documents_select'
							id='documents_select'
							onChange={handleDocSelectChange}
							value={chosenDocs}
							disabled={fetching}
							required
						>
							<option value='contact-message'>Contact Messages</option>
							<option value='missing-info'>Missing - Info</option>
							<option value='penalties__missing-file'>Missing - Files</option>
							{supportedSeries.map((s, i) => (
								<option key={i} value={'penalties__' + s + '__manual-upload'}>
									{s.replace('f', 'F') + ' Penalties - Uploads'}
								</option>
							))}
							{supportedSeries.map((s, i) => (
								<option key={i} value={'penalties__' + s}>
									{s.replace('f', 'Formula ') + ' Penalties'}
								</option>
							))}
						</Form.Select>
					</Form.Group>
				</Form>
				{fetchingError && (
					<div className='flex-grow-1 my-2 ms-4 alert alert-danger alert-dismissible'>
						<strong>{fetchingError}</strong>
						<button
							type='button'
							className='btn btn-close'
							onClick={() => setFetchingError(null)}
						></button>
					</div>
				)}
			</div>
			{chosenDocs !== 'contact-message' && chosenDocs !== 'missing-info' ? (
				<Form className='rounded-2 p-2 my-2 bg-light d-flex'>
					<Form.Group className='d-flex flex-grow-1'>
						<Form.Control
							className='py-0 px-2 me-2'
							type='search'
							name='search_input'
							id='search_input'
							maxLength={32}
							onChange={handleInputChange}
							value={searchInput}
							placeholder='Penalty / Name / Car #'
							disabled={fetching}
						/>
						<Button variant='dark' size='sm' onClick={() => setSearchInput('')}>
							<i className='bi bi-x fs-6'></i>
						</Button>
					</Form.Group>
					{chosenDocs !== 'penalties__missing-file' && (
						<Form.Group className='ms-5'>
							<Form.Select
								className='py-0 px-1 fs-5 custom-select'
								name='year_select'
								id='year_select'
								onChange={handleYearSelectChange}
								value={yearSelect}
								disabled={fetching}
							>
								{(() => {
									const series = chosenDocs.split('__')[1];
									if (!series) return;
									const supported = supportedSeries.find(
										(s) => s === series.toLowerCase()
									);
									if (!supported) return;
									const seriesDbList = [];
									for (const key of Object.keys(dbNameList)) {
										if (key.includes(supported)) {
											seriesDbList.push(key);
										}
									}
									const yearsList = seriesDbList.map((s) => s.split('_')[1]);
									return yearsList.map((y) => (
										<option key={y} value={y}>
											{y}
										</option>
									));
								})()}
							</Form.Select>
						</Form.Group>
					)}
				</Form>
			) : null}
			{chosenDocs !== null && docsData !== null && !fetching ? (
				docsData.length !== 0 ? (
					chosenDocs.includes('penalties__') ? (
						renderBySeries(docsData as GroupedByGP, searchInput, {
							deleteHandler: handleDeleteDocument,
							docType: chosenDocs,
							acceptHandler: handleAcceptDocument,
						})
					) : chosenDocs === 'missing-info' ? (
						<MissingDocWrapper
							data={docsData as MissingDocModel[]}
							docType={chosenDocs}
							handleDelete={handleDeleteDocument}
						/>
					) : chosenDocs === 'contact-message' ? (
						<ContactDocWrapper
							data={docsData as ContactDocModel[]}
							docType={chosenDocs}
							handleDelete={handleDeleteDocument}
						/>
					) : null
				) : (
					<div className='m-5 text-center'>
						<h3>No Documents Found</h3>
					</div>
				)
			) : (
				<LoadingBar />
			)}
		</div>
	) : (
		<DashboardForm handleSignIn={handleSignIn} />
	);
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
			props: { validToken: true },
		};
	} else {
		context.res.setHeader(
			'Set-Cookie',
			`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
		);
		return {
			props: { validToken: false },
		};
	}
};

export default Dashboard;
