import type { GetServerSidePropsContext, NextPage } from 'next';
import connectMongo from '../../lib/mongo';
import { DecisionOffenceModel, GroupedByGP } from '../../types/myTypes';
import F1DocWrapper from '../../components/wrappers/F1DocWrapper';
import { dbNameList } from '../../lib/myData';
import { Accordion } from 'react-bootstrap';
import { useRouter } from 'next/router';

interface Props {
	data: GroupedByGP;
}

const F1: NextPage<Props> = ({ data }) => {
	const router = useRouter();

	const renderDocs = (data: GroupedByGP) => {
		const gpDocsArray = [];
		for (const [key, array] of Object.entries(data)) {
			gpDocsArray.push(
				<Accordion key={key} id={key} className='p-0 my-2'>
					<Accordion.Item eventKey='0'>
						<Accordion.Header>
							<div className='d-flex flex-column me-2 flex-sm-row w-100 align-items-center'>
								<h4 className='me-sm-3 fw-bold'>{key}</h4>
								<h4 className='fw-bold'>
									{array.find((doc) => doc.weekend)?.weekend}
								</h4>
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
		<div className='m-2'>
			<h2 className='text-center text-capitalize fw-bolder fst-italic '>{`Formula ${router.query.series?.slice(
				-1
			)} Penalties`}</h2>
			{renderDocs(data)}
		</div>
	);
};

export const getServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	try {
		let seriesDB = '';
		if (context.params?.series === 'f1') {
			seriesDB = dbNameList.f1_2022_db;
		} else if (context.params?.series === 'f2') {
			seriesDB = dbNameList.f2_2022_db;
		} else if (context.params?.series === 'f3') {
			seriesDB = dbNameList.f3_2022_db;
		} else if (context.params?.series === 'formula') {
			return {
				redirect: {
					destination: '/f1',
					permanent: false,
				},
			};
		} else if (context.params?.series === 'formula1') {
			return {
				redirect: {
					destination: '/f1',
					permanent: false,
				},
			};
		} else if (context.params?.series === 'formula2') {
			return {
				redirect: {
					destination: '/f2',
					permanent: false,
				},
			};
		} else if (context.params?.series === 'formula3') {
			return {
				redirect: {
					destination: '/f3',
					permanent: false,
				},
			};
		} else {
			return {
				props: { data: [] },
			};
		}
		const conn = await connectMongo(seriesDB);
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
