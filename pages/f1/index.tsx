import type { GetServerSidePropsContext, NextPage } from 'next';
import connectMongo from '../../lib/mongo';
import { DecisionOffenceModel, GroupedByGP } from '../../types/myTypes';
import F1DocWrapper from '../../components/wrappers/F1DocWrapper';
import { dbNameList } from '../../lib/myData';
import { Accordion } from 'react-bootstrap';

interface Props {
	data: GroupedByGP;
}

const F1: NextPage<Props> = ({ data }) => {
	const renderDocs = (data: GroupedByGP) => {
		const gpDocsArray = [];
		for (const [key, array] of Object.entries(data)) {
			gpDocsArray.push(
				<Accordion key={key} id={key} className='p-0 my-2'>
					<Accordion.Item eventKey='0'>
						<Accordion.Header>
							<div className='d-flex flex-column flex-sm-row w-100 align-items-center'>
								<h4>{key}</h4>
								<h4>{array.find((doc) => doc.weekend)?.weekend}</h4>
							</div>
						</Accordion.Header>
						<Accordion.Body className='bg-light'>
							{array.map((doc) => (
								<F1DocWrapper key={doc._id} data={doc} />
							))}
						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			);
		}

		return gpDocsArray;
	};

	return (
		<div>
			<div className='m-2'>{renderDocs(data)}</div>
		</div>
	);
};

export const getServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	try {
		const conn = await connectMongo(dbNameList.f1_2022_db);
		const docsList: DecisionOffenceModel[] =
			await conn.models.Decision_Offence.find({}).sort({ doc_date: -1 }).exec();
		const groupedByGP: GroupedByGP = docsList.reduce((prev, curr) => {
			prev[curr.grand_prix] = prev[curr.grand_prix] || [];
			prev[curr.grand_prix].push(curr);
			return prev;
		}, Object.create(null));
		return {
			props: { data: JSON.parse(JSON.stringify(groupedByGP)) },
		};
	} catch (error) {
		console.log(error);
		return {
			props: { data: [] },
		};
	}
};

export default F1;
