import { Accordion, Button } from 'react-bootstrap';
import { ContactDocModel } from '../../types/myTypes';

interface Props {
	data: ContactDocModel[];
	docType: string;
	handleDelete: (docType: string, docId: string) => void;
}

const ContactDocWrapper = ({ data, docType, handleDelete }: Props) => {
	return (
		<Accordion>
			<Accordion.Item eventKey='1'>
				<Accordion.Header>
					<div className='w-100 d-flex align-items-center gap-3 me-3'>
						<h4 className='fw-bold'>Contact Messages</h4>
						<h4 className='fw-bold text-sm-end'>
							{`${data.length} ${data.length === 1 ? 'message' : 'messages'}`}
						</h4>
					</div>
				</Accordion.Header>
				<Accordion.Body className='d-flex flex-column gap-2'>
					{(data as ContactDocModel[]).map((contact) => (
						<div
							key={contact._id}
							className='d-flex flex-column gap-2 p-2 bg-light border border-info rounded text-break'
						>
							<div className='d-flex gap-3 justify-content-between'>
								<div>
									<strong>Email</strong>
									<a href={`mailto:${contact.email}`} className='d-block'>
										{contact.email}
									</a>
								</div>
								<div>
									<strong>Timestamp</strong>
									<p>{new Date(contact.createdAt).toLocaleString()}</p>
								</div>
								<Button
									size='sm'
									variant='danger'
									type='submit'
									className='fw-bolder text-nowrap custom-button'
									onClick={() => handleDelete(docType, contact._id)}
								>
									Delete
								</Button>
							</div>
							<div>
								<strong>Message</strong>
								<p className='text-capitalize'>{contact.message}</p>
							</div>
						</div>
					))}
				</Accordion.Body>
			</Accordion.Item>
		</Accordion>
	);
};

export default ContactDocWrapper;
