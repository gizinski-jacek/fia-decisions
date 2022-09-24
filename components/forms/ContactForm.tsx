import { useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { FormContactData } from '../../types/myTypes';
import { defaultContactData } from '../../lib/myData';
import LoadingBar from '../LoadingBar';

const ContactForm = () => {
	const [formData, setFormData] = useState<FormContactData>(defaultContactData);
	const [formErrors, setFormErrors] = useState<string[]>([]);
	const [sending, setSending] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormErrors([]);
		const { name, value } = e.target;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setSubmitSuccess(false);
		setFormErrors([]);
		try {
			if (!formData.email && !formData.message) {
				setFormErrors(['Must provide an Email and a Message.']);
				return;
			}
			const uploadData = new FormData();
			for (const [key, value] of Object.entries(formData)) {
				uploadData.append(key, value);
			}
			setSending(true);
			await axios.post('/api/forms/contact', uploadData, { timeout: 15000 });
			setFormData(defaultContactData);
			formRef.current?.reset();
			setSubmitSuccess(true);
			setSending(false);
		} catch (error) {
			setSubmitSuccess(false);
			setSending(false);
			if (error instanceof AxiosError) {
				Array.isArray(error?.response?.data)
					? setFormErrors(error?.response?.data || ['Unknown server error.'])
					: setFormErrors([error?.response?.data || 'Unknown server error.']);
			} else {
				setFormErrors([(error as Error).message || 'Unknown server error.']);
			}
		}
	};

	return (
		<Form ref={formRef}>
			<h4>
				Use this form to report something or contact me about any other matter.
			</h4>
			<div className='p-3 my-3 rounded-2 bg-light'>
				<Form.Group className='mb-3'>
					<Form.Label htmlFor='email' className='fw-bolder'>
						Email
					</Form.Label>
					<Form.Control
						className={` ${
							formErrors.length > 0 && !formData.email
								? 'outline-error'
								: !formData.email ||
								  formData.email.length < 8 ||
								  formData.email.length > 64
								? 'outline-warning'
								: 'outline-success'
						}`}
						type='text'
						name='email'
						id='email'
						minLength={8}
						maxLength={64}
						onChange={handleInputChange}
						value={formData.email}
						placeholder='Email'
						disabled={sending}
						aria-describedby='emailInputHelpText'
					/>
					<Form.Text muted id='emailInputHelpText'>
						Valid email, 8-64 characters long
					</Form.Text>
				</Form.Group>
				<Form.Group>
					<Form.Label htmlFor='message' className='fw-bolder'>
						Message
					</Form.Label>
					<Form.Control
						as='textarea'
						className={
							formErrors.length > 0 && !formData.message
								? 'outline-error'
								: !formData.message ||
								  formData.message.length < 4 ||
								  formData.message.length > 512
								? 'outline-warning'
								: 'outline-success'
						}
						type='text'
						name='message'
						id='message'
						minLength={4}
						maxLength={512}
						rows={formData.message.length <= 256 ? 7 : 13}
						onChange={handleInputChange}
						value={formData.message}
						placeholder='Message'
						disabled={sending}
						aria-describedby='messageInputHelpText'
					/>
					<Form.Text muted id='messageInputHelpText'>
						Message 4-512 characters long
					</Form.Text>
					{formErrors.length > 0 && (
						<div className='m-0 mt-4 alert alert-danger alert-dismissible'>
							{formErrors.map((message, index) => (
								<div key={index}>{message}</div>
							))}
							<button
								type='button'
								className='btn btn-close'
								onClick={() => setFormErrors([])}
							></button>
						</div>
					)}
					{submitSuccess && (
						<div className='m-0 mt-4 alert alert-success alert-dismissible'>
							<strong>Form submitted successfully!</strong>
							<button
								type='button'
								className='btn btn-close'
								onClick={() => setSubmitSuccess(false)}
							></button>
						</div>
					)}
					{sending && <LoadingBar />}
				</Form.Group>
			</div>
			<div className='w-100 text-end'>
				<Button
					variant='primary'
					type='submit'
					className='fw-bolder'
					disabled={sending}
					onClick={handleSubmit}
				>
					Submit
				</Button>
			</div>
		</Form>
	);
};

export default ContactForm;
