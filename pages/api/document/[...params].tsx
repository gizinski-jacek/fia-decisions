// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../lib/mongo';
import { dbNameList } from '../../../lib/myData';
import { DecisionOffenceModel, GroupedByGP } from '../../../types/myTypes';

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<GroupedByGP | string>
) => {
	if (req.method === 'GET') {
		const { params } = req.query as { params: string[] };
		let seriesYearDB = '';
		if (params[0] === 'f1') {
			if (params[1]) {
				seriesYearDB = dbNameList[`f1_${params[1]}_db`];
			} else {
				seriesYearDB =
					dbNameList[`f1_${new Date().getFullYear().toString()}_db`];
			}
		} else if (params[0] === 'f2') {
			if (params[1]) {
				seriesYearDB = dbNameList[`f2_${params[1]}_db`];
			} else {
				seriesYearDB =
					dbNameList[`f2_${new Date().getFullYear().toString()}_db`];
			}
		} else if (params[0] === 'f3') {
			if (params[1]) {
				seriesYearDB = dbNameList[`f3_${params[1]}_db`];
			} else {
				seriesYearDB =
					dbNameList[`f3_${new Date().getFullYear().toString()}_db`];
			}
		} else {
			return res.status(422).json('Unsupported series.');
		}
		if (!seriesYearDB) {
			return res.status(422).json('Unsupported year.');
		}
		try {
			const conn = await connectMongo(seriesYearDB);
			const document_list: DecisionOffenceModel[] =
				await conn.models.Decision_Offence.find({})
					.sort({ doc_date: -1 })
					.exec();
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
