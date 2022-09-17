import { useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { FormContactData } from '../../types/myTypes';
import { defaultContactData } from '../../lib/myData';

const ContactForm = () => {
	const [formData, setFormData] = useState<FormContactData>(defaultContactData);
	const [formErrors, setFormErrors] = useState<string[]>([]);
	const formRef = useRef<HTMLFormElement>(null);

	const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormErrors([]);
		const { name, value } = e.target;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		try {
			if (!formData.email && !formData.message) {
				setFormErrors(['Must provide an Email and a Message']);
				return;
			}
			const uploadData = new FormData();
			for (const [key, value] of Object.entries(formData)) {
				uploadData.append(key, value);
			}
			await axios.post('/api/forms/contact', uploadData);
			setFormData(defaultContactData);
			setFormErrors([]);
			formRef.current?.reset();
		} catch (error) {
			if (error instanceof AxiosError) {
				setFormErrors([error?.response?.data || 'Unknown server error']);
			} else {
				setFormErrors([(error as Error).message || 'Unknown server error']);
			}
		}
	};

	return (
		<Form ref={formRef}>
			<h4>
				Use this form to report something or contact me about any other matter.
			</h4>
			<Form.Group className='p-3 my-3 rounded-2 bg-light'>
				<Form.Label htmlFor='email'>Email</Form.Label>
				<Form.Control
					className={`mb-2 ${
						formErrors.length && !formData.email
							? 'outline-error'
							: !formData.email
							? 'outline-warning'
							: 'outline-success'
					}`}
					type='text'
					name='email'
					id='email'
					maxLength={16}
					onChange={handleInputChange}
					value={formData.email}
					placeholder='Email'
				/>
				<Form.Label htmlFor='message'>Message</Form.Label>
				<Form.Control
					className={`mb-2 ${
						formErrors.length && !formData.message
							? 'outline-error'
							: !formData.message
							? 'outline-warning'
							: 'outline-success'
					}`}
					type='text'
					name='message'
					id='message'
					maxLength={128}
					onChange={handleInputChange}
					value={formData.message}
					placeholder='Message'
				/>
			</Form.Group>
			{formErrors.map((message, index) => (
				<div className='mx-1 text-danger' key={index}>
					{message}
				</div>
			))}
			<div className='pt-3 w-100 border-top text-end'>
				<Button variant='primary' type='submit' onClick={handleSubmit}>
					Submit
				</Button>
			</div>
		</Form>
	);
};

export default ContactForm;
