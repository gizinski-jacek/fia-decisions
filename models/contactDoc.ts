import mongoose from 'mongoose';
import { ContactDocModel } from '../types/myTypes';

const Schema = mongoose.Schema;

const Contact_Doc = new Schema<ContactDocModel>(
	{
		email: { type: String, trim: true, required: true },
		message: { type: String, trim: true, required: true },
	},
	{ timestamps: true }
);

module.exports = Contact_Doc;
