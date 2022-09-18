// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';
import axios, { AxiosError } from 'axios';
import connectMongo from '../../../../lib/mongo';
import { dbNameList, fiaDomain, fiaPageList } from '../../../../lib/myData';
import { streamToBuffer } from '../../../../lib/streamToBuffer';
import { readPDFPages } from '../../../../lib/pdfReader';
import { transformToDecOffDoc } from '../../../../lib/transformToDecOffDoc';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		if (!process.env.CRON_JOB_UPDATE_ALL_DOCS_SECRET) {
			throw new Error(
				'Please define CRON_JOB_UPDATE_ALL_DOCS_SECRET environment variables inside .env.local'
			);
		}
		const { authorization } = req.headers;
		if (
			authorization ===
			`Bearer ${process.env.CRON_JOB_UPDATE_ALL_DOCS_WITH_FS_SECRET}`
		) {
			const { series } = req.query;
			let seriesDB = '';
			let seriesPageURL = '';
			if (series === 'formula1') {
				seriesDB = dbNameList.f1_2022_db;
				seriesPageURL = fiaPageList.f1_2022_page;
			} else if (series === 'formula2') {
				seriesDB = dbNameList.f2_2022_db;
				seriesPageURL = fiaPageList.f2_2022_page;
			} else if (series === 'formula3') {
				seriesDB = dbNameList.f3_2022_db;
				seriesPageURL = fiaPageList.f3_2022_page;
			} else {
				return res.status(422).json('Unsupported series.');
			}
			try {
				const responseSite = await axios.get(seriesPageURL, { timeout: 15000 });
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
					return res.status(500).json('Error getting list.');
				}
				const allDocAnchors: NodeList = mainDoc.querySelectorAll('a');
				const allDocsHref: string[] = [];

				allDocAnchors.forEach((link: any) => {
					const fileName = link.href
						.slice(link.href.lastIndexOf('/') + 1)
						.trim()
						.toLowerCase();

					const disallowedWordsInDocName = [
						'reprimand',
						'withdrawal',
						'schedule',
						'set a time',
						'permission to start',
						'protest lodged',
						'cover',
						'alledgedly score',
						'right of review',
						'petition to review',
					];
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
					return res.status(200).json('Documents are up to date.');
				}

				const conn = await connectMongo(seriesDB);
				// await Promise.all(
				// 	allDocsHref.map(
				// 		(href) =>
				// 			new Promise(async (resolve, reject) => {
				// 				const responseFile = await axios.get(fiaDomain + href, {
				// 					responseType: 'stream',
				// 					timeout: 15000,
				// 				});
				// 				const fileBuffer = await streamToBuffer(responseFile.data);
				// 				const readPDF = await readPDFPages(fileBuffer);
				// 				const transformed = transformToDecOffDoc(
				// 					href,
				// 					readPDF as any,
				// 					series as 'formula1' | 'formula2' | 'formula3'
				// 				);
				// 				try {
				// 					const docExists = await conn.models.Decision_Offence.findOne({
				// 						series: series,
				// 						doc_type: transformed.doc_type,
				// 						doc_name: transformed.doc_name,
				// 						doc_date: transformed.doc_date,
				// 						penalty_type: transformed.penalty_type,
				// 						grand_prix: transformed.grand_prix,
				// 						weekend: transformed.weekend,
				// 					});
				// 					if (docExists) {
				// 						console.log('Document already exists. Skipping.');
				//						resolve(null);
				// 						return;
				// 					}
				// 					await conn.models.Decision_Offence.create({
				// 						...transformed,
				// 						manual_upload: false,
				// 					});
				// 					resolve(null);
				// 				} catch (error) {
				// 					reject(error);
				// 				}
				// 			})
				// 	)
				// );
				allDocsHref.forEach(
					(href) =>
						new Promise(async (resolve, reject) => {
							const responseFile = await axios.get(fiaDomain + href, {
								responseType: 'stream',
								timeout: 15000,
							});
							const fileBuffer = await streamToBuffer(responseFile.data);
							const readPDF = await readPDFPages(fileBuffer);
							const transformed = transformToDecOffDoc(
								href,
								readPDF as any,
								series as 'formula1' | 'formula2' | 'formula3'
							);
							try {
								const docExists = await conn.models.Decision_Offence.findOne({
									series: series,
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
							} catch (error) {
								reject(error);
							}
						})
				);

				console.log(
					'Request to update all files accepted. This might take a while.'
				);
				return res
					.status(200)
					.json(
						'Request to update all files accepted. This might take a while.'
					);
			} catch (error) {
				console.log(error);
				if (error instanceof AxiosError) {
					return res
						.status(error?.response?.status || 500)
						.json(error?.response?.data || 'Unknown server error.');
				} else {
					return res.status(500).json('Unknown server error.');
				}
			}
		} else {
			return res.status(401);
		}
	}
	return res.status(404);
};

export default handler;
