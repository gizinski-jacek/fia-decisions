import type { GetServerSidePropsContext, NextPage } from 'next';
import axios from 'axios';
import connectMongo from '../../lib/mongo';
import Decision from '../../models/decision';
import { useState } from 'react';
import { DecisionModel } from '../../types/myTypes';

interface Props {
	data: DecisionModel[];
}

const F1: NextPage<Props> = ({ data }) => {
	const [pageData, setPageData] = useState<DecisionModel[]>(data);

	const testFetch = async () => {
		try {
			const res = await axios.get('/api/f1/update');
			console.log(res.data);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<button onClick={testFetch}>testFetch</button>
		</div>
	);
};

export const getServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	try {
		await connectMongo();
		const decisionList: DecisionModel[] = await Decision.find().exec();
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
