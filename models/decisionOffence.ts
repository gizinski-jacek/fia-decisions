import mongoose from 'mongoose';
import { DecisionOffenceModel } from '../types/myTypes';

const Schema = mongoose.Schema;

const DecisionOffenceSchema = new Schema<DecisionOffenceModel>(
	{
		doc_type: { type: String, trim: true, required: true },
		doc_name: { type: String, trim: true, required: true },
		doc_date: { type: Date, trim: true, required: true },
		grand_prix: { type: String, trim: true, required: true },
		penalty_type: { type: String, trim: true, required: true },
		weekend: { type: String, trim: true, required: true },
		document_info: {
			From: { type: String, trim: true, required: true },
			To: { type: String, trim: true, required: true },
			Document: { type: String, trim: true, required: true },
			Date: { type: String, trim: true, required: true },
			Time: { type: String, trim: true, required: true },
		},
		incident_info: {
			Headline: { type: String, trim: true, required: true },
			Driver: { type: String, trim: true, required: true },
			Competitor: { type: String, trim: true, required: true },
			Time: { type: String, trim: true, required: true },
			Session: { type: String, trim: true, required: true },
			Fact: [{ type: String, trim: true, required: true }],
			Offence: { type: String, trim: true, required: true },
			Decision: [{ type: String, trim: true, required: true }],
			Reason: { type: String, trim: true, required: true },
		},
		stewards: [{ type: String, trim: true, required: true }],
	},
	{ timestamps: true }
);

export default mongoose.models.Decision_Offence ||
	mongoose.model('Decision_Offence', DecisionOffenceSchema);