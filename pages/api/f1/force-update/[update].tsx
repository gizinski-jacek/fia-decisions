// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';
import fs from 'fs';
// import PDFParser from 'pdf2json';
const PDFParser = require('pdf2json');
import axios, { AxiosError } from 'axios';
import { transformPDFData } from '../../../../lib/transformPDFData';
import connectMongo from '../../../../lib/mongo';
import Decision from '../../../../models/decision';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		if (req.query.update === 'decisions-offences') {
			try {
				const { authorization } = req.headers;
				if (authorization === `Bearer ${process.env.CRON_JOB_SECRET}`) {
					await connectMongo();
					const docList = await Decision.find({})
						.sort({ doc_date: -1 })
						.limit(1)
						.exec();
					if (docList.length === 0) {
						try {
							if (
								!process.env.node_env &&
								!process.env.MY_APP_URI &&
								!process.env.MY_APP_URI_DEV
							) {
								throw new Error(
									'Please define node_env, MY_APP_URI and MY_APP_URI_DEV environment variables inside .env.local'
								);
							}
							res.status(200).json({ success: true });
							await axios.get(
								(process.env.node_env as string) === 'production'
									? (process.env.MY_APP_URI as string)
									: (process.env.MY_APP_URI_DEV as string) +
											'/api/f1/force-update-all/decisions-offences'
							);
							return;
						} catch (error) {
							if (error instanceof AxiosError) {
								return res
									.status(error?.response?.status || 404)
									.json(error?.response?.data || 'Unknown error');
							} else {
								return res.status(404).json('Unknown error');
							}
						}
					}
					const fiaF1PageUrl =
						'https://www.fia.com/documents/championships/fia-formula-one-world-championship-14/season/season-2022-2005';
					const fiaDomain = 'https://www.fia.com';
					const responseSite = await axios.get(fiaF1PageUrl);
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
						if (
							!fileName.includes('reprimand') &&
							(fileName.includes('decision') || fileName.includes('offence'))
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
							if (new Date(reformattedDate) >= docList[0].doc_date) {
								allDocsHref.push(link.href);
								return;
							}
						}
					});
					await new Promise((resolve, reject) => {
						allDocsHref.forEach(async (href) => {
							let fileName = href.slice(href.lastIndexOf('/') + 1).slice(0, -4);
							if (
								fileName.charAt(fileName.length - 3) === '_' &&
								fileName.charAt(fileName.length - 2) === '0'
							) {
								fileName = fileName.slice(fileName.length - 3);
							}
							const docType = fileName
								.slice(
									fileName.indexOf('-') + 1,
									fileName.indexOf('-', fileName.indexOf('-') + 1)
								)
								.trim();
							const gpName = fileName.slice(0, fileName.indexOf('-')).trim();
							try {
								// Slow down downloading to avoid PDF file saving errors.
								const responseFile = await axios.get(fiaDomain + href, {
									responseType: 'stream',
								});
								const file = await responseFile.data.pipe(
									fs.createWriteStream('./pdf2json/gpPDFDocs/' + fileName),
									(error: any) => {
										if (error) {
											fs.unlink('./pdf2json/gpPDFDocs/' + fileName, (error) => {
												if (error) {
													throw error;
												}
											});
										}
									}
								);
								responseFile.data.on('end', () => pdfParser.loadPDF(file.path));
								const pdfParser = new PDFParser();
								pdfParser.on('pdfParser_dataError', (errData: any) =>
									console.error(errData.parserError)
								);
								const pdfData = await new Promise((res, rej) =>
									pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
										res(pdfData);
									})
								);
								const transformedData: any = transformPDFData(pdfData);
								const penaltiesArray = [
									'time',
									'grid',
									'fine',
									'disqualified',
									'warning',
									'drive through',
									'pit lane',
									'reprimand',
								];
								let penalty_type = 'none';
								penaltiesArray.forEach((v) => {
									if (
										transformedData.incident_info.Decision[0]
											.toLowerCase()
											.includes(v)
									) {
										penalty_type = v;
										return;
									}
								});
								const docDate = new Date(
									transformedData.document_info.Date +
										' ' +
										transformedData.document_info.Time
								);
								const newDecision = {
									doc_type: docType,
									doc_name: fileName,
									doc_date: docDate,
									grand_prix: gpName,
									penalty_type: penalty_type,
									...transformedData,
								};
								await Decision.findOneAndUpdate(
									{ doc_type: docType, doc_name: fileName, grand_prix: gpName },
									{ $setOnInsert: { ...newDecision } },
									{ timestamps: true, upsert: true }
								);
								fs.unlink('./pdf2json/gpPDFDocs/' + fileName, (error) => {
									if (error) {
										throw error;
									}
								});
								resolve(null);
							} catch (error) {
								fs.unlink('./pdf2json/gpPDFDocs/' + fileName, (error) => {
									if (error) {
										throw error;
									}
								});
								reject(error);
							}
						});
					});
					return res.status(200).json({ success: true });
				} else {
					return res.status(401).json({ success: false });
				}
			} catch (error) {
				if (error instanceof AxiosError) {
					return res
						.status(error?.response?.status || 404)
						.json(error?.response?.data || 'Unknown error');
				} else {
					return res.status(404).json('Unknown error');
				}
			}
		}
		if (req.query.update === 'other') {
		}
	}
	return res.status(404).json({ success: false });
};

export default handler;
