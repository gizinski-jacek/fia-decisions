// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';
import axios, { AxiosError } from 'axios';
import connectMongo from '../../../../lib/mongo';
import { dbNameList, fiaDomain, fiaPageList } from '../../../../lib/myData';
import fs from 'fs';
import { readPDFPagesWithFS } from '../../../../lib/pdfReader';
import { transformToDecOffDoc } from '../../../../lib/transformToDecOffDoc';

const handler = async (req: NextApiRequest, res: NextApiResponse<string>) => {
	// Alternative route for requesting update of all documents.
	// Unlike other routes, this one uses host machines file
	// system to perform the update. Might be more reliable, but slower.
	// Recommend using other routes over this one.
	// Created as an alternative.
	if (req.method === 'GET') {
		if (!process.env.CRON_JOB_UPDATE_ALL_DOCS_SECRET) {
			throw new Error(
				'Please define CRON_JOB_UPDATE_ALL_DOCS_SECRET environment variable inside .env.local'
			);
		}
		const { authorization } = req.headers;
		if (
			authorization ===
			`Bearer ${process.env.CRON_JOB_UPDATE_ALL_DOCS_WITH_FS_SECRET}`
		) {
			const { series } = req.query as { series: string };
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
				console.log(
					`Total number of scrapped documents: ${allDocsHref.length}.`
				);

				const conn = await connectMongo(seriesDB);
				allDocsHref.forEach(
					(href) =>
						new Promise(async (resolve, reject) => {
							let fileName: string;
							if (href.lastIndexOf('/') === -1) {
								fileName = href.slice(0, -4);
							} else {
								fileName = href.slice(href.lastIndexOf('/') + 1).slice(0, -4);
							}
							if (
								fileName.charAt(fileName.length - 2) === '_' &&
								fileName.charAt(fileName.length - 1).match(/[0-9]/)
							) {
								fileName = fileName.slice(0, fileName.length - 3);
							}
							fileName.trim();
							try {
								const responseFile = await axios.get(fiaDomain + href, {
									responseType: 'stream',
									timeout: 15000,
								});
								const file = await responseFile.data.pipe(
									fs.createWriteStream('./pdfreader/' + fileName),
									(error: any) => {
										if (error) {
											fs.unlink('./pdfreader/' + fileName, (error) => {
												if (error) {
													throw error;
												}
											});
										}
									}
								);
								responseFile.data.on('end', async () => {
									try {
										const pdfData = await readPDFPagesWithFS(file.path);
										const transformed = transformToDecOffDoc(
											href,
											pdfData as any,
											series as 'formula1' | 'formula2' | 'formula3'
										);
										const docExists =
											await conn.models.Decision_Offence.findOne({
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
											fs.unlink(file.path, (error) => {
												if (error) {
													throw error;
												}
											});
											resolve(null);
											return;
										}
										await conn.models.Decision_Offence.create({
											...transformed,
											manual_upload: false,
										});
										fs.unlink(file.path, (error) => {
											if (error) {
												throw error;
											}
										});
										resolve(null);
									} catch (error) {
										fs.unlink(file.path, (error) => {
											if (error) {
												throw error;
											}
										});
										reject(error);
									}
								});
							} catch (error) {
								reject(error);
							}
						})
				);

				console.log(
					'Request to update all files using file system accepted. This might take a while.'
				);
				return res
					.status(200)
					.json(
						'Request to update all files using file system accepted. This might take a while.'
					);
			} catch (error) {
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
	return res.status(405).json('Method not supported.');
};

export default handler;
