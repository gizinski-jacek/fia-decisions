// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

const handler = async (req: NextApiRequest, res: NextApiResponse<string>) => {
	if (req.method === 'DELETE') {
		const { job } = req.query;
		if (job === 'delete-files') {
			try {
				const { authorization } = req.headers;
				if (authorization === `Bearer ${process.env.CRON_JOB_CLEANUP_SECRET}`) {
					const files = fs.readdirSync('./pdfreader/');
					if (files.length === 0) {
						return res.status(200).end();
					}
					await Promise.all(
						files.map(
							(file) =>
								new Promise(async (resolve, reject) => {
									fs.unlink('./pdfreader/' + file, (error) => {
										if (error) {
											reject(error);
										}
									});
									resolve(null);
								})
						)
					);
					return res.status(200).end();
				} else {
					return res.status(401);
				}
			} catch (error: any) {
				return res.status(405).end();
			}
		}
	} else {
		return res.status(405).end();
	}
};

export default handler;
