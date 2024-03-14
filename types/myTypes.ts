import { AxiosResponse } from 'axios';

export interface TransformedPDFData {
	series: string;
	doc_type: string;
	doc_name: string;
	doc_date: string;
	penalty_type: string;
	grand_prix: string;
	weekend: string;
	incident_title: string;
	document_info: DocumentDetails;
	incident_info: IncidentDetails;
	stewards: string[];
}

export interface DocumentDetails {
	From: string;
	To: string;
	Document: string;
	Date: string;
	Time: string;
}

export interface IncidentDetails {
	Headline: string;
	Driver: string;
	Competitor: string;
	Time: string;
	Session: string;
	Fact: string;
	Infringement: string[];
	Decision: string[];
	Reason: string;
}

export interface PenaltyModel extends TransformedPDFData {
	_id: string;
	manual_upload: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface GroupedByGP {
	[key: string]: PenaltyModel[];
}

export interface FileFormValues {
	series: string;
	file: File | null;
}

export interface InformationFormValues {
	series: string;
	year: string;
	description: string;
}

export interface UpdatePenaltiesFormValues {
	series: string;
	year: string;
}

export interface MissingDocModel extends InformationFormValues {
	_id: string;
	createdAt: string;
	updatedAt: string;
}

export interface ContactFormValues {
	email: string;
	message: string;
}

export interface ContactDocModel extends ContactFormValues {
	_id: string;
	createdAt: string;
	updatedAt: string;
}

export interface SeriesDataFormValues {
	series: string;
	year: string;
	documents_url: string;
}

export interface SeriesDataDocModel extends SeriesDataFormValues {
	_id: string;
	createdAt: string;
	updatedAt: string;
}

export interface SupportedYearsData {
	[key: string]: number[];
}

export interface SeriesDataDocResponseData extends AxiosResponse {
	data: SeriesDataDocModel[];
}

export interface FormulaSeriesResponseData extends AxiosResponse {
	data: GroupedByGP;
}

export interface DocumentsResponseData extends AxiosResponse {
	data: GroupedByGP | MissingDocModel[] | ContactDocModel[] | [];
}

export interface ErgastSeasonData extends AxiosResponse {
	data: {
		MRData: {
			RaceTable: {
				Races: WeekendData[];
			};
		};
	};
}

export interface WeekendData {
	date: string;
	raceName: string;
	round: string;
	season: string;
	time: string;
	url: string;
	Circuit: { circuitId: string; circuitName: string; url: string };
	FirstPractice: { date: string; time: string };
	SecondPractice: { date: string; time: string };
	ThirdPractice?: { date: string; time: string };
	Sprint?: { date: string; time: string };
	Qualifying: { date: string; time: string };
}

export interface PenaltyColors {
	[key: string]: { color: string; backgroundColor: string };
}

export interface LoginFormValues {
	password: string;
}

export type SelectDocumentsValues =
	| 'contact-message'
	| 'missing-info'
	| 'missing-file'
	| 'penalties__f1__manual-upload'
	| 'penalties__f1__manual-upload'
	| 'penalties__f2__manual-upload'
	| 'penalties__f3__manual-upload'
	| 'penalties__f1'
	| 'penalties__f2'
	| 'penalties__f3';
