// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongoDb from '../../../lib/mongo';
import mongoose from 'mongoose';
import { supportedSeries } from '../../../lib/myData';
import {
	ContactDocModel,
	PenaltyModel,
	MissingDocModel,
	SeriesDataDocModel,
} from '../../../types/myTypes';
import { verifyToken } from '../../../lib/utils';
import axios from 'axios';

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<
		| PenaltyModel[]
		| MissingDocModel[]
		| ContactDocModel[]
		| SeriesDataDocModel[]
		| string
	>
) => {
	const tokenValid = verifyToken(req);
	if (tokenValid) {
		if (req.method === 'GET') {
			const { params } = req.query as { params: string[] };
			const reqType = params[0];
			const series =
				params[1] &&
				supportedSeries.find(
					(s) => s.toLowerCase() === params[1].toLowerCase()
				);
			const year = params[2];
			const manualUpload = params[3];
			if (reqType === 'missing-info') {
				try {
					const connectionOtherDocsDb = await connectMongoDb('Other_Docs');
					const document_list_missing: MissingDocModel[] =
						await connectionOtherDocsDb.models.Missing_Doc.find().exec();
					return res.status(200).json(document_list_missing);
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. Failed to get documents.');
				}
			}
			if (reqType === 'missing-file') {
				try {
					const connectionOtherDocsDb = await connectMongoDb('Other_Docs');
					const query = manualUpload ? { manual_upload: true } : {};
					const document_list_penalties: PenaltyModel[] =
						await connectionOtherDocsDb.models.Penalty_Doc.find(query)
							.sort({ doc_date: -1 })
							.exec();
					return res.status(200).json(document_list_penalties);
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. Failed to get documents.');
				}
			}
			if (reqType === 'contact-message') {
				try {
					const connectionOtherDocsDb = await connectMongoDb('Other_Docs');
					const document_list_contact: ContactDocModel[] =
						await connectionOtherDocsDb.models.Contact_Doc.find().exec();
					return res.status(200).json(document_list_contact);
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. Failed to get documents.');
				}
			}
			if (reqType === 'auto-update-series-data') {
				try {
					const { NODE_ENV, AUTO_UPDATE_SERIES_DATA_SECRET } = process.env;
					const apiURI =
						NODE_ENV === 'production'
							? process.env.API_WORKER_URI
							: process.env.API_WORKER_URI_DEV;
					if (!AUTO_UPDATE_SERIES_DATA_SECRET || !apiURI) {
						throw new Error(
							'Please define AUTO_UPDATE_SERIES_DATA_SECRET and API_WORKER_URI environment variable inside .env.local'
						);
					}
					await axios.get(`${apiURI}/api/update-series-data`, {
						headers: {
							Authorization: `Bearer ${AUTO_UPDATE_SERIES_DATA_SECRET}`,
						},
					});
					return res.status(202).json('Update request accepted.');
				} catch (error: any) {
					return res.status(404).json('Unknown server error.');
				}
			}
			if (!series) {
				return res.status(422).json('Unsupported Series.');
			}
			if (!year) {
				return res.status(422).json('Must provide Series Year.');
			}
			const connectionSeriesDataDb = await connectMongoDb('Series_Data');
			const document_list_series_data: SeriesDataDocModel[] =
				await connectionSeriesDataDb.models.Series_Data_Doc.find({
					series: series,
				})
					.sort({ year: -1 })
					.exec();
			if (!document_list_series_data.length) {
				return res.status(422).json('No data for selected Series found.');
			}
			const selectedSeriesData = document_list_series_data.find(
				(doc) => parseInt(doc.year) === parseInt(year)
			);
			if (!selectedSeriesData) {
				return res.status(422).json('Unsupported Series Year.');
			}
			if (reqType === 'penalties') {
				try {
					const seriesYearDb = `${
						selectedSeriesData.year
					}_${selectedSeriesData.series.toUpperCase()}_WC_Docs`;
					const connectionSeriesYearDb = await connectMongoDb(seriesYearDb);
					const query = manualUpload ? { manual_upload: true } : {};
					const document_list_penalties: PenaltyModel[] =
						await connectionSeriesYearDb.models.Penalty_Doc.find(query)
							.sort({ doc_date: -1 })
							.exec();
					return res.status(200).json(document_list_penalties);
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. Failed to get documents.');
				}
			}
			const {
				NODE_ENV,
				UPDATE_PENALTIES_NEWEST_SECRET,
				UPDATE_PENALTIES_ALL_SECRET,
			} = process.env;
			const apiURI =
				NODE_ENV === 'production'
					? process.env.API_WORKER_URI
					: process.env.API_WORKER_URI_DEV;
			if (reqType === 'update-penalties-newest') {
				try {
					if (!UPDATE_PENALTIES_NEWEST_SECRET || !apiURI) {
						throw new Error(
							'Please define CRON_JOB_UPDATE_NEWEST_SECRET and API_WORKER_URI environment variable inside .env.local'
						);
					}
					await axios.get(
						`${apiURI}/api/update-penalties-newest/penalties/${selectedSeriesData.series}/${selectedSeriesData.year}`,
						{
							headers: {
								Authorization: `Bearer ${UPDATE_PENALTIES_NEWEST_SECRET}`,
							},
						}
					);
					return res.status(202).json('Update request accepted.');
				} catch (error: any) {
					return res.status(404).json('Unknown server error.');
				}
			}
			if (reqType === 'update-penalties-all') {
				try {
					if (!UPDATE_PENALTIES_ALL_SECRET || !apiURI) {
						throw new Error(
							'Please define CRON_JOB_UPDATE_ALL_SECRET and API_WORKER_URI environment variable inside .env.local'
						);
					}
					await axios.get(
						`${apiURI}/api/update-penalties-all/penalties/${selectedSeriesData.series}/${selectedSeriesData.year}`,
						{
							headers: {
								Authorization: `Bearer ${UPDATE_PENALTIES_ALL_SECRET}`,
							},
						}
					);
					return res.status(202).json('Update request accepted.');
				} catch (error: any) {
					return res.status(404).json('Unknown server error.');
				}
			}
			return res.status(405).end();
		} else if (req.method === 'DELETE') {
			const { params } = req.query as { params: string[] };
			const reqType = params[0];
			const series =
				params[1] &&
				supportedSeries.find(
					(s) => s.toLowerCase() === params[1].toLowerCase()
				);
			const docId = params[2];
			const year = params[3];
			if (!docId) {
				return res.status(403).json('Document Id is required.');
			}
			if (reqType === 'missing-info') {
				try {
					const connectionOtherDocsDb = await connectMongoDb('Other_Docs');
					await connectionOtherDocsDb.models.Missing_Doc.findByIdAndDelete(
						docId
					).exec();
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. File was not deleted.');
				}
			}
			if (reqType === 'contact-message') {
				try {
					const connectionOtherDocsDb = await connectMongoDb('Other_Docs');
					await connectionOtherDocsDb.models.Contact_Doc.findByIdAndDelete(
						docId
					).exec();
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. File was not deleted.');
				}
			}
			if (reqType === 'series-data') {
				try {
					const connectionSeriesDataDb = await connectMongoDb('Series_Data');
					await connectionSeriesDataDb.models.Series_Data_Doc.findByIdAndDelete(
						docId
					).exec();
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. Data was not deleted.');
				}
			}
			if (!series) {
				return res.status(422).json('Unsupported Series.');
			}
			if (!year) {
				return res.status(422).json('Must provide a Year.');
			}
			if (reqType === 'missing-file') {
				try {
					const connectionOtherDocsDb = await connectMongoDb('Other_Docs');
					await connectionOtherDocsDb.models.Penalty_Doc.findByIdAndDelete(
						docId
					).exec();
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. File was not deleted.');
				}
			}
			if (reqType === 'penalties') {
				try {
					const seriesYearDb = `${year}_${series.toUpperCase()}_WC_Docs`;
					const connectionSeriesYearDb = await connectMongoDb(seriesYearDb);
					await connectionSeriesYearDb.models.Penalty_Doc.findByIdAndDelete(
						docId
					).exec();
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. File was not deleted.');
				}
			}
		} else if (req.method === 'PUT') {
			const { params } = req.query as { params: string[] };
			const [reqType, docId] = params;
			if (!docId) {
				return res.status(403).json('Document Id is required.');
			}
			if (reqType === 'accept-document') {
				try {
					const cconnectionOtherDocs = await connectMongoDb('Other_Docs');
					const document =
						await cconnectionOtherDocs.models.Penalty_Doc.findById(
							docId
						).exec();
					const docYear = new Date(document.doc_date).getFullYear();
					const seriesYearDb = `${docYear}_${document.series.toUpperCase()}_WC_Docs`;
					const connectionSeriesYearDb = await connectMongoDb(seriesYearDb);
					const docExists =
						await connectionSeriesYearDb.models.Penalty_Doc.findOne({
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
					await cconnectionOtherDocs.models.Penalty_Doc.findByIdAndDelete(
						docId
					).exec();
					document._id = new mongoose.Types.ObjectId();
					document.isNew = true;
					await connectionSeriesYearDb.models.Penalty_Doc.create(document);
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
