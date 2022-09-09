import mongoose from 'mongoose';
import { DecisionModel } from '../types/myTypes';

const Schema = mongoose.Schema;

const DecisionSchema = new Schema<DecisionModel>(
	{
		doc_type: { type: String, trim: true, required: true },
		doc_name: { type: String, trim: true, required: true },
		grand_prix: { type: String, trim: true, required: true },
		penalty: { type: String, trim: true, required: true },
		weekend: { type: String, trim: true, required: true },
		heading: {
			From: { type: String, trim: true, required: true },
			To: { type: String, trim: true, required: true },
			Document: { type: String, trim: true, required: true },
			Date: { type: String, trim: true, required: true },
			Time: { type: String, trim: true, required: true },
		},
		content: {
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

export default mongoose.models.Decision ||
	mongoose.model('Decision', DecisionSchema);
