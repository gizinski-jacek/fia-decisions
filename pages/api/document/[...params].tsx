// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongoDb from '../../../lib/mongo';
import {
	PenaltyModel,
	GroupedByGrandPrix,
	SeriesDataDocModel,
} from '../../../types/myTypes';
import { supportedSeries } from '../../../lib/myData';

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<PenaltyModel[] | SeriesDataDocModel[] | string>
) => {
	if (req.method === 'GET') {
		try {
			const { params } = req.query as { params: string[] };
			const docType = params[0];
			const series =
				params[1] &&
				supportedSeries.find(
					(s) => s.toLowerCase() === params[1].toLowerCase()
				);
			const year = params[2];
			if (docType === 'series-data') {
				try {
					const connectionSeriesDataDb = await connectMongoDb('Series_Data');
					const document_list_series_data: SeriesDataDocModel[] =
						await connectionSeriesDataDb.models.Series_Data_Doc.find()
							.select('series year documents_url')
							.sort({ series: 1, year: -1 })
							.exec();
					return res.status(200).json(document_list_series_data);
				} catch (error: any) {
					return res
						.status(404)
						.json('Unknown server error. Failed to get data.');
				}
			} else if (docType === 'penalties') {
				if (!series) {
					return res.status(422).json('Unsupported Series.');
				}
				if (!year) {
					return res.status(422).json('Must provide a Year.');
				}
				const connectionSeriesDataDb = await connectMongoDb('Series_Data');
				const document_list_series_data: SeriesDataDocModel[] =
					await connectionSeriesDataDb.models.Series_Data_Doc.find({
						series: series,
					})
						.sort({ year: -1 })
						.exec();
				if (!document_list_series_data.length) {
					return res.status(422).json('No data for selected Series found.');
				}
				const selectedSeriesData = document_list_series_data.find(
					(doc) => parseInt(doc.year) === parseInt(year)
				);
				if (!selectedSeriesData) {
					return res.status(422).json('Unsupported Series Year.');
				}
				const seriesYearDb = `${
					selectedSeriesData.year
				}_${selectedSeriesData.series.toUpperCase()}_WC_Docs`;
				const connectionSeriesYearDb = await connectMongoDb(seriesYearDb);
				const document_list_penalties: PenaltyModel[] =
					await connectionSeriesYearDb.models.Penalty_Doc.find()
						.sort({ doc_date: -1 })
						.exec();
				return res.status(200).json(document_list_penalties);
			}
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
