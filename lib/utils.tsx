import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import { Accordion } from 'react-bootstrap';
import {
	GroupedByGrandPrix,
	GroupedBySeries,
	PenaltyModel,
	SelectDocumentsValues,
} from '../types/myTypes';
import F1DocWrapper from '../components/wrappers/F1DocWrapper';
import { ReactElement } from 'react';

export const verifyToken = (req: NextApiRequest): boolean => {
	const { JWT_STRATEGY_SECRET, JWT_PAYLOAD_STRING } = process.env;
	if (!JWT_STRATEGY_SECRET) {
		throw new Error(
			'Please define JWT_STRATEGY_SECRET environment variable inside .env.local'
		);
	}
	const { token } = req.cookies;
	if (!token) {
		return false;
	}
	const decodedToken = jwt.verify(token, JWT_STRATEGY_SECRET);
	if (decodedToken !== JWT_PAYLOAD_STRING) {
		return false;
	}
	return true;
};

export const groupByGrandPrix = (
	documents_list: PenaltyModel[]
): GroupedByGrandPrix => {
	return documents_list.reduce((prev, curr) => {
		prev[curr.grand_prix] = prev[curr.grand_prix] || [];
		prev[curr.grand_prix].push(curr);
		return prev;
	}, Object.create(null));
};

export const groupBySeriesAndGrandPrix = (
	documents_list: PenaltyModel[]
): GroupedBySeries => {
	return documents_list.reduce((prev, curr) => {
		prev[curr.series] = prev[curr.series] || {};
		prev[curr.series][curr.grand_prix] =
			prev[curr.series][curr.grand_prix] || [];
		prev[curr.series][curr.grand_prix].push(curr);
		return prev;
	}, Object.create(null));
};

export const renderGroupedByGrandPrix = (
	docsData: GroupedByGrandPrix,
	searchQuery?: string,
	cmsProps?: {
		handleDelete: (
			e: React.MouseEvent<HTMLButtonElement>,
			queryType: SelectDocumentsValues,
			docSeries: string,
			docId: string,
			docYear: string
		) => void;
		queryType: SelectDocumentsValues;
		handleAccept: (
			e: React.MouseEvent<HTMLButtonElement>,
			docSeries: string,
			docId: string
		) => void;
	}
): JSX.Element[] | ReactElement => {
	if (Object.entries(docsData).length === 0) {
		return (
			<div className='m-5 text-center'>
				<h3>No Documents Found</h3>
			</div>
		);
	}
	const dataRender = [];
	if (searchQuery) {
		let searchData = {} as GroupedByGrandPrix;
		for (const [key, array] of Object.entries(docsData)) {
			const filtered = array.filter(
				(doc) =>
					doc.penalty_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
					doc.incident_info.Driver.toLowerCase().includes(
						searchQuery.toLowerCase()
					) ||
					doc.incident_info.Decision[0]
						.toLowerCase()
						.includes(searchQuery.toLowerCase())
			);
			if (filtered.length === 0) {
				continue;
			} else {
				searchData[key as keyof GroupedByGrandPrix] = filtered;
			}
		}
		for (const [key, array] of Object.entries(searchData)) {
			dataRender.push(
				<Accordion key={key} id={key}>
					<Accordion.Item eventKey='0'>
						<Accordion.Header>
							<div className='d-flex flex-column flex-sm-row w-100 gap-sm-3 me-3 align-items-center'>
								<h4 className='fw-bold text-capitalize'>{key}</h4>
								<h4 className='fw-bold text-capitalize'>
									{array.find((doc) => doc.weekend)?.weekend}
								</h4>
								<h4 className='fw-bold text-sm-end'>
									{array.length} {array.length === 1 ? 'penalty' : 'penalties'}
								</h4>
							</div>
						</Accordion.Header>
						<Accordion.Body className='d-flex flex-column gap-2 bg-light'>
							{array.map((doc) => (
								<F1DocWrapper key={doc._id} data={doc} cmsProps={cmsProps} />
							))}
						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			);
		}
	} else {
		for (const [key, array] of Object.entries(docsData)) {
			dataRender.push(
				<Accordion key={key} id={key}>
					<Accordion.Item eventKey='1'>
						<Accordion.Header>
							<div className='d-flex flex-column flex-sm-row w-100 gap-sm-3 me-3 align-items-center'>
								<h4 className='fw-bold text-capitalize'>{key}</h4>
								<h4 className='fw-bold text-capitalize'>
									{array.find((doc) => doc.weekend)?.weekend}
								</h4>
								<h4 className='fw-bold text-sm-end'>
									{array.length} {array.length === 1 ? 'penalty' : 'penalties'}
								</h4>
							</div>
						</Accordion.Header>
						<Accordion.Body className='d-flex flex-column gap-2 bg-light'>
							{array.map((doc) => (
								<F1DocWrapper key={doc._id} data={doc} cmsProps={cmsProps} />
							))}
						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			);
		}
	}
	return dataRender;
};

