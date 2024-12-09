import { Accordion, Button } from 'react-bootstrap';
import { MissingDocModel, SelectDocumentsValues } from '../../types/myTypes';

interface Props {
	data: MissingDocModel[];
	docType: SelectDocumentsValues;
	handleDelete: (
		e: React.MouseEvent<HTMLButtonElement>,
		docType: SelectDocumentsValues,
		docId: string
	) => void;
}

const MissingDocWrapper = ({ data, docType, handleDelete }: Props) => {
	return (
		<Accordion>
			<Accordion.Item eventKey='2'>
				<Accordion.Header>
					<div className='w-100 d-flex align-items-center gap-3 me-3'>
						<h4 className='fw-bold'>Missing Penalties</h4>
						<h4 className='fw-bold text-sm-end'>{`${data.length} missing`}</h4>
					</div>
				</Accordion.Header>
				<Accordion.Body className='d-flex flex-column gap-2'>
					{data.map((missing) => (
						<div
							key={missing._id}
							className='d-flex flex-column gap-2 p-2 bg-light border border-info rounded text-break'
						>
							<div className='d-flex gap-3 justify-content-between align-items-start'>
								<div>
									<strong>Series</strong>
									<p className='text-capitalize'>{missing.series}</p>
								</div>
								<Button
									variant='danger'
									size='sm'
									className='fw-bolder text-nowrap'
									onClick={(e) => handleDelete(e, docType, missing._id)}
								>
									Delete
								</Button>
							</div>
							<div>
								<strong>Description</strong>
								<p className='text-capitalize'>{missing.description}</p>
							</div>
						</div>
					))}
				</Accordion.Body>
			</Accordion.Item>
		</Accordion>
	);
};

export default MissingDocWrapper;
