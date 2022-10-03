import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import { Accordion } from 'react-bootstrap';
import { GroupedByGP } from '../types/myTypes';
import F1DocWrapper from '../components/wrappers/F1DocWrapper';

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
	if (decodedToken !== process.env.JWT_PAYLOAD_STRING) {
		return false;
	}
	return true;
};

export const renderDocsGroupedByGP = (
	data: GroupedByGP,
	query: string,
	cmsProps?: {
		deleteHandler: (docType: string, docId: string) => void;
		docType: string;
		acceptHandler: (series: string, docId: string) => void;
	}
) => {
	if (Object.entries(data).length === 0) {
		return (
			<div className='m-5 text-center'>
				<h3>No Documents Found</h3>
			</div>
		);
	}
	const gpDocsArray = [];
	if (query) {
		let searchData = {} as GroupedByGP;
		for (const [key, array] of Object.entries(data)) {
			const filtered = array.filter(
				(doc) =>
					doc.penalty_type.toLowerCase().includes(query.toLowerCase()) ||
					doc.incident_info.Driver.toLowerCase().includes(query.toLowerCase())
			);
			if (filtered.length === 0) {
				continue;
			} else {
				searchData[key as keyof GroupedByGP] = filtered;
			}
		}
		for (const [key, array] of Object.entries(searchData)) {
			gpDocsArray.push(
				<Accordion key={key} id={key} className='p-0 my-2'>
					<Accordion.Item eventKey='0'>
						<Accordion.Header>
							<div className='d-flex flex-column me-2 flex-sm-row w-100 align-items-center'>
								<h4 className='me-sm-3 fw-bold text-capitalize'>{key}</h4>
								<h4 className='me-sm-3 fw-bold text-capitalize'>
									{array.find((doc) => doc.weekend)?.weekend}
								</h4>
								<h4 className='me-sm-3 fw-bold text-sm-end'>
									{array.length} {array.length === 1 ? 'penalty' : 'penalties'}
								</h4>
							</div>
						</Accordion.Header>
						<Accordion.Body className='bg-light'>
							{array.map((doc) => (
								<F1DocWrapper key={doc._id} data={doc} cmsProps={cmsProps} />
							))}
						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			);
		}
	} else {
		for (const [key, array] of Object.entries(data)) {
			gpDocsArray.push(
				<Accordion key={key} id={key} className='p-0 my-2'>
					<Accordion.Item eventKey='1'>
						<Accordion.Header>
							<div className='d-flex flex-column flex-sm-row w-100 align-items-center'>
								<h4 className='me-sm-3 fw-bold text-capitalize'>{key}</h4>
								<h4 className='me-sm-3 fw-bold text-capitalize'>
									{array.find((doc) => doc.weekend)?.weekend}
								</h4>
								<h4 className='me-sm-3 fw-bold text-sm-end'>
									{array.length} {array.length === 1 ? 'penalty' : 'penalties'}
								</h4>
							</div>
						</Accordion.Header>
						<Accordion.Body className='bg-light'>
							{array.map((doc) => (
								<F1DocWrapper key={doc._id} data={doc} cmsProps={cmsProps} />
							))}
						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			);
		}
	}
	return gpDocsArray;
};
