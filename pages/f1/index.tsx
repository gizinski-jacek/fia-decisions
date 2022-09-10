import type { GetServerSidePropsContext, NextPage } from 'next';
import connectMongo from '../../lib/mongo';
import Decision from '../../models/decision';
import { DecisionMongoDBModel } from '../../types/myTypes';
import F1DocWrapper from '../../components/wrappers/F1DocWrapper';

interface Props {
	data: DecisionMongoDBModel[];
}

const F1: NextPage<Props> = ({ data }) => {
	return (
		<div>
			<div className='m-2'>
				{data.map((d) => (
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
		const decisionList: DecisionMongoDBModel[] = await Decision.find()
			.sort({ doc_date: -1 })
			.exec();
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
