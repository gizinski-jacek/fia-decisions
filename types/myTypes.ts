export interface DecisionModel {
	doc_type: string;
	grand_prix: string;
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
		Iffence: string;
		Decision: string;
		Reason: string;
	};
	stewards: string[];
}
