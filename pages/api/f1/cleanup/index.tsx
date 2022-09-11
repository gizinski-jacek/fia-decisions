// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const { authorization } = req.headers;
		if (authorization === `Bearer ${process.env.CRON_JOB_SECRET}`) {
			const files = fs.readdirSync('./pdf2json/gpPDFDocs/');
			if (files.length === 0) {
				return res.status(200).json({ success: true });
			}
			await new Promise((resolve, reject) => {
				try {
					files.forEach((file) => {
						fs.unlink('./pdf2json/gpPDFDocs/' + file, (error) => {
							if (error) {
								throw error;
							}
						});
					});
					resolve(null);
				} catch (error) {
					reject(error);
				}
			});
			return res.status(200).json({ success: true });
		} else {
			return res.status(401).json({ success: false });
		}
	} catch (error) {
		return res.status(404).json({ success: false });
	}
};

export default handler;
