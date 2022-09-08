// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../lib/mongo';
import Decision from '../../../models/decision';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		if (req.query.f1 === 'decisions') {
			await connectMongo();
			const decisionList = await Decision.find({}).exec();
			return res.status(200).json(decisionList);
		}
	}

	return res.status(404).json({ success: false });
};

export default handler;
