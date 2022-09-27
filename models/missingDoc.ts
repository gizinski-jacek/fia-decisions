import mongoose from 'mongoose';
import { MissingDocModel } from '../types/myTypes';

const Schema = mongoose.Schema;

const Missing_Doc = new Schema<MissingDocModel>(
	{
		series: { type: String, trim: true, required: true },
		description: {
			type: String,
			trim: true,
			minlength: 16,
			maxlength: 256,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = Missing_Doc;
