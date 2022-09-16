import mongoose from 'mongoose';
import { MissingDocModel } from '../types/myTypes';

const Schema = mongoose.Schema;

const Missing_Doc = new Schema<MissingDocModel>(
	{
		doc_series: { type: String, trim: true },
		doc_title: {
			type: String,
			trim: true,
			required: function () {
				return !this.doc_link;
			},
		},
		doc_link: {
			type: String,
			trim: true,
			required: function () {
				return !this.doc_title;
			},
		},
	},
	{ timestamps: true }
);

module.exports = Missing_Doc;
