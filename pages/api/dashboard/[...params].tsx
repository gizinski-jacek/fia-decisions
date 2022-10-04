// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../lib/mongo';
import mongoose from 'mongoose';
import { dbNameList, supportedSeries } from '../../../lib/myData';
import {
	ContactDocModel,
	DecisionOffenceModel,
	GroupedByGP,
	MissingDocModel,
} from '../../../types/myTypes';
import { verifyToken } from '../../../lib/utils';

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<
		MissingDocModel[] | ContactDocModel[] | GroupedByGP | string
	>
) => {
	const tokenValid = verifyToken(req);
	if (tokenValid) {
		if (req.method === 'GET') {
			const { params } = req.query as { params: string[] };
			const docTypeStrings = params[0].split('__');
			if (docTypeStrings[0] === 'penalties') {
				let seriesDB = '';
				if (docTypeStrings[1] === 'f1') {
					seriesDB = dbNameList.f1_2022_db;
				} else if (docTypeStrings[1] === 'f2') {
					seriesDB = dbNameList.f2_2022_db;
				} else if (docTypeStrings[1] === 'f3') {
					seriesDB = dbNameList.f3_2022_db;
				} else if (docTypeStrings[1] === 'missing-file') {
					seriesDB = dbNameList.other_documents_db;
				} else {
					return res.status(422).json('Series is not supported.');
				}
				try {
					const conn = await connectMongo(seriesDB);
					const query =
						docTypeStrings[2] === 'manual-upload'
							? { manual_upload: true }
							: {};
					const document_list: DecisionOffenceModel[] =
						await conn.models.Decision_Offence.find(query)
							.sort({ createdAt: -1 })
							.exec();
					const groupedByGP: GroupedByGP = document_list.reduce(
						(prev, curr) => {
							prev[curr.grand_prix] = prev[curr.grand_prix] || [];
							prev[curr.grand_prix].push(curr);
							return prev;
						},
						Object.create(null)
					);
					return res.status(200).json(groupedByGP);
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. Failed to get documents.');
				}
			}
			if (docTypeStrings[0] === 'missing-info') {
				try {
					const conn = await connectMongo(dbNameList.other_documents_db);
					const document_list: MissingDocModel[] =
						await conn.models.Missing_Doc.find({}).exec();
					return res.status(200).json(document_list);
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. Failed to get documents.');
				}
			}
			if (docTypeStrings[0] === 'contact-message') {
				try {
					const conn = await connectMongo(dbNameList.other_documents_db);
					const document_list: ContactDocModel[] =
						await conn.models.Contact_Doc.find({}).exec();
					return res.status(200).json(document_list);
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. Failed to get documents.');
				}
			}
		} else if (req.method === 'DELETE') {
			const { params } = req.query as { params: string[] };
			if (!params[1]) {
				return res.status(403).json('Document Id is required.');
			}
			const docTypeStrings = params[0].split('__');
			if (docTypeStrings[0] === 'penalties') {
				let seriesDB = '';
				if (docTypeStrings[1] === 'f1') {
					seriesDB = dbNameList.f1_2022_db;
				} else if (docTypeStrings[1] === 'f2') {
					seriesDB = dbNameList.f2_2022_db;
				} else if (docTypeStrings[1] === 'f3') {
					seriesDB = dbNameList.f3_2022_db;
				} else if (docTypeStrings[1] === 'missing-file') {
					seriesDB = dbNameList.other_documents_db;
				} else {
					return res.status(422).json('Series is not supported.');
				}
				try {
					const conn = await connectMongo(seriesDB);
					await conn.models.Decision_Offence.findByIdAndDelete(
						params[1]
					).exec();
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. File was not deleted.');
				}
			}
			if (docTypeStrings[0] === 'missing-info') {
				try {
					const conn = await connectMongo(dbNameList.other_documents_db);
					await conn.models.Missing_Doc.findByIdAndDelete(params[1]).exec();
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. File was not deleted.');
				}
			}
			if (docTypeStrings[0] === 'contact-message') {
				try {
					const conn = await connectMongo(dbNameList.other_documents_db);
					await conn.models.Contact_Doc.findByIdAndDelete(params[1]).exec();
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. File was not deleted.');
				}
			}
		} else if (req.method === 'PUT') {
			const { params } = req.query as { params: string[] };
			if (!params[1]) {
				return res.status(403).json('Document Id is required.');
			}
			try {
				if (!supportedSeries.some((s) => s === params[0])) {
					return res.status(422).json('Series is not supported.');
				}
				const connOtherDB = await connectMongo(dbNameList.other_documents_db);
				const document = await connOtherDB.models.Decision_Offence.findById(
					params[1]
				).exec();

				const docYear = new Date(document.doc_date).getFullYear().toString();
				const seriesDB = dbNameList[`${params[0]}_${docYear}_db`];

				const connSeriesDB = await connectMongo(seriesDB);
				const docExists = await connSeriesDB.models.Decision_Offence.findOne({
					series: params[0],
					doc_type: document.doc_type,
					doc_name: document.doc_name,
					doc_date: document.doc_date,
					penalty_type: document.penalty_type,
					grand_prix: document.grand_prix,
					weekend: document.weekend,
				});
				if (docExists) {
					return res.status(403).json('Document already exists.');
				}
				await connOtherDB.models.Decision_Offence.findByIdAndDelete(
					params[1]
				).exec();
				document._id = new mongoose.Types.ObjectId();
				document.isNew = true;
				await connSeriesDB.models.Decision_Offence.insertMany(document);
				return res.status(200).end();
			} catch (error: any) {
				return res
					.status(404)
					.json('Unknown server error. Document was not accepted.');
			}
		} else {
			return res.status(405).end();
		}
	} else {
		res.setHeader(
			'Set-Cookie',
			`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
		);
		return res.status(401).end();
	}
};

export default handler;