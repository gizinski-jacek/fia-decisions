// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';
const { PdfReader } = require('pdfreader');
import axios, { AxiosError } from 'axios';
import connectMongo from '../../../../lib/mongo';
import Decision from '../../../../models/decision';
import { Stream } from 'stream';
import { transformDataToDecisionObj } from '../../../../lib/transformDataToDecisionObj';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		if (req.query.update === 'decisions-offences') {
			try {
				const { authorization } = req.headers;
				if (
					authorization ===
					`Bearer ${process.env.CRON_JOB_UPDATE_ALL_DOCS_SECRET}`
				) {
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

						const disallowedWordsInDocName = [
							'reprimand',
							'withdrawal',
							'schedule',
							'set a time',
							'permission to start',
							'protest lodged',
							'cover',
						];
						const disallowedDoc = disallowedWordsInDocName.some((str) =>
							fileName.includes(str)
						);

						if (
							!disallowedDoc &&
							((fileName.includes('decision') && fileName.includes('car')) ||
								(fileName.includes('offence') && fileName.includes('car')))
						) {
							allDocsHref.push(link.href);
						}
					});

					const streamToBuffer = async (stream: Stream): Promise<Buffer> => {
						return new Promise<Buffer>((resolve, reject) => {
							const buffer = Array<any>();
							stream.on('data', (chunk) => buffer.push(chunk));
							stream.on('end', () => resolve(Buffer.concat(buffer)));
							stream.on('error', (err) =>
								reject(`Error converting stream - ${err}`)
							);
						});
					};

					const readPDFPages = (buffer: Buffer) => {
						const reader = new PdfReader();
						return new Promise((resolve, reject) => {
							const stringsArray: string[] = [];
							reader.parseBuffer(buffer, (err: any, item: any) => {
								if (err) {
									reject(err);
								} else if (!item) {
									resolve(stringsArray);
								} else if (item.text) {
									stringsArray.push(item.text.normalize('NFKD'));
								}
							});
						});
					};

					await connectMongo();

					await new Promise((resolve, reject) => {
						allDocsHref.forEach(async (href) => {
							const responseFile = await axios.get(fiaDomain + href, {
								responseType: 'stream',
							});
							const fileBuffer = await streamToBuffer(responseFile.data);
							const readPDF = await readPDFPages(fileBuffer);
							const transformed = transformDataToDecisionObj(
								href,
								readPDF as any
							);
							try {
								await Decision.findOneAndUpdate(
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
