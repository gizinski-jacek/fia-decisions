// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';
import axios, { AxiosError } from 'axios';
import connectMongo from '../../../../lib/mongo';
import { dbNameList, fiaDomain, fiaPageList } from '../../../../lib/myData';
import { streamToBuffer } from '../../../../lib/streamToBuffer';
import { readPDFPages } from '../../../../lib/pdfReader';
import { transformToDecOffDoc } from '../../../../lib/transformToDecOffDoc';

const handler = async (req: NextApiRequest, res: NextApiResponse<string>) => {
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
			let seriesYearDB = '';
			let seriesYearPageURL = '';
			if (params[0] === 'f1') {
				seriesYearDB = dbNameList[`f1_${params[1]}_db`];
				seriesYearPageURL = fiaPageList[`f1_${params[1]}_page`];
			} else if (params[0] === 'f2') {
				seriesYearDB = dbNameList[`f2_${params[1]}_db`];
				seriesYearPageURL = fiaPageList[`f2_${params[1]}_page`];
			} else if (params[0] === 'f3') {
				seriesYearDB = dbNameList[`f3_${params[1]}_db`];
				seriesYearPageURL = fiaPageList[`f3_${params[1]}_page`];
			} else {
				return res.status(422).json('Unsupported series.');
			}
			if (!seriesYearDB) {
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
					return res.status(200).end();
				}
				console.log(
					`Total number of scrapped documents: ${allDocsHref.length}.`
				);

				const conn = await connectMongo(seriesYearDB);
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
								params[0] as 'f1' | 'f2' | 'f3'
							);
							try {
								const docExists = await conn.models.Decision_Offence.findOne({
									series: params[0],
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
						})
				);
				return res
					.status(200)
					.json(
						'Request to update all files accepted. This might take a while.'
					);
			} catch (error: any) {
				console.log(error.response.config.url);
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