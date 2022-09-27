import { useEffect, useState } from 'react';
import { GetServerSidePropsContext, NextPage } from 'next';
import {
	ContactDocModel,
	DecisionOffenceModel,
	MissingDocModel,
} from '../../types/myTypes';
import DashboardForm from '../../components/forms/DashboardForm';
import { Accordion, Button, Form } from 'react-bootstrap';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { supportedSeries } from '../../lib/myData';
import LoadingBar from '../../components/LoadingBar';

interface Props {
	validToken: boolean;
}

const Dashboard: NextPage<Props> = ({ validToken }) => {
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

	const handleSignIn = () => {
		setSignedIn(true);
	};

	const getDocuments = async (
		docType: string
	): Promise<
		// DecisionOffenceModel[] |
		MissingDocModel[] | ContactDocModel[] | null
	> => {
		try {
			setFetching(true);
			const res = await axios.get(`/api/dashboard/${docType}`);
			setFetching(false);
			return res.data;
		} catch (error) {
			console.log(error);
			setFetching(false);
			setRequestFailed('Unknown server error.');
			return null;
		}
	};

	const deleteDocument = async (docType: string, docId: string) => {
		// try {
		// 	setFetching(true);
		// 	await axios.delete(`/api/dashboard/${docType}?doc_id=${docId}`);
		// 	setFetching(false);
		// } catch (error) {
		// 	console.log(error);
		// 	setFetching(false);
		// 	setRequestFailed('Unknown server error.');
		// }
	};

	const handleInputChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { value } = e.target as { value: 'missing' | 'contact' };
		setChosenDocs(value);
	};

	const handleDocsRefresh = async () => {
		setDocsData(await getDocuments(chosenDocs));
	};

	useEffect(() => {
		(async () => {
			setDocsData(await getDocuments(chosenDocs));
		})();
	}, [chosenDocs]);

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
					<div className='flex-grow-1 m-2 alert alert-danger alert-dismissible'>
						<strong>{requestFailed}</strong>
						<button
							type='button'
							className='btn btn-close'
							onClick={() => setRequestFailed(false)}
						></button>
					</div>
				)}
			</div>
			{chosenDocs === 'missing' && docsData !== null ? (
				<Accordion className='col m-2'>
					<Accordion.Item eventKey='0'>
						<Accordion.Header>
							<h4 className='fw-bold'>Missing Penalties</h4>
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
			) : chosenDocs === 'contact' && docsData !== null ? (
				<Accordion className='col m-2'>
					<Accordion.Item eventKey='0'>
						<Accordion.Header>
							<h4 className='fw-bold'>Contact Messages</h4>
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
				props: { validToken: false },
			};
		}
		const decodedToken = jwt.verify(token, process.env.JWT_STRATEGY_SECRET);
		if (decodedToken !== process.env.PAYLOAD_STRING) {
			context.res.setHeader(
				'Set-Cookie',
				`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
			);
			return {
				props: { validToken: false },
			};
		} else {
			return {
				props: {
					validToken: true,
				},
			};
		}
	} catch (error) {
		console.log(error);
		return {
			props: { validToken: false },
		};
	}
};

export default Dashboard;
