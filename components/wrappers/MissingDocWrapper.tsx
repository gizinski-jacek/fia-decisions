import { Accordion, Button } from 'react-bootstrap';
import { MissingDocModel } from '../../types/myTypes';

interface Props {
	data: MissingDocModel[];
	docType: string;
	handleDelete: (docType: string, docId: string) => void;
}

const MissingDocWrapper = ({ data, docType, handleDelete }: Props) => {
	return (
		<Accordion className='col m-2'>
			<Accordion.Item eventKey='0'>
				<Accordion.Header>
					<h4 className='fw-bold'>Missing Penalties</h4>
					<h4 className='me-sm-3 fw-bold text-sm-end'>
						{`${data.length} missing`}
					</h4>
				</Accordion.Header>
				<Accordion.Body>
					{data.map((missing) => (
						<div
							key={missing._id}
							className='p-2 mb-2 bg-light rounded text-break'
						>
							<div className='d-flex justify-content-between'>
								<div>
									<strong>Series</strong>
									<p className='text-capitalize'>{missing.series}</p>
								</div>
								<Button
									variant='danger'
									size='sm'
									className='fw-bolder mt-2 mt-sm-0 custom-button'
									onClick={() => handleDelete(docType, missing._id)}
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
