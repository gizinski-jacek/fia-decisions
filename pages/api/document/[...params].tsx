// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../lib/mongo';
import { dbNameList, supportedSeries } from '../../../lib/myData';
import { DecisionOffenceModel, GroupedByGP } from '../../../types/myTypes';

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<GroupedByGP | string>
) => {
	if (req.method === 'GET') {
		const { params } = req.query as { params: string[] };
		const series = supportedSeries.find((s) => s === params[0].toLowerCase());
		const year = params[1] || new Date().getFullYear().toString();
		if (!series) {
			return res.status(422).json('Unsupported series.');
		}
		const seriesYearDB = dbNameList[`${series}_${year}_db`];
		if (!seriesYearDB) {
			return res.status(422).json('Unsupported year.');
		}
		try {
			const conn = await connectMongo(seriesYearDB);
			const document_list: DecisionOffenceModel[] =
				await conn.models.Decision_Offence.find().sort({ doc_date: -1 }).exec();
			const groupedByGP: GroupedByGP = document_list.reduce((prev, curr) => {
				prev[curr.grand_prix] = prev[curr.grand_prix] || [];
				prev[curr.grand_prix].push(curr);
				return prev;
			}, Object.create(null));
			return res.status(200).json(groupedByGP);
		} catch (error: any) {
			return res
				.status(500)
				.json(
					'Failed to get documents. If this issue persists, please use the Contact form to report this issue.'
				);
		}
	} else {
		return res.status(405).end();
	}
};

export default handler;
