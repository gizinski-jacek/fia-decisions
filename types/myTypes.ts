export interface TransformedPDFData {
	series: string;
	doc_type: string;
	doc_name: string;
	doc_date: Date;
	penalty_type: string;
	grand_prix: string;
	weekend: string;
	incident_title: string;
	document_info: DocumentInfo;
	incident_info: IncidentInfo;
	stewards: string[];
}

export interface DocumentInfo {
	From: string;
	To: string;
	Document: string;
	Date: string;
	Time: string;
}

export interface IncidentInfo {
	Headline: string;
	Driver: string;
	Competitor: string;
	Time: string;
	Session: string;
	Fact: string;
	Offence: string[];
	Decision: string[];
	Reason: string;
}

export interface DecisionOffenceModel extends TransformedPDFData {
	_id: string;
	manual_upload: boolean;
}

export interface GroupedByGP {
	[key: string]: DecisionOffenceModel[];
}

export interface DatabaseNameList {
	f1_2022_db: string;
	f2_2022_db: string;
	f3_2022_db: string;
}

export interface FiaPageList {
	f1_2022_page: string;
	f2_2022_page: string;
	f3_2022_page: string;
}

export interface FileFormValues {
	series: string;
	file: File | null;
}

export interface DataFormValues {
	series: string;
	title?: string;
	url?: string;
}

export interface MissingDocModel extends DataFormValues {
	_id: string;
}

export interface ContactFormValues {
	email: string;
	message: string;
}

export interface ContactDocModel extends ContactFormValues {
	_id: string;
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
