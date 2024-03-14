import { createContext, useEffect, useState } from 'react';
import {
	SeriesDataDocModel,
	SeriesDataDocResponseData,
	SupportedYearsData,
} from '../types/myTypes';
import axios from 'axios';

interface Props {
	children: React.ReactNode;
}

interface SupportedSeriesDataProps {
	supportedSeriesData: SeriesDataDocModel[] | null;
	yearsBySeries: SupportedYearsData | null;
	fetchingSeriesData: boolean;
	fetchSeriesData: () => void;
}

const SupportedSeriesDataContext = createContext<SupportedSeriesDataProps>({
	supportedSeriesData: null,
	yearsBySeries: null,
	fetchingSeriesData: true,
	fetchSeriesData: () => null,
});

const SupportedYearsProvider = ({ children }: Props) => {
	const [supportedSeriesData, setSupportedSeriesData] = useState<
		SeriesDataDocModel[] | null
	>(null);
	const [yearsBySeries, setYearsBySeries] = useState<SupportedYearsData | null>(
		null
	);
	const [fetchingSeriesData, setFetchingSeriesData] = useState(true);

	const fetchSeriesData = async () => {
		try {
			const res: SeriesDataDocResponseData = await axios.get(
				`/api/document/series-data`,
				{ timeout: 15000 }
			);
			const yearsBySeries: SupportedYearsData = res.data.reduce(
				(prev, curr) => {
					prev[curr.series] = prev[curr.series] || [];
					prev[curr.series].push(curr.year);
					return prev;
				},
				Object.create(null)
			);
			setSupportedSeriesData(res.data);
			setYearsBySeries(yearsBySeries);
			setFetchingSeriesData(false);
		} catch (error: any) {
			console.log('Unknown server error. Fetching Series data failed.');
			setFetchingSeriesData(false);
		}
	};

	useEffect(() => {
		fetchSeriesData();
	}, []);

	return (
		<SupportedSeriesDataContext.Provider
			value={{
				supportedSeriesData,
				yearsBySeries,
				fetchingSeriesData,
				fetchSeriesData,
			}}
		>
			{children}
		</SupportedSeriesDataContext.Provider>
	);
};

export { SupportedSeriesDataContext, SupportedYearsProvider };
