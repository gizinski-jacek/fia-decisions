// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../lib/mongo';
import { dbNameList } from '../../../lib/myData';
import {
	ContactDocModel,
	DecisionOffenceModel,
	MissingDocModel,
} from '../../../types/myTypes';
import { verifyToken } from '../../../lib/utils';

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<
		DecisionOffenceModel[] | MissingDocModel[] | ContactDocModel[] | string
	>
) => {
	if (req.method === 'GET') {
		const { doc_type } = req.query as { doc_type: string };
		// if (doc_type?.toLowerCase().includes('formula')) {
		// 	try {
		// 		if (!process.env.JWT_STRATEGY_SECRET) {
		// 			throw new Error(
		// 				'Please define JWT_STRATEGY_SECRET environment variable inside .env.local'
		// 			);
		// 		}
		// 		const { token } = req.cookies;
		// 		if (!token) {
		// 			return {
		// 				props: { validToken: false },
		// 			};
		// 		}
		// 		const decodedToken = jwt.verify(token, process.env.JWT_STRATEGY_SECRET);
		// 		if (decodedToken !== process.env.PAYLOAD_STRING) {
		// 			res.setHeader(
		// 				'Set-Cookie',
		// 				`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
		// 			);
		// 			return {
		// 				props: { validToken: false },
		// 			};
		// 		}
		// 		const conn = await connectMongo(dbNameList.other_documents_db);
		// 		const document_list = await conn.models.Decision_Offence.find({}).exec();
		// 		return res.status(200).json(document_list);
		// 	} catch (error: any) {
		// 		return res.status(404).json('Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.');
		// 	}
		// }
		//
		if (doc_type === 'missing') {
			try {
				const tokenValid = verifyToken(req);
				if (!tokenValid) {
					res.setHeader(
						'Set-Cookie',
						`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
					);
					return res.status(401).end();
				}
				const conn = await connectMongo(dbNameList.other_documents_db);
				const document_list = await conn.models.Missing_Doc.find({}).exec();
				return res.status(200).json(document_list);
			} catch (error: any) {
				console.log(error);
				return res
					.status(404)
					.json(
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
					);
			}
		}
		if (doc_type === 'contact') {
			try {
				const tokenValid = verifyToken(req);
				if (!tokenValid) {
					res.setHeader(
						'Set-Cookie',
						`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
					);
					return res.status(401).end();
				}
				const conn = await connectMongo(dbNameList.other_documents_db);
				const document_list = await conn.models.Contact_Doc.find({}).exec();
				return res.status(200).json(document_list);
			} catch (error: any) {
				return res
					.status(404)
					.json(
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
					);
			}
		}
	} else if (req.method === 'DELETE') {
		const { doc_type, doc_id } = req.query;
		// if (doc_type === 'penalty') {
		// 	try {
		// 		const tokenValid =  verifyToken(req);
		// 		if (!tokenValid) {
		// 			res.setHeader(
		// 				'Set-Cookie',
		// 				`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
		// 			);
		// 			return res.status(401).end();
		// 		}
		// 		if (!doc_id) {
		// 			return res.status(403).json('Document Id is required.');
		// 		}
		// 		const conn = await connectMongo(dbNameList.other_documents_db);
		// 		await conn.models.Decision_Offence.findByIdAndDelete(doc_id).exec();
		// 		return res.status(200).end();
		// 	} catch (error: any) {
		// 		return res
		// 			.status(404)
		// 			.json(
		// 				'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
		// 			);
		// 	}
		// }
		if (doc_type === 'missing') {
			try {
				const tokenValid = verifyToken(req);
				if (!tokenValid) {
					res.setHeader(
						'Set-Cookie',
						`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
					);
					return res.status(401).end();
				}
				if (!doc_id) {
					return res.status(403).json('Document Id is required.');
				}
				const conn = await connectMongo(dbNameList.other_documents_db);
				await conn.models.Missing_Doc.findByIdAndDelete(doc_id).exec();
				return res.status(200).end();
			} catch (error: any) {
				return res
					.status(404)
					.json(
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
					);
			}
		}
		if (doc_type === 'contact') {
			try {
				const tokenValid = verifyToken(req);
				if (!tokenValid) {
					res.setHeader(
						'Set-Cookie',
						`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
					);
					return res.status(401).end();
				}
				if (!doc_id) {
					return res.status(403).json('Document Id is required.');
				}
				const conn = await connectMongo(dbNameList.other_documents_db);
				await conn.models.Contact_Doc.findByIdAndDelete(doc_id).exec();
				return res.status(200).end();
			} catch (error: any) {
				return res
					.status(404)
					.json(
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
					);
			}
		}
	} else {
		return res.status(405).end();
	}
};

export default handler;