export const renderGroupedBySeries = (
	docsData: GroupedBySeries,
	searchQuery?: string,
	cmsProps?: {
		handleDelete: (
			e: React.MouseEvent<HTMLButtonElement>,
			queryType: SelectDocumentsValues,
			docSeries: string,
			docId: string,
			docYear: string
		) => void;
		queryType: SelectDocumentsValues;
		handleAccept: (
			e: React.MouseEvent<HTMLButtonElement>,
			docSeries: string,
			docId: string
		) => void;
	}
): JSX.Element[] | ReactElement | any => {
	const seriesDocsWrapped = [];
	for (const [series, groupedByGrandPrix] of Object.entries(docsData)) {
		if (!groupedByGrandPrix) continue;
		const totalPenalties = Object.values(groupedByGrandPrix).reduce(
			(prev, curr) => prev + curr.length,
			0
		);
		seriesDocsWrapped.push(
			<Accordion key={series} id={series}>
				<Accordion.Item eventKey='2'>
					<Accordion.Header>
						<h4 className='me-3 fw-bold text-capitalize'>
							{series.replace('f', 'Formula ')} Penalties
						</h4>
						<h4 className='me-3 fw-bold text-sm-end'>
							{totalPenalties} {totalPenalties === 1 ? 'penalty' : 'penalties'}
						</h4>
					</Accordion.Header>
					<Accordion.Body className='d-flex flex-column gap-2'>
						{renderGroupedByGrandPrix(
							groupedByGrandPrix,
							searchQuery,
							cmsProps
						)}
					</Accordion.Body>
				</Accordion.Item>
			</Accordion>
		);
	}

	return seriesDocsWrapped;
};

