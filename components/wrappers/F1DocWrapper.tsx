import { useState } from 'react';
import { Accordion, Button, Modal } from 'react-bootstrap';
import { DecisionOffenceModel } from '../../types/myTypes';

interface Props {
	data: DecisionOffenceModel;
}

const penaltyTypeColors = {
	time: { color: 'black', backgroundColor: 'lime' },
	grid: { color: 'black', backgroundColor: 'red' },
	fine: { color: 'black', backgroundColor: 'pink' },
	disqualified: { color: 'white', backgroundColor: 'black' },
	warning: { color: 'black', backgroundColor: 'yellow' },
	'drive through': { color: 'white', backgroundColor: 'purple' },
	'pit lane': { color: 'white', backgroundColor: 'brown' },
	reprimand: { color: 'white', backgroundColor: 'green' },
	none: { color: 'black', backgroundColor: 'white' },
} as const;

type PTCkey = keyof typeof penaltyTypeColors;

const F1DocWrapper = ({ data }: Props) => {
	const [showModal, setShowModal] = useState(false);

	const handleShowModal = () => {
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

	const modalDataRender = (obj: DecisionOffenceModel) => {
		const content = [];
		for (const [key, value] of Object.entries(obj.document_info)) {
			content.push(
				<div key={`document_info-${key}`} className='my-1'>
					{key}: {value}
				</div>
			);
		}
		content.push(
			<div key={'headline'} className='my-2 mt-3'>
				{obj.incident_info.Headline}
			</div>
		);

		for (const [key, value] of Object.entries(obj.incident_info)) {
			if (key === 'Headline') {
				continue;
			}
			if (key === 'Fact' || key === 'Decision') {
				content.push(
					<div key={`incident_info-${key}`} className='my-2'>
						<div>{`${key}:`}</div>
						<div>
							{(value as string[]).map((s, i) => (
								<p key={i} className='m-0'>
									{s + '\n'}
								</p>
							))}
						</div>
					</div>
				);
				continue;
			}
			content.push(
				<div key={key} className='my-2'>
					{`${key}:`} {value}
				</div>
			);
		}

		return content;
	};

	return (
		<>
			<Accordion id={data._id} className='my-1'>
				<Accordion.Item eventKey='0'>
					<Accordion.Header className='p-0 m-0'>
						<div className='d-flex flex-column w-100 flex-sm-row align-items-center'>
							<div
								className='border rounded p-1 me-2 text-uppercase text-center'
								style={{
									width: '180px',
									...penaltyTypeColors[data.penalty_type as PTCkey],
								}}
							>
								{data.penalty_type}
							</div>
							<div
								className='m-2 text-center text-sm-start'
								style={{ width: '220px' }}
							>
								{data.incident_info.Driver}
							</div>
							<div className='m-2 d-none d-md-block' style={{ flex: 1 }}>
								{data.doc_name}
							</div>
						</div>
					</Accordion.Header>
					<Accordion.Body className='mx-2 mx-sm-0 d-flex flex-column flex-sm-row justify-content-between'>
						<div className='d-flex flex-grow-1 flex-column flex-md-row'>
							<div className='me-md-2 d-block d-lg-none'>
								<p className='mb-2 mb-md-0'>Weekend: {data.weekend}</p>
							</div>
							<div className='me-md-2 d-block d-md-none'>
								<p className='mb-2 mb-md-0'>Title: {data.doc_name}</p>
							</div>
							<div className='mx-md-2 mx-lg-0 me-lg-4'>
								<p className='mb-2 mb-md-0'>
									Date: {data.document_info.Date} {data.document_info.Time}
								</p>
							</div>
							<div className='my-2 m-md-0 mx-md-2 mx-lg-4'>
								{data.incident_info.Decision.map((s, i) => {
									if (i === 0) {
										return (
											<p className='mb-2 mb-md-0' key={i}>
												Penalty: {s}
											</p>
										);
									}
									return (
										<p className='mb-2 mb-md-0' key={i}>
											{s}
										</p>
									);
								})}
							</div>
						</div>
						<Button
							style={{ width: 'fit-content', height: 'fit-content' }}
							size='sm'
							variant='info'
							onClick={handleShowModal}
						>
							Details
						</Button>
					</Accordion.Body>
				</Accordion.Item>
			</Accordion>
			<Modal
				show={showModal}
				onHide={handleCloseModal}
				dialogClassName='modal-lg'
			>
				<Modal.Header closeButton>
					<Modal.Title>Document Details</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className='text-break'>{modalDataRender(data)}</div>
				</Modal.Body>
				<Modal.Footer className='d-flex flex-row'>
					<div className='me-auto'>Stewards: {data.stewards.join(', ')}</div>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default F1DocWrapper;
