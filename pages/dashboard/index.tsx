import { useState } from 'react';
import { GetServerSidePropsContext, NextPage } from 'next';
import { ContactDocModel, MissingDocModel } from '../../types/myTypes';
import DashboardForm from '../../components/forms/DashboardForm';
import { Accordion } from 'react-bootstrap';
import jwt from 'jsonwebtoken';
import connectMongo from '../../lib/mongo';
import { dbNameList } from '../../lib/myData';

interface Props {
	validToken: boolean;
	data: { missing: MissingDocModel[]; contact: ContactDocModel[] };
}

const Dashboard: NextPage<Props> = ({ validToken, data }) => {
	const [signedIn, setSignedIn] = useState(validToken);
	const [docsData, setDocsData] = useState<
		{ missing: MissingDocModel[]; contact: ContactDocModel[] } | string | null
	>(data);

	const handleSignIn = (data: {
		missing: MissingDocModel[];
		contact: ContactDocModel[];
	}) => {
		setDocsData(data);
		setSignedIn(true);
	};

	return signedIn ? (
		<div className='my-4 row'>
			{typeof docsData === 'string' ? (
				<div className='text-center'>
					<h3>{docsData}</h3>
				</div>
			) : (
				<>
					<Accordion className='col m-2'>
						<Accordion.Item eventKey='0'>
							<Accordion.Header>
								<h4 className='fw-bold'>Missing Penalties</h4>
							</Accordion.Header>
							<Accordion.Body>
								{docsData?.missing.map((m) => (
									<div
										key={m._id}
										className='p-2 mb-2 bg-light rounded text-break'
									>
										<div>
											<strong>Series</strong>
											<p className='text-capitalize'>{m.series}</p>
										</div>
										<div>
											<strong>Title</strong>
											<p className='text-capitalize'>{m.title}</p>
										</div>
										<div>
											<strong>Link / URL</strong>
											<a
												href={m.url}
												target='_blank'
												rel='noreferrer'
												className='d-block'
											>
												{m.url}
											</a>
										</div>
									</div>
								))}
							</Accordion.Body>
						</Accordion.Item>
					</Accordion>
					<Accordion className='col m-2'>
						<Accordion.Item eventKey='0'>
							<Accordion.Header>
								<h4 className='fw-bold'>Contact Messages</h4>
							</Accordion.Header>
							<Accordion.Body>
								{docsData?.contact.map((c) => (
									<div
										key={c._id}
										className='p-2 mb-2 bg-light rounded text-break'
									>
										<div>
											<strong>Email</strong>
											<a href={`mailto:${c.email}`} className='d-block'>
												{c.email}
											</a>
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
				</>
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
		if (decodedToken !== process.env.PAYLOAD_STRING) {
			context.res.setHeader(
				'Set-Cookie',
				`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
			);
			return {
				props: { validToken: false, data: null },
			};
		}
		const conn = await connectMongo(dbNameList.other_documents_db);
		const [missing, contact]: [MissingDocModel[], ContactDocModel[]] =
			await Promise.all([
				conn.models.Missing_Doc.find({}).exec(),
				conn.models.Contact_Doc.find({}).exec(),
			]);
		return {
			props: {
				validToken: true,
				data: JSON.parse(
					JSON.stringify({ missing: missing, contact: contact })
				),
			},
		};
	} catch (error) {
		console.log(error);
		return {
			props: { validToken: false, data: null },
		};
	}
};

export default Dashboard;
