// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';
import axios, { AxiosError } from 'axios';
import connectMongo from '../../../../lib/mongo';
import {
	dbNameList,
	disallowedWordsInDocName,
	fiaDomain,
	fiaPageList,
	supportedSeries,
} from '../../../../lib/myData';
import { streamToBuffer } from '../../../../lib/streamToBuffer';
import { readPDFPages } from '../../../../lib/pdfReader';
import { transformToDecOffDoc } from '../../../../lib/transformToDecOffDoc';

const handler = async (req: NextApiRequest, res: NextApiResponse<string>) => {
	//
	//	! IMPORTANT !
	//
	//	This endpoint updates all documents for requested series and year.
	//	Since the number of documents may be high the function does not wait
	//	for all the Promises to finish and sends acknowledgement  response after to the client.
	//	It is supposed to be a Background Task, also known as Fire-and-Forget
	//	Requires hosting service providing support for such functions.
	//
	if (req.method === 'GET') {
		if (!process.env.CRON_JOB_UPDATE_ALL_DOCS_SECRET) {
			throw new Error(
				'Please define CRON_JOB_UPDATE_ALL_DOCS_SECRET environment variable inside .env.local'
			);
		}
		const { authorization } = req.headers;
		if (
			authorization === `Bearer ${process.env.CRON_JOB_UPDATE_ALL_DOCS_SECRET}`
		) {
			const { params } = req.query as { params: string[] };
			const series = supportedSeries.find((s) => s === params[0].toLowerCase());
			const year = params[1] || new Date().getFullYear().toString();
			if (!series) {
				return res.status(422).json('Unsupported series.');
			}
			const seriesYearDB = dbNameList[`${series}_${year}_db`];
			const seriesYearPageURL = fiaPageList[`${series}_${year}_page`];
			if (!seriesYearDB || !seriesYearPageURL) {
				return res.status(422).json('Unsupported year.');
			}
			try {
				const responseSite = await axios.get(seriesYearPageURL, {
					timeout: 15000,
				});
				const { document } = new JSDOM(responseSite.data).window;
				const listView: HTMLElement | null =
					document.getElementById('list-view');
				if (!listView) {
					return res.status(500).json('Error getting main page.');
				}
				const mainDoc: HTMLDivElement | null = listView.querySelector(
					'.decision-document-list'
				);
				if (!mainDoc) {
					return res.status(500).json('Error getting document list.');
				}
				const allDocAnchors: NodeList = mainDoc.querySelectorAll('a');
				const allDocsHref: string[] = [];
				allDocAnchors.forEach((link: any) => {
					const fileName = link.href
						.slice(link.href.lastIndexOf('/') + 1)
						.trim()
						.toLowerCase();
					const disallowedDoc = disallowedWordsInDocName.some((str) =>
						fileName.toLowerCase().includes(str)
					);
					if (
						!disallowedDoc &&
						((fileName.includes('decision') && fileName.includes('car')) ||
							(fileName.includes('offence') && fileName.includes('car')))
					) {
						allDocsHref.push(link.href);
					}
				});
				if (allDocsHref.length === 0) {
					return res.status(200).end();
				}
				console.log(
					`Total number of scraped documents: ${allDocsHref.length}.`
				);
				const conn = await connectMongo(seriesYearDB);
				await Promise.all(
					allDocsHref.map(
						(href, i) =>
							new Promise((resolve, reject) =>
								setTimeout(async () => {
									try {
										const responseFile = await axios.get(fiaDomain + href, {
											responseType: 'stream',
											timeout: 15000,
										});
										const fileBuffer = await streamToBuffer(responseFile.data);
										const readPDF = await readPDFPages(fileBuffer);
										const transformed = transformToDecOffDoc(
											href,
											readPDF as any,
											series as 'f1' | 'f2' | 'f3'
										);
										const docExists =
											await conn.models.Decision_Offence.findOne({
												series: transformed.series,
												doc_type: transformed.doc_type,
												doc_name: transformed.doc_name,
												doc_date: transformed.doc_date,
												penalty_type: transformed.penalty_type,
												grand_prix: transformed.grand_prix,
												weekend: transformed.weekend,
											});
										if (docExists) {
											console.log('Document already exists. Skipping.');
											resolve(null);
											return;
										}
										await conn.models.Decision_Offence.create({
											...transformed,
											manual_upload: false,
										});
										resolve(null);
									} catch (error: any) {
										reject(error);
									}
								}, 1000 * i)
							)
					)
				);
				return res
					.status(200)
					.json(
						'Request to update all files accepted. This may take up to several minutes.'
					);
			} catch (error: any) {
				if (error instanceof AxiosError) {
					return res
						.status(error?.response?.status || 500)
						.json(error?.response?.data || 'Unknown server error.');
				} else {
					return res.status(500).json('Unknown server error.');
				}
			}
		} else {
			return res.status(401).end();
		}
	} else {
		return res.status(405).end();
	}
};

export default handler;
