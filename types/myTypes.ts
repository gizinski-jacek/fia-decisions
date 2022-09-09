export interface TransformedPDFData {
	weekend: string;
	heading: {
		From: string;
		To: string;
		Document: string;
		Date: string;
		Time: string;
	};
	content: {
		Headline: string;
		Driver: string;
		Competitor: string;
		Time: string;
		Session: string;
		Fact: string;
		Offence: string[];
		Decision: string;
		Reason: string;
	};
	stewards: string[];
}

export interface DecisionModel extends TransformedPDFData {
	doc_type: string;
	doc_name: string;
	grand_prix: string;
	penalty: string;
}

export interface DecisionMongoDBModel extends DecisionModel {
	_id: string;
}
