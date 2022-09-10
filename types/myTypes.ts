export interface TransformedPDFData {
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

export interface DecisionModel extends TransformedPDFData {
	doc_type: string;
	doc_name: string;
	doc_date: Date;
	grand_prix: string;
	penalty_type: string;
}

export interface DecisionMongoDBModel extends DecisionModel {
	_id: string;
}
