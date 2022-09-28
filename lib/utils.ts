import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: NextApiRequest) => {
	if (!process.env.JWT_STRATEGY_SECRET) {
		throw new Error(
			'Please define JWT_STRATEGY_SECRET environment variable inside .env.local'
		);
	}
	const { token } = req.cookies;
	if (!token) {
		return false;
	}
	const decodedToken = jwt.verify(token, process.env.JWT_STRATEGY_SECRET);
	if (decodedToken !== process.env.PAYLOAD_STRING) {
		return false;
	}
	console.log(2);
	return true;
};