export const formatPenalty = (type: string, string: string): string => {
	type = type.replace('-', ' ');
	if (type === 'grid') {
		const numberWords = {
			one: '1',
			two: '2',
			three: '3',
			four: '4',
			five: '5',
			six: '6',
			seven: '7',
			eight: '8',
			nine: '9',
			ten: '10',
			eleven: '11',
			twelve: '12',
			thirteen: '13',
			fourteen: '14',
			fifteen: '15',
			sixteen: '16',
			seventeen: '17',
			eighteen: '18',
			nineteen: '19',
			twenty: '20',
		};
		let replacedWordWithNumber = '';
		for (const [key, value] of Object.entries(numberWords)) {
			if (string.toLowerCase().includes(key)) {
				replacedWordWithNumber = string.toLowerCase().replace(key, value);
				break;
			}
		}
		if (!replacedWordWithNumber) {
			replacedWordWithNumber = string;
		}
		const matchGridNumber = replacedWordWithNumber.match(
			/\d{1,2}.{1,16}(grid|position)\)?/im
		);
		if (matchGridNumber) {
			const matchExtraNumbers = matchGridNumber[0].match(/.*(\d\. )/im);
			if (matchExtraNumbers) {
				const str = matchGridNumber[0].replace(matchExtraNumbers[0], ' ');
				const matchExtraText = str.match(/(?<=\d\b).{2,16}(?=grid)/im);
				if (matchExtraText) {
					return `+ ${str
						.replace(matchExtraText[0], ' ')
						.replace(/drop of/im, '')
						.replace(/position/im, '')} Places`;
				} else {
					return `+ ${str
						.replace(/drop of/im, '')
						.replace(/position/im, '')} Places`;
				}
			} else {
				const matchExtraText = matchGridNumber[0].match(
					/(?<=\d\b).{2,16}(?=grid)/im
				);
				if (matchExtraText) {
					return `+ ${matchGridNumber[0]
						.replace(matchExtraText[0], ' ')
						.replace(/drop of/im, '')
						.replace(/position/im, '')} Places`;
				} else {
					return `+ ${matchGridNumber[0]
						.replace(/drop of/im, '')
						.replace(/position/im, '')} Places`;
				}
			}
		}
		const matchBackOfTheGrid =
			replacedWordWithNumber.match(/(back|rear).*grid?/im);
		if (matchBackOfTheGrid) {
			return 'Back of the Grid';
		}
	}
	if (type === 'time') {
		const numberWords = {
			one: '1',
			two: '2',
			three: '3',
			four: '4',
			five: '5',
			six: '6',
			seven: '7',
			eight: '8',
			nine: '9',
			ten: '10',
			eleven: '11',
			twelve: '12',
			thirteen: '13',
			fourteen: '14',
			fifteen: '15',
			sixteen: '16',
			seventeen: '17',
			eighteen: '18',
			nineteen: '19',
			twenty: '20',
		};
		let replacedWordWithNumber = '';
		for (const [key, value] of Object.entries(numberWords)) {
			if (string.toLowerCase().includes(key)) {
				replacedWordWithNumber = string.toLowerCase().replace(key, value);
				break;
			}
		}
		if (!replacedWordWithNumber) {
			replacedWordWithNumber = string;
		}
		const matchTimeNumber = replacedWordWithNumber.match(
			/\d{1,2}.{1,8}second?\)?/im
		);
		if (matchTimeNumber) {
			return `+ ${matchTimeNumber[0]
				.toLowerCase()
				.replace(/\(\d{1,2}\)/im, '')
				.replace('  ', ' ')
				.replace(/second/im, 'seconds')}`;
		}
		const matchLapDeletion = replacedWordWithNumber.match(/delet.*lap/im);
		if (matchLapDeletion) {
			return 'Lap Deleted';
		}
		const matchLapReinstated = replacedWordWithNumber.match(/reinstate/im);
		if (matchLapReinstated) {
			return 'Lap Reinstated';
		}
	}
	if (type === 'stop and go') {
		const numberWords = {
			one: '1',
			two: '2',
			three: '3',
			four: '4',
			five: '5',
			six: '6',
			seven: '7',
			eight: '8',
			nine: '9',
			ten: '10',
			eleven: '11',
			twelve: '12',
			thirteen: '13',
			fourteen: '14',
			fifteen: '15',
			sixteen: '16',
			seventeen: '17',
			eighteen: '18',
			nineteen: '19',
			twenty: '20',
		};
		let replacedWordWithNumber = '';
		for (const [key, value] of Object.entries(numberWords)) {
			if (string.toLowerCase().includes(key)) {
				replacedWordWithNumber = string.toLowerCase().replace(key, value);
				break;
			}
		}
		if (!replacedWordWithNumber) {
			replacedWordWithNumber = string;
		}
		const matchTimeNumber = replacedWordWithNumber.match(
			/\d{1,2}.{1,8}second?\)?/im
		);
		if (matchTimeNumber) {
			return `+ ${matchTimeNumber[0]
				.toLowerCase()
				.replace(/\(\d{1,2}\)/im, '')
				.replace('  ', ' ')
				.replace(/ second/im, 's')} ${type}`;
		}
	}
	if (type === 'fine') {
		const fineAmount = string.match(/\b(\d{1,}|,|\.){1,}\d{1,}/im);
		if (fineAmount) {
			return `€${fineAmount[0]} Fine`;
		}
	}
	if (type === 'pit lane') {
		return `${type} start`;
	}
	return type;
};
