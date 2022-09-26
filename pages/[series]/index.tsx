import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext, NextPage } from 'next';
import connectMongo from '../../lib/mongo';
import { dbNameList } from '../../lib/myData';
import F1DocWrapper from '../../components/wrappers/F1DocWrapper';
import { DecisionOffenceModel, GroupedByGP } from '../../types/myTypes';
import { Accordion, Button, Form } from 'react-bootstrap';

interface Props {
	data: GroupedByGP;
}

const FormulaSeries: NextPage<Props> = ({ data }) => {
	const [showSearchInput, setShowSearchInput] = useState(false);
	const [searchInput, setSearchInput] = useState('');

	const router = useRouter();

	const handleShowSearchInput = () => {
		setShowSearchInput(true);
	};

	const handleHideSearchInput = () => {
		setSearchInput('');
		setShowSearchInput(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setSearchInput(value);
	};

	const renderDocs = (data: GroupedByGP, query: string) => {
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
									<h4 className='me-sm-5 fw-bold'>{key}</h4>
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
		} else {
			for (const [key, array] of Object.entries(data)) {
				gpDocsArray.push(
					<Accordion key={key} id={key} className='p-0 my-2'>
						<Accordion.Item eventKey='0'>
							<Accordion.Header>
								<div className='d-flex flex-column me-2 flex-sm-row w-100 align-items-center'>
									<h4 className='me-sm-5 fw-bold'>{key}</h4>
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
		}
		return gpDocsArray;
	};

	return (
		<div className='m-2 position-relative'>
			<div
				className={`position-sticky top-0 start-0 w-25 custom-search 
				${showSearchInput ? 'expanded' : ''}`}
			>
				<Button variant='dark' size='sm' onClick={handleShowSearchInput}>
					<i className='bi bi-search fs-6'></i>
				</Button>
				<Form>
					<Form.Group className='d-flex'>
						<Button variant='dark' size='sm' onClick={handleHideSearchInput}>
							<i className='bi bi-arrow-left fs-6'></i>
						</Button>
						<Form.Control
							className='py-0 px-2 mx-1'
							type='text'
							name='searchInput'
							id='searchInput'
							maxLength={32}
							onChange={handleInputChange}
							value={searchInput}
							placeholder='Driver Name'
							disabled={!showSearchInput}
						/>
						<Button variant='dark' size='sm' onClick={() => setSearchInput('')}>
							<i className='bi bi-x fs-6'></i>
						</Button>
					</Form.Group>
				</Form>
			</div>
			<h2 className='text-center text-capitalize fw-bolder fst-italic '>{`Formula ${router.query.series?.slice(
				-1
			)} Penalties`}</h2>
			{renderDocs(data, searchInput)}
		</div>
	);
};

export const getServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	try {
		let seriesDB = '';
		const { series } = context.params as { series: string };
		if (series === 'f1') {
			seriesDB = dbNameList.f1_2022_db;
		} else if (series === 'f2') {
			seriesDB = dbNameList.f2_2022_db;
		} else if (series === 'f3') {
			seriesDB = dbNameList.f3_2022_db;
		} else if (series === 'formula') {
			return {
				redirect: {
					destination: '/f1',
					permanent: false,
				},
			};
		} else if (series === 'formula1') {
			return {
				redirect: {
					destination: '/f1',
					permanent: false,
				},
			};
		} else if (series === 'formula2') {
			return {
				redirect: {
					destination: '/f2',
					permanent: false,
				},
			};
		} else if (series === 'formula3') {
			return {
				redirect: {
					destination: '/f3',
					permanent: false,
				},
			};
		} else {
			return {
				notFound: true,
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
		return {
			props: { data: [] },
		};
	}
};

export default FormulaSeries;
