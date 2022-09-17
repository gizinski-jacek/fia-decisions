// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../lib/mongo';
import { dbNameList } from '../../../lib/myData';
import multiparty from 'multiparty';
import { parseFields, parseFile } from '../../../lib/multiparty';
import { streamToBuffer } from '../../../lib/streamToBuffer';
import { readPDFPages } from '../../../lib/readPDFPages';
import { transformToDecOffDoc } from '../../../lib/transformToDecOffDoc';

export const config = {
	api: {
		bodyParser: false,
		externalResolver: true,
	},
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'POST') {
		if (req.query.data === 'doc-file') {
			try {
				const { series } = req.query;
				let seriesDB = '';
				if (series === 'formula1') {
					seriesDB = dbNameList.f1_2022_db;
				} else if (series === 'formula2') {
					seriesDB = dbNameList.f2_2022_db;
				} else if (series === 'formula3') {
					seriesDB = dbNameList.f3_2022_db;
				} else {
					return res.status(422).json('Unsupported series.');
				}
				// Currently not working when imported, looking for fix...
				// const file = await parseFile(req);

				const form = new multiparty.Form();

				// Errors may be emitted
				// Note that if you are listening to 'part' events, the same error may be
				// emitted from the `form` and the `part`.
				form.on('error', (error: any) => {
					console.log('Error parsing form: ' + error.stack);
				});

				// Parts are emitted when parsing the form
				form.on('part', async (part) => {
					// You *must* act on the part by reading it
					// NOTE: if you want to ignore it, just call "part.resume()"
					if (part.filename === undefined) {
						// filename is not defined when this is a field and not a file
						// console.log('got field named ' + part.name);
						// ignore field's content
						part.resume();
					}
					if (part.filename !== undefined) {
						// filename is defined when this is a file
						// console.log('got file named ' + part.name);
						// ignore file's content here
						part.resume();
					}
					part.on('error', (error: any) => {
						// decide what to do
						console.log('got error on part ' + error);
					});

					const fileBuffer = await streamToBuffer(part);
					const pdfData = await readPDFPages(fileBuffer);
					const transformed = transformToDecOffDoc(
						part.filename,
						pdfData as any,
						req.query.series as 'formula1' | 'formula2' | 'formula3'
					);
					try {
						const conn = await connectMongo(seriesDB);
						const docExists = await conn.models.Decision_Offence.findOne({
							doc_type: transformed.doc_type,
							doc_name: transformed.doc_name,
							doc_date: transformed.doc_date,
							penalty_type: transformed.penalty_type,
							grand_prix: transformed.grand_prix,
						});
						if (docExists) {
							return res
								.status(403)
								.json(
									'Document already exists. If you believe this to be mistake please use Contact form to let me know about this issue.'
								);
						}
						await conn.models.Decision_Offence.create({
							...transformed,
							manual_upload: true,
						});
						return res.status(200).json('Document saved.');
					} catch (error) {
						console.log(error);
						return res.status(500).json('Unknown server error.');
					}
				});

				// Close emitted after form parsed
				form.on('close', function () {
					console.log('Upload completed!');
				});

				// Parse req
				form.parse(req);
			} catch (error) {
				return res.status(500).json('Unknown server error.');
			}
		}
		if (req.query.data === 'doc-data') {
			try {
				const fields = await parseFields(req);
				if (!fields.series && !fields.title && !fields.url) {
					return res
						.status(40)
						.json('Must provide Series and at least Title or Link / URL.');
				}
				const conn = await connectMongo('otherDocs');
				const newReport = new conn.models.Missing_Doc(fields);
				await newReport.save();
				return res.status(200).json('Document saved.');
			} catch (error) {
				console.log(error);
				return res.status(500).json('Unknown server error.');
			}
		}
		if (req.query.data === 'contact') {
			try {
				const fields = await parseFields(req);
				if (!fields.email && !fields.message) {
					return res.status(422).json('Must provide an Email and a Message.');
				}
				const conn = await connectMongo('otherDocs');
				const newReport = new conn.models.Contact_Doc(fields);
				await newReport.save();
				return res.status(200).json('Document saved.');
			} catch (error) {
				console.log(error);
				return res.status(500).json('Unknown server error.');
			}
		}
	}
	return res.status(404);
};

export default handler;
