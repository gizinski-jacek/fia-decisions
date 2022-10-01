import { useState } from 'react';
import { Accordion, Button, Modal } from 'react-bootstrap';
import { DecisionOffenceModel, PenaltyColors } from '../../types/myTypes';

interface Props {
	data: DecisionOffenceModel;
	cmsProps?: {
		deleteHandler: (docType: string, docId: string) => void;
		docType: string;
		acceptHandler: (series: string, docId: string) => void;
	};
}

const penaltyTypeColors: PenaltyColors = {
	disqualified: { color: '#ffffff', backgroundColor: '#323232' },
	'drive through': { color: '#000000', backgroundColor: '#963c3c' },
	'drive-through': { color: '#000000', backgroundColor: '#963c3c' },
	'pit lane': { color: '#ffffff', backgroundColor: '#c832ff' },
	'pit-lane': { color: '#ffffff', backgroundColor: '#c832ff' },
	grid: { color: '#000000', backgroundColor: '#f50000' },
	time: { color: '#000000', backgroundColor: '#fae100' },
	fine: { color: '#000000', backgroundColor: '#00c800' },
	warning: { color: '#000000', backgroundColor: '#ff64c8' },
	reprimand: { color: '#000000', backgroundColor: '#32c8fa' },
	none: { color: '#000000', backgroundColor: '#f0f0f0' },
};

const F1DocWrapper = ({ data, cmsProps }: Props) => {
	const [showDocModal, setShowDocModal] = useState(false);

	const handleOpenModal = () => {
		setShowDocModal(true);
	};

	const handleCloseModal = () => {
		setShowDocModal(false);
	};

	const modalDataRender = (obj: DecisionOffenceModel) => {
		const content = [];
		content.push(
			<h4 key={'title'} className='fw-bold'>
				{obj.doc_name}
			</h4>
		);

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
						<div className='d-flex flex-column w-100 flex-sm-row align-items-center custom-container'>
							<div
								className='rounded-pill border border-dark p-1 me-sm-1 text-capitalize text-center fw-bold'
								style={{
									...penaltyTypeColors[
										data.penalty_type as keyof PenaltyColors
									],
								}}
							>
								{data.penalty_type === 'grid'
									? data.incident_info.Decision[0].match(/\d{1,2}.grid\)?/gim)
										? '+ ' +
										  data.incident_info.Decision[0].match(
												/\d{1,2}.grid\)?/gim
										  )![0]
										: data.incident_info.Decision[0].match(
												/back.*starting.*grid?/gim
										  )
										? 'Back of grid'
										: data.penalty_type
									: data.penalty_type === 'time'
									? data.incident_info.Decision[0].match(
											/\d{1,2}.*second.*time\)?/gim
									  )
										? '+ ' +
										  data.incident_info.Decision[0]
												.match(/\d{1,2}.*second.*time\)?/gim)![0]
												.toLowerCase()
												.replace(' second', 's')
										: data.penalty_type
									: data.penalty_type}
							</div>
							<div className='d-none d-sm-block m-1 me-sm-2 text-center fw-bold text-break'>
								{data.incident_info.Session}
							</div>
							<div className='m-1 me-sm-2 text-center text-sm-start fw-bold'>
								{data.incident_info.Driver}
							</div>
							<div className='me-sm-2 d-sm-none d-md-block text-capitalize text-center text-sm-start  flex-grow-1 fw-bold'>
								{data.incident_title}
							</div>
						</div>
					</Accordion.Header>
					<Accordion.Body className='d-flex flex-column flex-sm-row justify-content-between'>
						<div className='d-flex flex-grow-1 flex-column flex-md-row'>
							<div className='d-block d-md-none'>
								<p className='fw-bold d-inline'>Title: </p>
								<p className='d-inline'>{data.doc_name}</p>
							</div>
							<div className='col-md-4 me-md-3 mx-lg-0 me-lg-4'>
								<p className='fw-bold d-inline'>Date: </p>
								<p className='d-inline'>
									{data.document_info.Date} {data.document_info.Time}
								</p>
							</div>
							<div className='d-block d-sm-none'>
								<p className='fw-bold d-inline'>Session: </p>
								<p className='d-inline'>{data.incident_info.Session}</p>
							</div>
							<div className='mx-md-3'>
								{data.incident_info.Decision.map((s, i) => {
									if (i === 0) {
										return (
											<div key={i}>
												<p className='fw-bold m-0 d-inline'>Penalty: </p>
												<p className='d-inline'>{s}</p>
											</div>
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
						<div className='d-flex flex-column'>
							<Button
								size='sm'
								variant='info'
								className='fw-bolder mt-2 mt-sm-0 custom-button'
								onClick={handleOpenModal}
							>
								Details
							</Button>
							{cmsProps && (
								<>
									<Button
										size='sm'
										variant='danger'
										className='fw-bolder mt-2 custom-button'
										onClick={() =>
											cmsProps.deleteHandler(cmsProps.docType, data._id)
										}
									>
										Delete
									</Button>
									{cmsProps.docType === 'penalties__missing-file' && (
										<Button
											size='sm'
											variant='success'
											className='fw-bolder mt-2 custom-button'
											onClick={() =>
												cmsProps.acceptHandler(data.series, data._id)
											}
										>
											Accept
										</Button>
									)}
								</>
							)}
						</div>
					</Accordion.Body>
				</Accordion.Item>
			</Accordion>
			<Modal
				show={showDocModal}
				onHide={handleCloseModal}
				dialogClassName='modal-lg'
			>
				<Modal.Header closeButton>
					<Modal.Title className='fw-bolder'>Document Details</Modal.Title>
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
