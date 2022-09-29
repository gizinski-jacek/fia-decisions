// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../lib/mongo';
import { dbNameList, supportedSeries } from '../../../lib/myData';
import multiparty from 'multiparty';
import { parseFields } from '../../../lib/multiparty';
import { streamToBuffer } from '../../../lib/streamToBuffer';
import { readPDFPages } from '../../../lib/pdfReader';
import { transformToDecOffDoc } from '../../../lib/transformToDecOffDoc';
import * as Yup from 'yup';
import yupValidation from '../../../lib/yup';
import {
	ContactDocModel,
	ContactFormValues,
	DashboardFormValues,
	DataFormValues,
	MissingDocModel,
} from '../../../types/myTypes';
import jwt from 'jsonwebtoken';

export const config = {
	api: {
		bodyParser: false,
		externalResolver: true,
	},
};

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<
		| string
		| string[]
		| { missing: MissingDocModel[]; contact: ContactDocModel[] }
		| { success: boolean }
	>
) => {
	if (req.method === 'POST') {
		const { form } = req.query;
		if (form === 'file') {
			try {
				const { series } = req.query as { series: string };
				console.log(series);
				if (!series) {
					return res.status(422).json(['Series is required.']);
				}
				let seriesDB = '';
				if (series === 'formula1') {
					seriesDB = dbNameList.f1_2022_db;
				} else if (series === 'formula2') {
					seriesDB = dbNameList.f2_2022_db;
				} else if (series === 'formula3') {
					seriesDB = dbNameList.f3_2022_db;
				} else {
					return res.status(422).json(['Series is not supported.']);
				}

				if (!seriesDB) {
					return res.status(422).json(['Series is not supported.']);
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
						return res.status(422).json(['Must choose a PDF file.']);
					}

					const fileBuffer = await streamToBuffer(part);
					const pdfData = await readPDFPages(fileBuffer);
					const transformed = transformToDecOffDoc(
						part.filename,
						pdfData as any,
						series as 'formula1' | 'formula2' | 'formula3'
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
								.json([
									'Document already exists. If you believe this to be a mistake please use Contact form to let me know about this issue.',
								]);
						}
						await conn.models.Decision_Offence.create({
							...transformed,
							manual_upload: true,
						});
						return res.status(200).json(['Document saved.']);
					} catch (error: any) {
						return res
							.status(500)
							.json([
								'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.',
							]);
					}
				});
				// Close emitted after form parsed
				form.on('close', function () {
					console.log('Upload completed!');
				});
				// Parse req
				form.parse(req);
			} catch (error: any) {
				return res
					.status(500)
					.json([
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.',
					]);
			}
		}
		if (form === 'data') {
			try {
				const fields = await parseFields(req);
				const { errors } = await yupValidation(
					dataFormValidationSchema,
					fields
				);
				if (errors) {
					return res.status(422).json(errors);
				}
				const conn = await connectMongo('otherDocs');
				const newReport = new conn.models.Missing_Doc(fields);
				await newReport.save();
				return res.status(200).json(['Document saved.']);
			} catch (error: any) {
				return res
					.status(500)
					.json([
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.',
					]);
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
				const conn = await connectMongo('otherDocs');
				const newReport = new conn.models.Contact_Doc(fields);
				await newReport.save();
				return res.status(200).json(['Document saved.']);
			} catch (error: any) {
				return res
					.status(500)
					.json([
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.',
					]);
			}
		}
		if (form === 'dashboard-sign-in') {
			if (
				!process.env.DASHBOARD_ACCESS_PASSWORD ||
				!process.env.JWT_PAYLOAD_STRING ||
				!process.env.JWT_STRATEGY_SECRET
			) {
				throw new Error(
					'Please define DASHBOARD_ACCESS_PASSWORD, JWT_PAYLOAD_STRING and JWT_STRATEGY_SECRET environment variables inside .env.local'
				);
			}
			try {
				const fields = await parseFields(req);
				const { errors } = await yupValidation(
					dashboardFormValidationSchema,
					fields
				);
				if (errors) {
					return res.status(422).json(errors);
				}
				if (fields.password !== process.env.DASHBOARD_ACCESS_PASSWORD) {
					return res.status(403).json(['Password is incorrect.']);
				}
				const token = jwt.sign(
					process.env.JWT_PAYLOAD_STRING,
					process.env.JWT_STRATEGY_SECRET
				);
				res.setHeader(
					'Set-Cookie',
					`token=${token}; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=900` // 15 minutes
				);
				return res.status(200).json({ success: true });
			} catch (error: any) {
				return res
					.status(500)
					.json([
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.',
					]);
			}
		}
	} else {
		return res.status(405).end();
	}
};

export default handler;

const dataFormValidationSchema: Yup.SchemaOf<DataFormValues> =
	Yup.object().shape({
		series: Yup.string()
			.required('Series is is required.')
			.test('is-supported-series', 'Series is not supported.', (val, ctx) => {
				if (!val) return false;
				return supportedSeries.find(
					(s) => s.toLowerCase() === val.toLowerCase()
				)
					? true
					: false;
			}),
		description: Yup.string()
			.required('Description is is required.')
			.min(16, 'Description min 16 characters.')
			.max(512, 'Description max 512 characters.'),
	});

const contactFormValidationSchema: Yup.SchemaOf<ContactFormValues> =
	Yup.object().shape({
		email: Yup.string()
			.required('Email is required.')
			.min(8, 'Email min 8 characters.')
			.max(64, 'Email max 64 characters.')
			.email('Email is invalid.'),
		message: Yup.string()
			.required('Message is required.')
			.min(4, 'Message min 4 characters.')
			.max(512, 'Message max 512 characters.'),
	});

const dashboardFormValidationSchema: Yup.SchemaOf<DashboardFormValues> =
	Yup.object().shape({
		password: Yup.string()
			.required('Password is required.')
			.min(8, 'Password min 8 characters.')
			.max(64, 'Password max 64 characters.'),
	});
