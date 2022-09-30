import { useCallback, useEffect, useState } from 'react';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	ContactDocModel,
	GroupedByGP,
	MissingDocModel,
} from '../../types/myTypes';
import DashboardForm from '../../components/forms/DashboardForm';
import { Accordion, Button, Form } from 'react-bootstrap';
import jwt from 'jsonwebtoken';
import axios, { AxiosError } from 'axios';
import { dbNameList, supportedSeries } from '../../lib/myData';
import LoadingBar from '../../components/LoadingBar';
import connectMongo from '../../lib/mongo';
import F1DocWrapper from '../../components/wrappers/F1DocWrapper';
import { renderDocsGroupedByGP } from '../../lib/utils';
import MissingDocWrapper from '../../components/wrappers/MissingDocWrapper';
import ContactDocWrapper from '../../components/wrappers/ContactDocWrapper';

interface Props {
	validToken: boolean;
	data: GroupedByGP | MissingDocModel[] | ContactDocModel[] | null;
}

const Dashboard: NextPage<Props> = ({ validToken, data }) => {
	const [signedIn, setSignedIn] = useState(validToken);
	const [chosenDocs, setChosenDocs] = useState<
		| 'missing'
		| 'contact'
		| 'penalties__formula1__manual-upload'
		| 'penalties__formula2__manual-upload'
		| 'penalties__formula3__manual-upload'
		| 'penalties__formula1'
		| 'penalties__formula2'
		| 'penalties__formula3'
	>('contact');
	const [docsData, setDocsData] = useState<
		GroupedByGP | MissingDocModel[] | ContactDocModel[] | null
	>(null);
	const [fetching, setFetching] = useState(false);
	const [requestFailed, setRequestFailed] = useState<false | string>(false);
	const [searchInput, setSearchInput] = useState('');

	const router = useRouter();

	const handleSignIn = async () => {
		await getDocuments(chosenDocs);
		setSignedIn(true);
	};

	const getDocuments = useCallback(
		async (docType: string) => {
			if (!docType) {
				return null;
			}
			try {
				setFetching(true);
				const res = await axios.get(`/api/dashboard/${docType}`, {
					timeout: 15000,
				});
				setFetching(false);
				setRequestFailed(false);
				setDocsData(res.data);
			} catch (error: any) {
				setFetching(false);
				if (error instanceof AxiosError) {
					if (error.response?.status === 401) {
						router.reload();
					} else {
						Array.isArray(error?.response?.data)
							? setRequestFailed(
									error?.response?.data.join(' ') ||
										'Unknown server error. Fetching documents failed.'
							  )
							: setRequestFailed(
									error?.response?.data ||
										'Unknown server error. Fetching documents failed.'
							  );
						setDocsData(null);
					}
				} else {
					if (error.status === 401) {
						router.reload();
					} else {
						setRequestFailed(
							(error as Error).message ||
								'Unknown server error. Fetching documents failed.'
						);
						setDocsData(null);
					}
				}
			}
		},
		[router]
	);

	const handleDeleteDocument = async (docType: string, docId: string) => {
		// Error when deleting:
		// XML Parsing Error: no element found
		// Location: http://localhost:3000/api/dashboard/missing?doc_id=6334be6da875c7c312b0f82e
		// Line Number 1, Column 1:
		if (
			confirm(
				'Are you sure You want to delete this document? This actions is irreversible.'
			) === false
		) {
			return;
		}
		if (!docType || !docId) {
			return;
		}
		try {
			setFetching(true);
			await axios.delete(`/api/dashboard/${docType}?doc_id=${docId}`);
			await getDocuments(chosenDocs);
		} catch (error: any) {
			setFetching(false);
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					router.reload();
				} else {
					Array.isArray(error?.response?.data)
						? setRequestFailed(
								error?.response?.data.join(' ') ||
									'Unknown server error. Delete request failed.'
						  )
						: setRequestFailed(
								error?.response?.data ||
									'Unknown server error. Delete request failed.'
						  );
				}
			} else {
				if (error.status === 401) {
					router.reload();
				} else {
					setRequestFailed(
						(error as Error).message ||
							'Unknown server error. Delete request failed.'
					);
				}
			}
		}
	};

	const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { value } = e.target as { value: 'missing' | 'contact' };
		setChosenDocs(value);
		setDocsData(null);
	};

	const handleDocsRefresh = async () => {
		await getDocuments(chosenDocs);
	};

	useEffect(() => {
		if (signedIn) {
			(async () => {
				await getDocuments(chosenDocs);
			})();
		}
	}, [signedIn, chosenDocs, getDocuments]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setSearchInput(value);
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
							<h6
								className='m-0'
								style={{ cursor: 'pointer' }}
								onClick={handleDocsRefresh}
							>
								Refresh
								<i className='bi bi-arrow-repeat fs-6 ms-1'></i>
							</h6>
						</Form.Label>
						<Form.Select
							name='documents'
							id='documents'
							onChange={handleSelectChange}
							value={chosenDocs}
							disabled={fetching}
							required
						>
							<option value='contact'>Contact Messages</option>
							<option value='missing'>Missing Penalties</option>
							{supportedSeries.map((s, i) => (
								<option key={i} value={'penalties__' + s + '__manual-upload'}>
									{s.replace('formula', 'F') + ' Penalties - Uploads'}
								</option>
							))}
							{supportedSeries.map((s, i) => (
								<option key={i} value={'penalties__' + s}>
									{s.replace('formula', 'Formula ') + ' Penalties'}
								</option>
							))}
						</Form.Select>
					</Form.Group>
				</Form>
				{requestFailed !== false && (
					<div className='flex-grow-1 my-2 ms-4 alert alert-danger alert-dismissible'>
						<strong>{requestFailed}</strong>
						<button
							type='button'
							className='btn btn-close'
							onClick={() => setRequestFailed(false)}
						></button>
					</div>
				)}
			</div>
			{chosenDocs !== 'missing' && chosenDocs !== 'contact' ? (
				<Form className='rounded-2 p-2 my-2 bg-light'>
					<Form.Group className='d-flex'>
						<Form.Control
							className='py-0 px-2 mx-1'
							type='search'
							name='searchInput'
							id='searchInput'
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
				</Form>
			) : null}
			{docsData !== null && !fetching ? (
				chosenDocs.includes('penalties__') ? (
					renderDocsGroupedByGP(docsData as GroupedByGP, searchInput)
				) : chosenDocs === 'missing' ? (
					<MissingDocWrapper
						data={docsData as MissingDocModel[]}
						docType={'missing'}
						handleDelete={handleDeleteDocument}
					/>
				) : chosenDocs === 'contact' ? (
					<ContactDocWrapper
						data={docsData as ContactDocModel[]}
						docType={'contact'}
						handleDelete={handleDeleteDocument}
					/>
				) : null
			) : (
				<LoadingBar />
			)}
		</div>
	) : (
		<DashboardForm handleSignIn={handleSignIn} />
	);
};

export const getServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	try {
		if (!process.env.JWT_STRATEGY_SECRET) {
			throw new Error(
				'Please define JWT_STRATEGY_SECRET environment variable inside .env.local'
			);
		}
		const { token } = context.req.cookies;
		if (!token) {
			return {
				props: { validToken: false, data: null },
			};
		}
		const decodedToken = jwt.verify(token, process.env.JWT_STRATEGY_SECRET);
		if (decodedToken !== process.env.JWT_PAYLOAD_STRING) {
			context.res.setHeader(
				'Set-Cookie',
				`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
			);
			return {
				props: { validToken: false, data: null },
			};
		} else {
			try {
				const conn = await connectMongo(dbNameList.other_documents_db);
				const document_list = await conn.models.Missing_Doc.find({}).exec();
				return {
					props: {
						validToken: true,
						data: JSON.parse(JSON.stringify(document_list)),
					},
				};
			} catch (error: any) {
				return {
					props: { validToken: false, data: null },
				};
			}
		}
	} catch (error: any) {
		return {
			props: { validToken: false, data: null },
		};
	}
};

export default Dashboard;
