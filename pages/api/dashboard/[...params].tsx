// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../lib/mongo';
import mongoose from 'mongoose';
import { dbNameList } from '../../../lib/myData';
import {
	ContactDocModel,
	PenaltyModel,
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
			const docType = params[0];
			const series = params[1];
			const year = params[2] || new Date().getFullYear().toString();
			const manualUpload = params[3];
			if (docType === 'penalties') {
				if (!series) {
					return res.status(422).json('Unsupported series.');
				}
				const seriesYearDB = dbNameList[`${series}_${year}_db`];
				if (!seriesYearDB) {
					return res.status(422).json('Unsupported year.');
				}
				try {
					const conn = await connectMongo(seriesYearDB);
					const query = manualUpload ? { manual_upload: true } : {};
					const document_list: PenaltyModel[] =
						await conn.models.Penalty_Doc.find(query)
							.sort({ doc_date: -1 })
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
			if (docType === 'missing-info') {
				try {
					const conn = await connectMongo(dbNameList.other_documents_db);
					const document_list: MissingDocModel[] =
						await conn.models.Missing_Doc.find().exec();
					return res.status(200).json(document_list);
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. Failed to get documents.');
				}
			}
			if (docType === 'missing-file') {
				try {
					const conn = await connectMongo(dbNameList.other_documents_db);
					const query = manualUpload ? { manual_upload: true } : {};
					const document_list: PenaltyModel[] =
						await conn.models.Penalty_Doc.find(query)
							.sort({ doc_date: -1 })
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
			if (docType === 'contact-message') {
				try {
					const conn = await connectMongo(dbNameList.other_documents_db);
					const document_list: ContactDocModel[] =
						await conn.models.Contact_Doc.find().exec();
					return res.status(200).json(document_list);
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. Failed to get documents.');
				}
			}
		} else if (req.method === 'POST') {
			//
			//	Create new doc from manually inserted data.
			//
		} else if (req.method === 'DELETE') {
			const { params } = req.query as { params: string[] };
			const docType = params[0];
			const series = params[1];
			const docId = params[2];
			const year = params[3];
			if (!docId) {
				return res.status(403).json('Document Id is required.');
			}
			if (docType === 'penalties') {
				let seriesYearDB: string;
				if (series === 'missing-file') {
					seriesYearDB = dbNameList.other_documents_db;
				} else {
					seriesYearDB = dbNameList[`${series}_${year}_db`];
				}
				if (!seriesYearDB) {
					return res.status(422).json('Unsupported year.');
				}
				try {
					const conn = await connectMongo(seriesYearDB);
					await conn.models.Penalty_Doc.findByIdAndDelete(docId).exec();
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. File was not deleted.');
				}
			}
			if (docType === 'missing-info') {
				try {
					const conn = await connectMongo(dbNameList.other_documents_db);
					await conn.models.Missing_Doc.findByIdAndDelete(docId).exec();
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. File was not deleted.');
				}
			}
			if (docType === 'contact-message') {
				try {
					const conn = await connectMongo(dbNameList.other_documents_db);
					await conn.models.Contact_Doc.findByIdAndDelete(docId).exec();
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. File was not deleted.');
				}
			}
		} else if (req.method === 'PUT') {
			const { params } = req.query as { params: string[] };
			const [updateType, docId] = params;
			if (updateType === 'accept-document') {
				if (!docId) {
					return res.status(403).json('Document Id is required.');
				}
				try {
					const connOtherDB = await connectMongo(dbNameList.other_documents_db);
					const document = await connOtherDB.models.Penalty_Doc.findById(
						docId
					).exec();
					const docYear = new Date(document.doc_date).getFullYear().toString();
					const seriesDB = dbNameList[`${document.series}_${docYear}_db`];
					const connSeriesDB = await connectMongo(seriesDB);
					const docExists = await connSeriesDB.models.Penalty_Doc.findOne({
						series: document.series,
						doc_type: document.doc_type,
						doc_name: document.doc_name,
						doc_date: document.doc_date,
						penalty_type: document.penalty_type,
						grand_prix: document.grand_prix,
						weekend: document.weekend,
						incident_title: document.incident_title,
					});
					if (docExists) {
						return res.status(403).json('Document already exists.');
					}
					await connOtherDB.models.Penalty_Doc.findByIdAndDelete(docId).exec();
					document._id = new mongoose.Types.ObjectId();
					document.isNew = true;
					await connSeriesDB.models.Penalty_Doc.insertMany(document);
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. Document was not accepted.');
				}
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
