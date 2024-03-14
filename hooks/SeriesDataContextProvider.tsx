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

interface SeriesDataContextProps {
	seriesData: SeriesDataDocModel[] | null;
	yearsBySeries: SupportedYearsData | null;
	fetchingSeriesData: boolean;
	fetchSeriesData: () => void;
}

const SeriesDataContext = createContext<SeriesDataContextProps>({
	seriesData: null,
	yearsBySeries: null,
	fetchingSeriesData: true,
	fetchSeriesData: () => null,
});

const SeriesDataContextProvider = ({ children }: Props) => {
	const [seriesData, setSeriesData] = useState<SeriesDataDocModel[] | null>(
		null
	);
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
			const yearsBySeries: SupportedYearsData = res.data.length
				? res.data.reduce((prev, curr) => {
						prev[curr.series] = prev[curr.series] || [];
						prev[curr.series].push(curr.year);
						return prev;
				  }, Object.create(null))
				: null;
			setSeriesData(res.data);
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
		<SeriesDataContext.Provider
			value={{
				seriesData: seriesData,
				yearsBySeries,
				fetchingSeriesData,
				fetchSeriesData,
			}}
		>
			{children}
		</SeriesDataContext.Provider>
	);
};

export { SeriesDataContext, SeriesDataContextProvider };
