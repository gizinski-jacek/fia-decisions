import { useState } from 'react';
import { Accordion, Button, Modal } from 'react-bootstrap';
import { formatPenalty } from '../../lib/utils';
import { PenaltyModel, PenaltyColors } from '../../types/myTypes';

interface Props {
	data: PenaltyModel;
	cmsProps?: {
		deleteHandler: (docType: string, docId: string) => void;
		docType: string;
		acceptHandler: (series: string, docId: string) => void;
	};
}

const penaltyTypeColors: PenaltyColors = {
	disqualified: { color: '#ffffff', backgroundColor: '#323232' },
	'drive through': { color: '#ffffff', backgroundColor: '#964b4b' },
	'drive-through': { color: '#ffffff', backgroundColor: '#964b4b' },
	'pit lane': { color: '#000000', backgroundColor: '#c832ff' },
	'pit-lane': { color: '#000000', backgroundColor: '#c832ff' },
	grid: { color: '#000000', backgroundColor: '#f50000' },
	'stop and go': { color: '#000000', backgroundColor: '#ff7d00' },
	'stop & go': { color: '#000000', backgroundColor: '#ff7d00' },
	time: { color: '#000000', backgroundColor: '#fae100' },
	fine: { color: '#000000', backgroundColor: '#00f000' },
	warning: { color: '#000000', backgroundColor: '#ff64c8' },
	reprimand: { color: '#000000', backgroundColor: '#32c8fa' },
	'no penalty': { color: '#000000', backgroundColor: '#f0f0f0' },
};

const F1DocWrapper = ({ data, cmsProps }: Props) => {
	const [showDocModal, setShowDocModal] = useState(false);

	const handleOpenModal = () => {
		setShowDocModal(true);
	};

	const handleCloseModal = () => {
		setShowDocModal(false);
	};

	const modalDataRender = (obj: PenaltyModel) => {
		const content = [];
		content.push(
			<h4 key={'title'} className='text-capitalize fw-bold'>
				{obj.doc_name}
			</h4>
		);

		for (const [key, value] of Object.entries(obj.document_info)) {
			content.push(
				<div key={`document_info-${key}`}>
					<p className='fw-bold m-0 d-inline'>{key}:</p> {value}
				</div>
			);
		}
		content.push(<div key={'headline'}>{obj.incident_info.Headline}</div>);

		for (const [key, value] of Object.entries(obj.incident_info)) {
			if (key === 'Headline') {
				continue;
			}
			if (key === 'Fact' || key === 'Decision') {
				content.push(
					<div key={`incident_info-${key}`}>
						<p className='fw-bold d-inline'>{key}: </p>
						{(value as string[]).map((str, i) => {
							if (i === 0) {
								return (
									<p key={i} className='d-inline'>
										{str + '\n'}
									</p>
								);
							} else {
								return <p key={i}>{str + '\n'}</p>;
							}
						})}
					</div>
				);
				continue;
			}
			content.push(
				<div key={key}>
					<p className='fw-bold  d-inline'>{key}:</p> {value}
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
								className='rounded-pill border border-dark p-1 me-sm-1 text-capitalize text-center text-nowrap fw-bold'
								style={{
									...penaltyTypeColors[
										data.penalty_type as keyof PenaltyColors
									],
								}}
							>
								{formatPenalty(
									data.penalty_type,
									data.incident_info.Decision[0]
								)}
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
								{data.incident_info.Decision.map((str, i) => {
									if (i === 0) {
										return (
											<div key={i}>
												<p className='fw-bold m-0 d-inline'>Penalty: </p>
												<p className='d-inline'>{str}</p>
											</div>
										);
									} else {
										return <p key={i}>{str}</p>;
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
									{cmsProps.docType === 'missing-file' && (
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
					<div className='d-flex flex-column gap-1'>
						{modalDataRender(data)}
					</div>
				</Modal.Body>
				<Modal.Footer className='justify-content-start'>
					<div>
						<p className='fw-bold d-inline'>Stewards: </p>
						{data.stewards.join(', ')}
					</div>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default F1DocWrapper;
