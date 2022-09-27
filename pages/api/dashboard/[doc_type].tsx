// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import connectMongo from '../../../lib/mongo';
import { dbNameList } from '../../../lib/myData';
import {
	ContactDocModel,
	DecisionOffenceModel,
	MissingDocModel,
} from '../../../types/myTypes';

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
		// 		const document_list = await conn.models.Missing_Doc.find({}).exec();
		// 		return res.status(200).json(document_list);
		// 	} catch (error) {
		// 		return res.status(404).json('Unknown server error.');
		// 	}
		// }
		if (doc_type === 'missing') {
			try {
				if (!process.env.JWT_STRATEGY_SECRET) {
					throw new Error(
						'Please define JWT_STRATEGY_SECRET environment variable inside .env.local'
					);
				}
				const { token } = req.cookies;
				if (!token) {
					return res.redirect('/dashboard');
				}
				const decodedToken = jwt.verify(token, process.env.JWT_STRATEGY_SECRET);
				if (decodedToken !== process.env.PAYLOAD_STRING) {
					res.setHeader(
						'Set-Cookie',
						`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
					);
					return res.redirect('/dashboard');
				}
				const conn = await connectMongo(dbNameList.other_documents_db);
				const document_list = await conn.models.Missing_Doc.find({}).exec();
				return res.status(200).json(document_list);
			} catch (error) {
				return res.status(404).json('Unknown server error.');
			}
		}
		if (doc_type === 'contact') {
			try {
				if (!process.env.JWT_STRATEGY_SECRET) {
					throw new Error(
						'Please define JWT_STRATEGY_SECRET environment variable inside .env.local'
					);
				}
				const { token } = req.cookies;
				if (!token) {
					return res.redirect('/dashboard');
				}
				const decodedToken = jwt.verify(token, process.env.JWT_STRATEGY_SECRET);
				if (decodedToken !== process.env.PAYLOAD_STRING) {
					res.setHeader(
						'Set-Cookie',
						`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
					);
					return res.redirect('/dashboard');
				}
				const conn = await connectMongo(dbNameList.other_documents_db);
				const document_list = await conn.models.Contact_Doc.find({}).exec();
				return res.status(200).json(document_list);
			} catch (error) {
				return res.status(404).json('Unknown server error.');
			}
		}
	}
	// if (req.method === 'DELETE') {
	// 	const { doc_type, doc_id } = req.query;
	// 	if (doc_type === 'penalty') {
	// 		try {
	// 			const { authorization } = req.headers;
	// 			if (authorization === `Bearer ${process.env.CRON_JOB_CLEANUP_SECRET}`) {
	// 				const files = fs.readdirSync('./pdfreader/');

	// 				if (files.length === 0) {
	// 					return res.status(200).json('No files to clean up.');
	// 				}

	// 				await Promise.all(
	// 					files.map(
	// 						(file) =>
	// 							new Promise(async (resolve, reject) => {
	// 								fs.unlink('./pdfreader/' + file, (error) => {
	// 									if (error) {
	// 										reject(error);
	// 									}
	// 								});
	// 								resolve(null);
	// 							})
	// 					)
	// 				);

	// 				console.log('Finished cleanup.');
	// 				return res.status(200).json('Finished cleanup.');
	// 			} else {
	// 				return res.status(401);
	// 			}
	// 		} catch (error) {
	// 			return res.status(405).json('Job not supported.');
	// 		}
	// 	}
	// 	if (doc_type === 'missing') {
	// 		try {
	// 			const { authorization } = req.headers;
	// 			if (authorization === `Bearer ${process.env.CRON_JOB_CLEANUP_SECRET}`) {
	// 				const files = fs.readdirSync('./pdfreader/');

	// 				if (files.length === 0) {
	// 					return res.status(200).json('No files to clean up.');
	// 				}

	// 				await Promise.all(
	// 					files.map(
	// 						(file) =>
	// 							new Promise(async (resolve, reject) => {
	// 								fs.unlink('./pdfreader/' + file, (error) => {
	// 									if (error) {
	// 										reject(error);
	// 									}
	// 								});
	// 								resolve(null);
	// 							})
	// 					)
	// 				);

	// 				console.log('Finished cleanup.');
	// 				return res.status(200).json('Finished cleanup.');
	// 			} else {
	// 				return res.status(401);
	// 			}
	// 		} catch (error) {
	// 			return res.status(405).json('Job not supported.');
	// 		}
	// 	}
	// 	if (doc_type === 'contact') {
	// 		try {
	// 			const { authorization } = req.headers;
	// 			if (authorization === `Bearer ${process.env.CRON_JOB_CLEANUP_SECRET}`) {
	// 				const files = fs.readdirSync('./pdfreader/');

	// 				if (files.length === 0) {
	// 					return res.status(200).json('No files to clean up.');
	// 				}

	// 				await Promise.all(
	// 					files.map(
	// 						(file) =>
	// 							new Promise(async (resolve, reject) => {
	// 								fs.unlink('./pdfreader/' + file, (error) => {
	// 									if (error) {
	// 										reject(error);
	// 									}
	// 								});
	// 								resolve(null);
	// 							})
	// 					)
	// 				);

	// 				console.log('Finished cleanup.');
	// 				return res.status(200).json('Finished cleanup.');
	// 			} else {
	// 				return res.status(401);
	// 			}
	// 		} catch (error) {
	// 			return res.status(405).json('Job not supported.');
	// 		}
	// 	}
	// }
	return res.status(405).json('Method not supported.');
};

export default handler;
