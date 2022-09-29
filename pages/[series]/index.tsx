import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext, NextPage } from 'next';
import connectMongo from '../../lib/mongo';
import { dbNameList } from '../../lib/myData';
import { DecisionOffenceModel, GroupedByGP } from '../../types/myTypes';
import { Button, Form } from 'react-bootstrap';
import { renderDocsGroupedByGP } from '../../lib/utils';

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

	return (
		<div className='m-2'>
			<div
				className={`position-relative custom-search 
				${showSearchInput ? 'expanded' : ''}`}
			>
				<Button variant='dark' size='sm' onClick={handleShowSearchInput}>
					<i className='bi bi-search fs-6'></i>
				</Button>
				<Form className='position-absolute top-0 start-0 d-flex'>
					<Form.Group className='d-flex'>
						<Button variant='dark' size='sm' onClick={handleHideSearchInput}>
							<i className='bi bi-arrow-left fs-6'></i>
						</Button>
						<Form.Control
							className='py-0 px-2 mx-1'
							type='search'
							name='searchInput'
							id='searchInput'
							maxLength={32}
							onChange={handleInputChange}
							value={searchInput}
							placeholder='Penalty / Name / Car #'
							disabled={!showSearchInput || Object.entries(data).length === 0}
						/>
						<Button
							variant='dark'
							size='sm'
							disabled={!showSearchInput || Object.entries(data).length === 0}
							onClick={() => setSearchInput('')}
						>
							<i className='bi bi-x fs-6'></i>
						</Button>
					</Form.Group>
				</Form>
			</div>
			<h2
				className='text-center text-capitalize fw-bolder fst-italic'
				style={{ lineHeight: '2.15rem' }}
			>{`Formula ${router.query.series?.slice(-1)} Penalties`}</h2>
			<div>{renderDocsGroupedByGP(data, searchInput)}</div>
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
		const document_list: DecisionOffenceModel[] =
			await conn.models.Decision_Offence.find({}).sort({ doc_date: -1 }).exec();
		const groupedByGP: GroupedByGP = document_list.reduce((prev, curr) => {
			prev[curr.grand_prix] = prev[curr.grand_prix] || [];
			prev[curr.grand_prix].push(curr);
			return prev;
		}, Object.create(null));
		return {
			props: { data: JSON.parse(JSON.stringify(groupedByGP)) },
		};
	} catch (error: any) {
		return {
			props: { data: [] },
		};
	}
};

export default FormulaSeries;
