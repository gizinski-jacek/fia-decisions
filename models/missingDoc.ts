//@ts-nocheck

import mongoose from 'mongoose';
import { MissingDocModel } from '../types/myTypes';

const Schema = mongoose.Schema;

const Missing_Doc = new Schema<MissingDocModel>(
	{
		series: { type: String, trim: true },
		title: {
			type: String,
			trim: true,
			required: function () {
				return !this.url;
			},
		},
		url: {
			type: String,
			trim: true,
			required: function () {
				return !this.title;
			},
		},
	},
	{ timestamps: true }
);

module.exports = Missing_Doc;
