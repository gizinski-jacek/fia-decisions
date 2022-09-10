import type { GetServerSidePropsContext, NextPage } from 'next';
import axios from 'axios';
import connectMongo from '../../lib/mongo';
import Decision from '../../models/decision';
import { useState } from 'react';
import { DecisionMongoDBModel } from '../../types/myTypes';
import F1DocWrapper from '../../components/wrappers/F1DocWrapper';

interface Props {
	data: DecisionMongoDBModel[];
}

const F1: NextPage<Props> = ({ data }) => {
	const testFetch = async () => {
		try {
			const res = await axios.get(
				'/api/f1/force-update-all/decisions-offences'
			);
			console.log(res.data);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<button onClick={testFetch}>Test Fetch - Dont Abuse</button>
			<div className='m-2'>
				{data
					.sort((a, b) => {
						const dateB = new Date(`${b.heading.Date} ${b.heading.Time}`);
						const dateA = new Date(`${a.heading.Date} ${a.heading.Time}`);
						return dateB - dateA;
					})
					.map((d) => (
						<F1DocWrapper key={d._id} data={d} />
					))}
			</div>
		</div>
	);
};

export const getServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	try {
		await connectMongo();
		const decisionList: DecisionMongoDBModel[] = await Decision.find().exec();
		return {
			props: { data: JSON.parse(JSON.stringify(decisionList)) },
		};
	} catch (error) {
		console.log(error);
		return {
			props: { data: [] },
		};
	}
};

export default F1;
