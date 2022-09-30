import { useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { DataFormValues } from '../../types/myTypes';
import { defaultDataFormValues, supportedSeries } from '../../lib/myData';
import LoadingBar from '../LoadingBar';

const DataForm = () => {
	const [formData, setFormData] = useState<DataFormValues>(
		defaultDataFormValues
	);
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
		setSubmitSuccess(false);
		setFormErrors([]);
		try {
			if (!formData.series || !formData.description) {
				setFormErrors(['Must choose a Series and provide a Description.']);
				return;
			}
			const uploadData = new FormData();

			for (const [key, value] of Object.entries(formData)) {
				uploadData.append(key, value);
			}
			setSending(true);
			await axios.post('/api/forms/info', uploadData, { timeout: 15000 });
			setFormData(defaultDataFormValues);
			formRef.current?.reset();
			setSubmitSuccess(true);
			setSending(false);
		} catch (error: any) {
			setSubmitSuccess(false);
			setSending(false);
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
		}
	};

	return (
		<Form ref={formRef}>
			<h5>
				Use this form to provide information about a penalty You believe is
				missing from the list.
			</h5>
			<div className='p-3 my-3 rounded-2 bg-light'>
				<Form.Group className='mb-3'>
					<Form.Label htmlFor='series' className='fw-bolder'>
						Select series
					</Form.Label>
					<Form.Select
						className={
							formErrors.length > 0 && !formData.series
								? 'outline-error'
								: !formData.series
								? 'outline-warning'
								: 'outline-success'
						}
						name='series'
						id='series'
						onChange={handleInputChange}
						value={formData.series}
						disabled={sending}
						required
					>
						<option value=''>Choose Formula series</option>
						{supportedSeries.map((s, i) => (
							<option key={i} value={s}>
								{s.replace('formula', 'Formula ')}
							</option>
						))}
					</Form.Select>
				</Form.Group>
				<Form.Group className='mb-3'>
					<Form.Label htmlFor='title' className='fw-bolder'>
						Penalty Description
					</Form.Label>
					<Form.Control
						as='textarea'
						className={
							formErrors.length > 0 && !formData.description
								? 'outline-error'
								: !formData.description ||
								  formData.description.length < 16 ||
								  formData.description.length > 512
								? 'outline-warning'
								: 'outline-success'
						}
						type='text'
						name='description'
						id='description'
						minLength={8}
						maxLength={512}
						rows={formData.description.length <= 256 ? 6 : 12}
						onChange={handleInputChange}
						value={formData.description}
						placeholder='Description, Title or Link'
						disabled={sending}
						required
						aria-describedby='informationInputHelpText'
					/>
					<Form.Text muted id='informationInputHelpText'>
						Description 16-512 characters long
					</Form.Text>
				</Form.Group>
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

export default DataForm;
