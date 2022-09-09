// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import PDFParser from 'pdf2json';
import axios, { AxiosError } from 'axios';
import { transformPDFData } from '../../../../lib/transformPDFData';
import connectMongo from '../../../../lib/mongo';
import Decision from '../../../../models/decision';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		try {
			const fiaF1PageUrl =
				'https://www.fia.com/documents/season/season-2022-2005/championships/fia-formula-one-world-championship-14';
			const fiaDomain = 'https://www.fia.com';
			const responseSite = await axios.get(fiaF1PageUrl);
			const { document } = new JSDOM(responseSite.data).window;
			const listView = document.getElementById('list-view');
			if (!listView) {
				const error = new Error('Error getting page');
				return res.status(401).json(error);
			}
			const mainDoc = listView.querySelector('.decision-document-list');
			const allGPList = mainDoc!.querySelectorAll('.event-wrapper');
			const pdfParser = new PDFParser();
			pdfParser.on('pdfParser_dataError', (errData) =>
				console.error(errData.parserError)
			);
			pdfParser.on('pdfParser_dataReady', async (pdfData) => {
				const transformed = transformPDFData(pdfData);
				const newDecision = new Decision({
					doc_type: 'decision', // Temporary
					grand_prix: gpName,
					...transformed,
				});
				try {
					await connectMongo();
					await newDecision.save();
					fs.unlink(
						'./pdf2json/gpPDFDocs/' +
							fileURL?.slice(fileURL.lastIndexOf('/') + 1),
						(error) => {
							if (error) throw error;
						}
					);
					return res.status(200).json({ success: true });
				} catch (error) {
					console.log(error);
					return res.status(404).json('Unknown error');
				}
			});
			const fileURL = allGPList[1].querySelectorAll('a')[3]?.href;
			const responseFile = await axios.get(fiaDomain + fileURL, {
				responseType: 'stream',
			});
			const writeStream = fs.createWriteStream(
				'./pdf2json/gpPDFDocs/' + fileURL?.slice(fileURL.lastIndexOf('/') + 1)
			);
			writeStream.on('error', (error) => {
				console.log(error);
			});
			const file = responseFile.data.pipe(writeStream, (error) => {
				if (error) {
					fs.unlink(
						'./pdf2json/gpPDFDocs/' +
							fileURL?.slice(fileURL.lastIndexOf('/') + 1),
						(error) => {
							if (error) throw error;
						}
					);
				}
			});
			const gpName = file.path
				.slice(file.path.lastIndexOf('/') + 1, file.path.indexOf('-'))
				.trim();
			responseFile.data.on('end', () => pdfParser.loadPDF(file.path));
			// allGPList!.forEach(async (gp) => {
			// 	const pdfParser = new PDFParser();
			// 	const gpDocURL = fiaDomain + gp.querySelector('a')?.href;
			// 	const pdfPipe = pdfParser.loadPDF(gpDocURL);
			// 	console.log(pdfPipe);
			// });
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
	return res.status(404);
};

export default handler;
