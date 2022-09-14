export interface TransformedPDFData {
	doc_type: string;
	doc_name: string;
	doc_date: Date;
	penalty_type: string;
	grand_prix: string;
	weekend: string;
	document_info: {
		From: string;
		To: string;
		Document: string;
		Date: string;
		Time: string;
	};
	incident_info: {
		Headline: string;
		Driver: string;
		Competitor: string;
		Time: string;
		Session: string;
		Fact: string;
		Offence: string[];
		Decision: string[];
		Reason: string;
	};
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
