import { useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { ContactFormValues } from '../../types/myTypes';
import { defaultContactFormValues } from '../../lib/myData';
import LoadingBar from '../LoadingBar';
import ErrorMsg from '../ErrorMsg';

const ContactForm = () => {
	const [formData, setFormData] = useState<ContactFormValues>(
		defaultContactFormValues
	);
	const [formErrors, setFormErrors] = useState<string[] | null>(null);
	const [fetching, setFetching] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		handleDismissAlert();
		const { name, value } = e.target;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		try {
			e.preventDefault();
			handleDismissAlert();
			if (!formData.email && !formData.message) {
				setFormErrors(['Must provide an Email and a Message.']);
				return;
			}
			const uploadData = new FormData();
			for (const [key, value] of Object.entries(formData)) {
				uploadData.append(key, value);
			}
			setFetching(true);
			await axios.post('/api/forms/contact', uploadData, { timeout: 15000 });
			setFormData(defaultContactFormValues);
			formRef.current?.reset();
			setSubmitSuccess('Form submitted successfully!');
			setFetching(false);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				Array.isArray(error?.response?.data)
					? setFormErrors(
							error?.response?.data || [
								'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.',
							]
					  )
					: setFormErrors([
							error?.response?.data ||
								'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.',
					  ]);
			} else {
				setFormErrors([
					(error as Error).message ||
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.',
				]);
			}
			setFetching(false);
		}
	};

	const handleDismissAlert = () => {
		setFormErrors(null);
		setSubmitSuccess(null);
	};

	return (
		<Form ref={formRef} className='d-flex flex-column gap-3'>
			<h5>
				Use this form to report issue with the site or contact me about any
				other matter.
			</h5>
			<div className='d-flex flex-column gap-3 p-3 rounded-2 bg-light'>
				<Form.Group>
					<Form.Label htmlFor='email' className='fw-bolder'>
						Email
					</Form.Label>
					<Form.Control
						className={` ${
							formErrors && !formData.email
								? 'outline-error'
								: !formData.email ||
								  formData.email.length < 16 ||
								  formData.email.length > 64
								? 'outline-warning'
								: 'outline-success'
						}`}
						type='text'
						name='email'
						id='email'
						minLength={16}
						maxLength={64}
						onChange={handleInputChange}
						value={formData.email}
						placeholder='Your Email'
						disabled={fetching}
						required
						aria-describedby='emailInputHelpText'
					/>
					<Form.Text muted id='emailInputHelpText'>
						Valid email, 16-64 characters long.
					</Form.Text>
				</Form.Group>
				<Form.Group>
					<Form.Label htmlFor='message' className='fw-bolder'>
						Message
					</Form.Label>
					<Form.Control
						className={
							formErrors && !formData.message
								? 'outline-error'
								: !formData.message ||
								  formData.message.length < 16 ||
								  formData.message.length > 512
								? 'outline-warning'
								: 'outline-success'
						}
						type='text'
						as='textarea'
						name='message'
						id='message'
						minLength={16}
						maxLength={512}
						rows={formData.message.length <= 256 ? 6 : 12}
						onChange={handleInputChange}
						value={formData.message}
						placeholder='Insert your message'
						disabled={fetching}
						required
						aria-describedby='messageInputHelpText'
					/>
					<Form.Text muted id='messageInputHelpText'>
						Message, 16-512 characters long.
					</Form.Text>
				</Form.Group>
				{formErrors && (
					<ErrorMsg errors={formErrors} dismiss={handleDismissAlert} />
				)}
				{submitSuccess && (
					<div className='d-flex m-0 mb-2 alert alert-success alert-dismissible overflow-auto custom-alert-maxheight text-start'>
						<i className='bi bi-patch-check-fill fs-5 m-0 me-2'></i>
						<strong>{submitSuccess}</strong>
						<button
							type='button'
							className='btn btn-close'
							onClick={handleDismissAlert}
						></button>
					</div>
				)}
				{fetching && <LoadingBar width='100%' />}
			</div>
			<div className='w-100 text-end'>
				<Button
					variant='primary'
					type='submit'
					className='fw-bolder'
					disabled={
						fetching || !formData.email || !formData.message || !!formErrors
					}
					onClick={handleSubmit}
				>
					Submit
				</Button>
			</div>
		</Form>
	);
};

export default ContactForm;
