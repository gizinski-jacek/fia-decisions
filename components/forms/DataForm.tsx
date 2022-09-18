import { useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { FormDocData } from '../../types/myTypes';
import { defaultDocData } from '../../lib/myData';
import LoadingBar from '../LoadingBar';

const DataForm = () => {
	const [formData, setFormData] = useState<FormDocData>(defaultDocData);
	const [formErrors, setFormErrors] = useState<string[]>([]);
	const [sending, setSending] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	const handleInputChange = async (e: React.ChangeEvent<HTMLElement>) => {
		setFormErrors([]);
		const { name, value } = e.target as HTMLSelectElement | HTMLInputElement;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setFormErrors([]);
		try {
			if (!formData.title && !formData.url) {
				setFormErrors(['Must provide at least Title or Link / URL']);
				return;
			}
			const uploadData = new FormData();
			for (const [key, value] of Object.entries(formData)) {
				uploadData.append(key, value);
			}
			setSending(true);
			await axios.post('/api/forms/doc-data', uploadData, { timeout: 15000 });
			setFormData(defaultDocData);
			formRef.current?.reset();
			setSubmitSuccess(true);
			setSending(false);
		} catch (error) {
			setSubmitSuccess(false);
			setSending(false);
			if (error instanceof AxiosError) {
				setFormErrors([error?.response?.data || 'Unknown server error.']);
			} else {
				setFormErrors([(error as Error).message || 'Unknown server error.']);
			}
		}
	};

	return (
		<Form ref={formRef}>
			<h4>
				Use this form to provide data about a penalty You believe is missing
				from the list.
			</h4>
			<Form.Group className='p-3 my-3 rounded-2 bg-light'>
				<Form.Label htmlFor='series' className='fw-bolder'>
					Select series
				</Form.Label>
				<Form.Select
					className='mb-2'
					name='series'
					id='series'
					onChange={handleInputChange}
					value={formData.series}
					disabled={sending}
				>
					<option value=''>Choose Formula series</option>
					<option value='formula1'>Formula 1</option>
					<option value='formula2'>Formula 2</option>
					<option value='formula3'>Formula 3</option>
				</Form.Select>
				<Form.Label htmlFor='title' className='fw-bolder'>
					Title
				</Form.Label>
				<Form.Control
					className={`mb-2 ${
						formErrors.length && !formData.title && !formData.url
							? 'outline-error'
							: !formData.title && !formData.url
							? 'outline-warning'
							: 'outline-success'
					}`}
					type='text'
					name='title'
					id='title'
					minLength={16}
					maxLength={256}
					onChange={handleInputChange}
					value={formData.title}
					placeholder='Title'
					disabled={sending}
				/>
				<Form.Label htmlFor='url' className='fw-bolder'>
					Link / URL
				</Form.Label>
				<Form.Control
					className={`mb-2 ${
						formErrors.length && !formData.title && !formData.url
							? 'outline-error'
							: !formData.title && !formData.url
							? 'outline-warning'
							: 'outline-success'
					}`}
					type='text'
					name='url'
					id='url'
					minLength={32}
					maxLength={256}
					onChange={handleInputChange}
					value={formData.url}
					placeholder='Link / URL'
					disabled={sending}
				/>
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
			<div className='pt-3 w-100 border-top text-end'>
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

export default DataForm;
