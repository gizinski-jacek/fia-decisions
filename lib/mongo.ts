import mongoose, { Mongoose, MongooseOptions } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
	throw new Error(
		'Please define the MONGODB_URI environment variable inside .env.local'
	);
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { client: null };
}

const connectMongo = async (dbName: string) => {
	const opts: MongooseOptions = {
		bufferCommands: true,
	};

	if (!cached.client) {
		const client = await mongoose.connect(
			MONGODB_URI + dbName + '?retryWrites=true&w=majority',
			opts
		);
		if (dbName === 'missingDocs') {
			if (!client.models.Missing_Doc) {
				client.model('Missing_Doc', require('../models/missingDoc'));
			}
		} else {
			if (!client.models.Decision_Offence) {
				client.model('Decision_Offence', require('../models/decisionOffence'));
			}
		}

		cached.client = client;
		return cached.client.connections[0];
	}

	const conn = cached.client.connections.find((conn) => conn.name === dbName);
	if (!conn) {
		const conn = cached.client.createConnection(
			MONGODB_URI + dbName + '?retryWrites=true&w=majority',
			opts
		);
		if (dbName === 'missingDocs') {
			if (!conn.models.Missing_Doc) {
				conn.model('Missing_Doc', require('../models/missingDoc'));
			}
		} else {
			if (!conn.models.Decision_Offence) {
				conn.model('Decision_Offence', require('../models/decisionOffence'));
			}
		}
		return conn;
	}
	return conn;

	// cached.client.connection.useDb(dbName, {
	// 	useCache: true,
	// 	noListener: true,
	// });
};

export default connectMongo;
