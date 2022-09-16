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
	none: { color: 'black', backgroundColor: 'beige' },
} as const;

type PTCkey = keyof typeof penaltyTypeColors;

const F1DocWrapper = ({ data }: Props) => {
	const [showDocModal, setShowDocModal] = useState(false);

	const handleOpenModal = () => {
		setShowDocModal(true);
	};

	const handleCloseModal = () => {
		setShowDocModal(false);
	};

	const modalDataRender = (obj: DecisionOffenceModel) => {
		const content = [];
		for (const [key, value] of Object.entries(obj.document_info)) {
			content.push(
				<div key={`document_info-${key}`} className='my-1'>
					<p className='fw-bold m-0 d-inline'>{key}:</p> {value}
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
						<p className='fw-bold m-0 d-inline'>{key}: </p>
						{(value as string[]).map((s, i) => {
							if (i === 0) {
								return (
									<p key={i} className='m-0 d-inline'>
										{s + '\n'}
									</p>
								);
							} else {
								return (
									<p key={i} className='m-0'>
										{s + '\n'}
									</p>
								);
							}
						})}
					</div>
				);
				continue;
			}
			content.push(
				<div key={key} className='my-2'>
					<p className='fw-bold m-0 d-inline'>{key}:</p> {value}
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
					<Accordion.Body className='d-flex flex-column flex-sm-row justify-content-between'>
						<div className='d-flex flex-grow-1 flex-column flex-md-row'>
							<div className='d-block d-md-none'>
								<p className='fw-bold d-inline'>Title: </p>
								<p className='d-inline'>{data.doc_name}</p>
							</div>
							<div className='me-md-3 mx-lg-0 me-lg-4'>
								<p className='fw-bold d-inline'>Date: </p>
								<p className='d-inline'>
									{data.document_info.Date} {data.document_info.Time}
								</p>
							</div>
							<div className='mx-md-3'>
								{data.incident_info.Decision.map((s, i) => {
									if (i === 0) {
										return (
											<>
												<p className='fw-bold m-0 d-inline'>Penalty: </p>
												<p className='d-inline'>{s}</p>
											</>
										);
									} else {
										return (
											<p className='' key={i}>
												{s}
											</p>
										);
									}
								})}
							</div>
						</div>
						<Button
							style={{ width: 'fit-content', height: 'fit-content' }}
							size='sm'
							variant='info'
							onClick={handleOpenModal}
						>
							Details
						</Button>
					</Accordion.Body>
				</Accordion.Item>
			</Accordion>
			<Modal
				show={showDocModal}
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
					<div className='me-auto'>
						<p className='fw-bold m-0 d-inline'>Stewards: </p>
						{data.stewards.join(', ')}
					</div>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default F1DocWrapper;
