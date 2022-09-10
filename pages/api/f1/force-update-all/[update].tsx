// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import PDFParser from 'pdf2json';
import axios, { AxiosError } from 'axios';
import { transformPDFData } from '../../../../lib/transformPDFData';
import connectMongo from '../../../../lib/mongo';
import Decision from '../../../../models/decision';
import { TransformedPDFData } from '../../../../types/myTypes';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		if (req.query.update === 'decisions-offences') {
			try {
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
				allDocAnchors.forEach((link: HTMLAnchorElement) => {
					const fileName = link.href
						.slice(link.href.lastIndexOf('/') + 1)
						.trim()
						.toLowerCase();
					if (
						!fileName.includes('reprimand') &&
						(fileName.includes('decision') || fileName.includes('offence'))
					) {
						allDocsHref.push(link.href);
					}
				});
				await connectMongo();
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
							const responseFile = await axios.get(fiaDomain + href, {
								responseType: 'stream',
							});
							const file = await responseFile.data.pipe(
								fs.createWriteStream('./pdf2json/gpPDFDocs/' + fileName),
								(error) => {
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
							pdfParser.on('pdfParser_dataError', (errData) =>
								console.error(errData.parserError)
							);
							const transformedData: TransformedPDFData = await new Promise(
								(res, rej) =>
									pdfParser.on('pdfParser_dataReady', (pdfData) => {
										res(transformPDFData(pdfData));
									})
							);
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
							let penalty = 'none';
							penaltiesArray.forEach((v) => {
								if (
									transformedData.content.Decision[0].toLowerCase().includes(v)
								) {
									penalty = v;
									return;
								}
							});
							const newDecision = {
								doc_type: docType,
								doc_name: fileName,
								grand_prix: gpName,
								penalty: penalty,
								...transformedData,
							};
							await Decision.findOneAndUpdate(
								{ doc_type: docType, doc_name: fileName, grand_prix: gpName },
								{ $setOnInsert: { ...newDecision } },
								{ timestamps: false, upsert: true }
							);
							fs.unlink('./pdf2json/gpPDFDocs/' + fileName, (error) => {
								if (error) {
									throw error;
								}
							});
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
						.json(error?.response?.data || 'Unknown error');
				} else {
					return res.status(404).json('Unknown error');
				}
			}
		}
		if (req.query.update === 'other') {
		}
	}
	return res.status(404);
};

export default handler;
