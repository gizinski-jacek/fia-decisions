import { useCallback, useEffect, useState } from 'react';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	ContactDocModel,
	DecisionOffenceModel,
	MissingDocModel,
} from '../../types/myTypes';
import DashboardForm from '../../components/forms/DashboardForm';
import { Accordion, Button, Form } from 'react-bootstrap';
import jwt from 'jsonwebtoken';
import axios, { AxiosError } from 'axios';
import { dbNameList, supportedSeries } from '../../lib/myData';
import LoadingBar from '../../components/LoadingBar';
import connectMongo from '../../lib/mongo';

interface Props {
	validToken: boolean;
	data: DecisionOffenceModel[] | MissingDocModel[] | ContactDocModel[] | null;
}

const Dashboard: NextPage<Props> = ({ validToken, data }) => {
	const [signedIn, setSignedIn] = useState(validToken);
	const [chosenDocs, setChosenDocs] = useState<
		// 'penalties' |
		'missing' | 'contact'
	>('contact');
	const [docsData, setDocsData] = useState<
		DecisionOffenceModel[] | MissingDocModel[] | ContactDocModel[] | null
	>(null);
	const [fetching, setFetching] = useState(false);
	const [requestFailed, setRequestFailed] = useState<false | string>(false);

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

	const deleteDocument = async (docType: string, docId: string) => {
		if (!docType || !docId) {
			return;
		}
		try {
			setFetching(true);
			await axios.delete(`/api/dashboard/${docType}?doc_id=${docId}`);
			setFetching(false);
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

	const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { value } = e.target as { value: 'missing' | 'contact' };
		setChosenDocs(value);
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

	return signedIn ? (
		<div className='my-3'>
			<div className='d-flex my-3'>
				<Form className='rounded-2 p-2 m-2 bg-light'>
					<Form.Group>
						<Form.Label
							htmlFor='documents'
							className='fw-bolder w-100 d-flex justify-content-between align-items-center'
						>
							Documents
							<span
								className='ms-5 flex-grow-1'
								style={{ cursor: 'pointer' }}
								onClick={handleDocsRefresh}
							>
								{fetching ? (
									<LoadingBar margin='0' />
								) : (
									<i className='bi bi-arrow-repeat fs-6 float-end'></i>
								)}
							</span>
						</Form.Label>
						<Form.Select
							name='documents'
							id='documents'
							onChange={handleInputChange}
							value={chosenDocs}
							disabled={fetching}
							required
						>
							{/* {supportedSeries.map((s, i) => (
								<option key={i} value={s} className='text-capitalize'>
									{s.replace('_', ' ')}
								</option>
							))} */}
							<option value='missing' className='text-capitalize'>
								Missing Penalties
							</option>
							<option value='contact' className='text-capitalize'>
								Contact Messages
							</option>
						</Form.Select>
					</Form.Group>
				</Form>
				{requestFailed !== false && (
					<div className='w-75 m-2 ms-auto alert alert-danger alert-dismissible'>
						<strong>{requestFailed}</strong>
						<button
							type='button'
							className='btn btn-close'
							onClick={() => setRequestFailed(false)}
						></button>
					</div>
				)}
			</div>
			{docsData !== null ? (
				chosenDocs === 'missing' ? (
					<Accordion className='col m-2'>
						<Accordion.Item eventKey='0'>
							<Accordion.Header>
								<h4 className='fw-bold'>Missing Penalties</h4>
								<h4 className='me-sm-3 fw-bold text-sm-end'>
									{docsData.length} missing
								</h4>
							</Accordion.Header>
							<Accordion.Body>
								{(docsData as MissingDocModel[]).map((m) => (
									<div
										key={m._id}
										className='p-2 mb-2 bg-light rounded text-break'
									>
										<div className='d-flex justify-content-between'>
											<div>
												<strong>Series</strong>
												<p className='text-capitalize'>{m.series}</p>
											</div>
											<Button
												variant='danger'
												size='sm'
												className='fw-bolder mt-2 mt-sm-0 custom-button'
												onClick={() => deleteDocument(chosenDocs, m._id)}
											>
												Delete
											</Button>
										</div>
										<div>
											<strong>Description</strong>
											<p className='text-capitalize'>{m.description}</p>
										</div>
									</div>
								))}
							</Accordion.Body>
						</Accordion.Item>
					</Accordion>
				) : chosenDocs === 'contact' ? (
					<Accordion className='col m-2'>
						<Accordion.Item eventKey='1'>
							<Accordion.Header>
								<h4 className='fw-bold'>Contact Messages</h4>
								<h4 className='me-sm-3 fw-bold text-sm-end'>
									{docsData.length}{' '}
									{docsData.length === 1 ? 'message' : 'messages'}
								</h4>
							</Accordion.Header>
							<Accordion.Body>
								{(docsData as ContactDocModel[]).map((c) => (
									<div
										key={c._id}
										className='p-2 mb-2 bg-light rounded text-break'
									>
										<div className='d-flex justify-content-between'>
											<div>
												<strong>Email</strong>
												<a href={`mailto:${c.email}`} className='d-block'>
													{c.email}
												</a>
											</div>
											<Button
												variant='danger'
												size='sm'
												className='fw-bolder mt-2 mt-sm-0 custom-button'
												onClick={() => deleteDocument(chosenDocs, c._id)}
											>
												Delete
											</Button>
										</div>
										<div>
											<strong>Message</strong>
											<p className='text-capitalize'>{c.message}</p>
										</div>
									</div>
								))}
							</Accordion.Body>
						</Accordion.Item>
					</Accordion>
				) : null
			) : null}
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
				console.log(error);
				return {
					props: { validToken: false, data: null },
				};
			}
		}
	} catch (error: any) {
		console.log(error);
		return {
			props: { validToken: false, data: null },
		};
	}
};

export default Dashboard;
