// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongoDb from '../../../lib/mongo';
import { supportedSeries } from '../../../lib/myData';
import multiparty from 'multiparty';
import { parseFields } from '../../../lib/multiparty';
import { streamToBuffer } from '../../../lib/streamToBuffer';
import { readPDFPages } from '../../../lib/pdfReader';
import { createPenaltyDocument } from '../../../lib/transformToPenaltyDoc';
import yupValidation, {
	contactFormValidationSchema,
	loginFormValidationSchema,
	informationFormValidationSchema,
	seriesDataFormValidationSchema,
} from '../../../lib/yup';
import { SeriesDataFormValues } from '../../../types/myTypes';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../../../lib/utils';

export const config = {
	api: {
		bodyParser: false,
		externalResolver: true,
	},
};

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<string | string[]>
) => {
	if (req.method === 'POST') {
		const { params } = req.query as { params: string[] };
		const [form, series] = params;
		if (form === 'file') {
			try {
				const supported = supportedSeries.find(
					(s) => s.toLowerCase() === series.toLowerCase()
				);
				if (!supported) {
					return res.status(422).json('Unsupported Series.');
				}
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
					if (!part) {
						return res.status(422).json('Must select a file.');
					}
					if (part.headers['content-type'] !== 'application/pdf') {
						return res.status(422).json('Only PDF files are allowed.');
					}
					if (part.byteCount > 1000000) {
						return res.status(422).json('File is too big, max size 1MB.');
					}
					try {
						const fileBuffer = await streamToBuffer(part);
						const pdfData = await readPDFPages(fileBuffer);
						const transformed = createPenaltyDocument(
							part.filename,
							pdfData as any,
							series as 'f1' | 'f2' | 'f3'
						);
						const connectionOtherDocsDb = await connectMongoDb('Other_Docs');
						await connectionOtherDocsDb.models.Penalty_Doc.create({
							...transformed,
							manual_upload: true,
						});
						return res.status(200).end();
					} catch (error: any) {
						return res
							.status(500)
							.json(
								'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
							);
					}
				});
				form.on('close', function () {
					console.log('Upload completed!');
				});
				// Parse req
				form.parse(req);
				return res.status(200).end();
			} catch (error: any) {
				return res
					.status(500)
					.json(
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
					);
			}
		}
		if (form === 'info') {
			try {
				const fields = await parseFields(req);
				const { errors }: { errors: string[] } = await yupValidation(
					informationFormValidationSchema,
					fields
				);
				if (errors) {
					return res.status(422).json(errors);
				}
				const connectionOtherDocsDb = await connectMongoDb('Other_Docs');
				const newDocument = new connectionOtherDocsDb.models.Missing_Doc(
					fields
				);
				await newDocument.save();
				return res.status(200).end();
			} catch (error: any) {
				return res
					.status(500)
					.json(
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
					);
			}
		}
		if (form === 'contact') {
			try {
				const fields = await parseFields(req);
				const { errors } = await yupValidation(
					contactFormValidationSchema,
					fields
				);
				if (errors) {
					return res.status(422).json(errors);
				}
				const connectionOtherDocsDb = await connectMongoDb('Other_Docs');
				const newDocument = new connectionOtherDocsDb.models.Contact_Doc(
					fields
				);
				await newDocument.save();
				return res.status(200).end();
			} catch (error: any) {
				return res
					.status(500)
					.json(
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
					);
			}
		}
		if (form === 'dashboard-sign-in') {
			const {
				DASHBOARD_ACCESS_PASSWORD,
				JWT_PAYLOAD_STRING,
				JWT_STRATEGY_SECRET,
			} = process.env;

			try {
				if (
					!DASHBOARD_ACCESS_PASSWORD ||
					!JWT_PAYLOAD_STRING ||
					!JWT_STRATEGY_SECRET
				) {
					throw new Error(
						'Please define DASHBOARD_ACCESS_PASSWORD, JWT_PAYLOAD_STRING and JWT_STRATEGY_SECRET environment variables inside .env.local'
					);
				}
				const fields = await parseFields(req);
				const { errors } = await yupValidation(
					loginFormValidationSchema,
					fields
				);
				if (errors) {
					return res.status(422).json(errors);
				}
				if (fields.password !== DASHBOARD_ACCESS_PASSWORD) {
					return res.status(403).json('Password is incorrect.');
				}
				const token = jwt.sign(JWT_PAYLOAD_STRING, JWT_STRATEGY_SECRET);
				res.setHeader(
					'Set-Cookie',
					`token=${token}; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=7200` // 2 hours
				);
				return res.status(200).end();
			} catch (error: any) {
				return res
					.status(500)
					.json(
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
					);
			}
		}
		if (form === 'series-data') {
			const tokenValid = verifyToken(req);
			if (tokenValid) {
				try {
					const fields = await parseFields(req);
					const fieldsParseInt: Omit<SeriesDataFormValues, 'year'> & {
						year: Number;
					} = {
						series: fields.series,
						year: parseInt(fields.year),
						documents_url: fields.documents_url,
					};
					const { errors } = await yupValidation(
						seriesDataFormValidationSchema,
						fieldsParseInt
					);
					if (errors) {
						return res.status(422).json(errors);
					}
					const connectionSeriesDataDb = await connectMongoDb('Series_Data');
					const docExists =
						await connectionSeriesDataDb.models.Series_Data_Doc.findOne({
							series: fieldsParseInt.series,
							year: fieldsParseInt.year,
						}).exec();
					if (docExists) {
						return res.status(403).json('Entry already exists.');
					}
					const newDocument = new connectionSeriesDataDb.models.Series_Data_Doc(
						{ ...fieldsParseInt, manual_upload: true }
					);
					await newDocument.save();
					return res.status(200).end();
				} catch (error: any) {
					return res
						.status(500)
						.json(
							'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.'
						);
				}
			} else {
				res.setHeader(
					'Set-Cookie',
					`token=; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=0`
				);
				return res.status(401).end();
			}
		}
		return res.status(405).end();
	} else {
		return res.status(405).end();
	}
};

export default handler;
