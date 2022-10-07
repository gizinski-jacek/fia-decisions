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
	if (req.method === 'GET') {
		if (!process.env.CRON_JOB_SECRET) {
			throw new Error(
				'Please define CRON_JOB_SECRET environment variable inside .env.local'
			);
		}
		const { authorization } = req.headers;
		if (authorization === `Bearer ${process.env.CRON_JOB_SECRET}`) {
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
				const conn = await connectMongo(seriesYearDB);
				const docList = await conn.models.Decision_Offence.find()
					.sort({ doc_date: -1 })
					.limit(1)
					.exec();
				if (docList.length === 0) {
					try {
						const appURI =
							process.env.NODE_ENV === 'production'
								? process.env.MY_APP_URI
								: process.env.MY_APP_URI_DEV;
						if (!appURI) {
							throw new Error(
								'Please define MY_APP_URI / MY_APP_URI_DEV environment variables inside .env.local'
							);
						}
						await axios.get(
							`${appURI}/api/f1/update-all/decisions-offences/${series}`,
							{
								headers: {
									authorization: `Bearer ${process.env.CRON_JOB_UPDATE_ALL_DOCS_SECRET}`,
								},
								timeout: 15000,
							}
						);
						return res.status(200).end();
					} catch (error: any) {
						if (error instanceof AxiosError) {
							return res
								.status(error?.response?.status || 500)
								.json(error?.response?.data || 'Unknown server error.');
						} else {
							return res.status(500).json('Unknown server error.');
						}
					}
				}
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
					const disallowedDoc = disallowedWordsInDocName.some((str) =>
						fileName.toLowerCase().includes(str)
					);
					if (
						!disallowedDoc &&
						((fileName.includes('decision') && fileName.includes('car')) ||
							(fileName.includes('offence') && fileName.includes('car')))
					) {
						const published = link.querySelector(
							'.date-display-single'
						)?.textContent;
						if (!published) {
							allDocsHref.push(link.href);
							return;
						}
						const dateAndTime = published.split(' ');
						const dateStrings = dateAndTime[0].split('.');
						const reformattedDate =
							'20' +
							dateStrings[2] +
							'/' +
							dateStrings[1] +
							'/' +
							dateStrings[0] +
							' ' +
							dateAndTime[1];
						if (
							new Date(reformattedDate).getTime() + 24 * 60 * 60 * 1000 >=
							new Date(docList[0].doc_date).getTime()
						) {
							allDocsHref.push(link.href);
							return;
						}
					}
				});
				if (allDocsHref.length === 0) {
					return res.status(200).end();
				}
				console.log(`Number of new scraped documents: ${allDocsHref.length}.`);
				await Promise.all(
					allDocsHref.map(
						(href) =>
							new Promise(async (resolve, reject) => {
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
									console.log(href);
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
								} catch (error: any) {
									reject(error);
								}
							})
					)
				);

				console.log('Finished updating.');
				return res.status(200).end();
			} catch (error: any) {
				if (error instanceof AxiosError) {
					return res
						.status(error?.response?.status || 500)
						.json(
							error?.response?.data ||
								'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
						);
				} else {
					return res
						.status(500)
						.json(
							'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
						);
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
