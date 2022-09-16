// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';
const { PdfReader } = require('pdfreader');
import axios, { AxiosError } from 'axios';
import connectMongo from '../../../../lib/mongo';
import { Stream } from 'stream';
import { transformToDecOffDoc } from '../../../../lib/transformToDecOffDoc';
import { dbNameList, fiaDomain, fiaPageList } from '../../../../lib/myData';
import { streamToBuffer } from '../../../../lib/streamToBuffer';
import { readPDFPages } from '../../../../lib/readPDFPages';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		if (!process.env.CRON_JOB_UPDATE_ALL_DOCS_SECRET) {
			throw new Error(
				'Please define CRON_JOB_UPDATE_ALL_DOCS_SECRET environment variables inside .env.local'
			);
		}
		const { authorization } = req.headers;
		if (
			authorization === `Bearer ${process.env.CRON_JOB_UPDATE_ALL_DOCS_SECRET}`
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
				return res.status(401).json('Unsupported series');
			}
			try {
				const responseSite = await axios.get(seriesPageURL);
				const { document } = new JSDOM(responseSite.data).window;
				const listView: HTMLElement | null =
					document.getElementById('list-view');
				if (!listView) {
					return res.status(404).json('Error getting main page');
				}
				const mainDoc: HTMLDivElement | null = listView.querySelector(
					'.decision-document-list'
				);
				if (!mainDoc) {
					return res.status(404).json('Error getting list');
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
					return res.status(200).json({ success: true });
				}

				const conn = await connectMongo(seriesDB);
				await new Promise((resolve, reject) => {
					allDocsHref.forEach(async (href) => {
						const responseFile = await axios.get(fiaDomain + href, {
							responseType: 'stream',
						});
						const fileBuffer = await streamToBuffer(responseFile.data);
						const readPDF = await readPDFPages(fileBuffer);
						const transformed = transformToDecOffDoc(
							href,
							readPDF as any,
							series as 'formula1' | 'formula2' | 'formula3'
						);
						try {
							await conn.models.Decision_Offence.findOneAndUpdate(
								{
									doc_type: transformed.doc_type,
									doc_name: transformed.doc_name,
									doc_date: transformed.doc_date,
									penalty_type: transformed.penalty_type,
									grand_prix: transformed.grand_prix,
								},
								{ $setOnInsert: { ...transformed } },
								{ timestamps: true, upsert: true }
							);
							resolve(null);
						} catch (error) {
							reject(error);
						}
					});
				});
				return res.status(200).json({ success: true });
			} catch (error) {
				if (error instanceof AxiosError) {
					return res
						.status(error?.response?.status || 404)
						.json(error?.response?.data || 'Unknown server error');
				} else {
					return res.status(404).json('Unknown server error');
				}
			}
		} else {
			return res.status(401).json({ success: false });
		}
	}
	return res.status(404).json({ success: false });
};

export default handler;
