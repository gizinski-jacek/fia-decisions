import { useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { FormDocData } from '../../types/myTypes';
import { defaultDocData } from '../../lib/myData';

const DataForm = () => {
	const [formData, setFormData] = useState<FormDocData>(defaultDocData);
	const [formErrors, setFormErrors] = useState<string[]>([]);
	const formRef = useRef<HTMLFormElement>(null);

	const handleInputChange = async (e: React.ChangeEvent<HTMLElement>) => {
		setFormErrors([]);
		const { name, value } = e.target as HTMLSelectElement | HTMLInputElement;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		try {
			if (!formData.title && !formData.url) {
				setFormErrors(['Must provide at least Title or Link / URL']);
				return;
			}
			const uploadData = new FormData();
			for (const [key, value] of Object.entries(formData)) {
				uploadData.append(key, value);
			}
			await axios.post('/api/forms/doc-data', uploadData);
			setFormData(defaultDocData);
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
				Use this form to provide data about a penalty You believe is missing
				from the list.
			</h4>
			<Form.Group className='p-3 my-3 rounded-2 bg-light'>
				<Form.Label htmlFor='series'>Select series</Form.Label>
				<Form.Select
					className={`mb-2 ${
						formErrors.length && !formData.series
							? 'outline-error'
							: !formData.series
							? 'outline-warning'
							: 'outline-success'
					}`}
					name='series'
					id='series'
					onChange={handleInputChange}
					value={formData.series}
				>
					<option value=''>Choose Formula series</option>
					<option value='formula1'>Formula 1</option>
					<option value='formula2'>Formula 2</option>
					<option value='formula3'>Formula 3</option>
				</Form.Select>
				<Form.Label htmlFor='title'>Title</Form.Label>
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
					maxLength={128}
					onChange={handleInputChange}
					value={formData.title}
					placeholder='Title'
				/>
				<Form.Label htmlFor='url'>Link / URL</Form.Label>
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
					maxLength={256}
					onChange={handleInputChange}
					value={formData.url}
					placeholder='Link / URL'
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

export default DataForm;
