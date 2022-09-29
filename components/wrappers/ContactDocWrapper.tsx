import { Accordion, Button } from 'react-bootstrap';
import { ContactDocModel } from '../../types/myTypes';

interface Props {
	data: ContactDocModel[];
	docType: string;
	handleDelete: (docType: string, docId: string) => void;
}

const ContactDocWrapper = ({ data, docType, handleDelete }: Props) => {
	return (
		<Accordion className='col m-2'>
			<Accordion.Item eventKey='1'>
				<Accordion.Header>
					<h4 className='fw-bold'>Contact Messages</h4>
					<h4 className='me-sm-3 fw-bold text-sm-end'>
						{`${data.length} ${data.length === 1 ? 'message' : 'messages'}`}
					</h4>
				</Accordion.Header>
				<Accordion.Body>
					{(data as ContactDocModel[]).map((c) => (
						<div key={c._id} className='p-2 mb-2 bg-light rounded text-break'>
							<div className='d-flex justify-content-between'>
								<div>
									<strong>Email</strong>
									<a href={`mailto:${c.email}`} className='d-block'>
										{c.email}
									</a>
								</div>
								<div>
									<strong>Timestamp</strong>
									<p>{new Date(c.createdAt).toLocaleString()}</p>
								</div>
								<Button
									variant='danger'
									size='sm'
									className='fw-bolder mt-2 mt-sm-0 custom-button'
									onClick={() => handleDelete(docType, c._id)}
								>
									Delete
								</Button>
							</div>
							<div>
								<strong>Message</strong>
								<p className='text-capitalize'>{c.message}</p>
							</div>
						</div>
					))}
				</Accordion.Body>
			</Accordion.Item>
		</Accordion>
	);
};

export default ContactDocWrapper;
