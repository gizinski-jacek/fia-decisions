import { useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { FileFormValues } from '../../types/myTypes';
import { defaultFileFormValues, supportedSeries } from '../../lib/myData';
import LoadingBar from '../LoadingBar';

const FileForm = () => {
	const [formData, setFormData] = useState<FileFormValues>(
		defaultFileFormValues
	);
	const [formErrors, setFormErrors] = useState<string[] | null>(null);
	const [fetching, setFetching] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const handleSelectChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const target = e.target;
		const file = (target.files as FileList)[0];
		if (file.size > 1000000) {
			setFormErrors(['File is too big.']);
			return;
		}
		if (file.type !== 'application/pdf') {
			setFormErrors(['Only PDF files are allowed.']);
			return;
		}
		setFormData((prevState) => ({ ...prevState, file: file }));
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		try {
			e.preventDefault();
			setSubmitSuccess(null);
			setFormErrors(null);
			if (!formData.series && !formData.file) {
				setFormErrors(['Must select a Series and a PDF file.']);
				return;
			}
			const uploadData = new FormData();
			uploadData.append('file', formData.file as File);
			setFetching(true);
			await axios.post(`/api/forms/file/${formData.series}`, uploadData, {
				timeout: 15000,
			});
			setFormData(defaultFileFormValues);
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
			setSubmitSuccess(null);
			setFetching(false);
		}
	};

	return (
		<Form ref={formRef} className='d-flex flex-column gap-3'>
			<h5>
				Use this form to send a PDF file of a penalty You believe is missing
				from the list.
			</h5>
			<h5>
				Only official documents from{' '}
				<a
					className='fw-bold'
					href='https://www.fia.com/documents/championships'
					target='_blank'
					rel='noreferrer'
				>
					FIA website
				</a>{' '}
				marked as <b className='text-danger'>Offence</b>,{' '}
				<b className='text-danger'>Decision</b> or{' '}
				<b className='text-danger'>Infringement</b> are supported.
			</h5>
			<h5>
				<a className='fw-bold' href='/pdf_example.png' target='_blank'>
					Example of a valid file.
				</a>
			</h5>
			<div className='d-flex flex-column gap-3 p-3 rounded-2 bg-light'>
				<Form.Group>
					<Form.Label htmlFor='series' className='fw-bolder'>
						Series
					</Form.Label>
					<Form.Select
						className={
							formErrors && !formData.series
								? 'outline-error'
								: !formData.series
								? 'outline-warning'
								: 'outline-success'
						}
						name='series'
						id='series'
						onChange={handleSelectChange}
						value={formData.series}
						disabled={fetching || !!formErrors}
						required
					>
						<option value=''>Select Formula Series</option>
						{supportedSeries.map((series) => (
							<option key={series} value={series}>
								{series.replace('f', 'Formula ')}
							</option>
						))}
					</Form.Select>
				</Form.Group>
				<Form.Group>
					<Form.Label htmlFor='file' className='fw-bolder'>
						File
					</Form.Label>
					<Form.Control
						className={
							formErrors && !formData.file
								? 'outline-error'
								: !formData.file
								? 'outline-warning'
								: 'outline-success'
						}
						type='file'
						name='file'
						id='file'
						accept='.pdf'
						onChange={handleFileChange}
						disabled={fetching || !formData.series}
						required
						aria-describedby='fileSelectHelpText'
					/>
					<Form.Text muted id='fileSelectHelpText'>
						Only PDF files, max size 1MB.
					</Form.Text>
				</Form.Group>
				{formErrors && (
					<div className='m-0 alert alert-danger alert-dismissible overflow-auto custom-alert-maxheight text-start'>
						{formErrors.map((message, index) => (
							<div className='d-flex mb-2' key={index}>
								<i className='bi bi-exclamation-triangle-fill fs-5 m-0 me-2'></i>
								<strong className='ms-2 me-4'>{message}</strong>
							</div>
						))}
						<button
							type='button'
							className='btn btn-close'
							onClick={() => setFormErrors(null)}
						></button>
					</div>
				)}
				{submitSuccess && (
					<div className='d-flex m-0 mb-2 alert alert-success alert-dismissible overflow-auto custom-alert-maxheight text-start'>
						<i className='bi bi-patch-check-fill fs-5 m-0 me-2'></i>
						<strong>{submitSuccess}</strong>
						<button
							type='button'
							className='btn btn-close'
							onClick={() => setSubmitSuccess(null)}
						></button>
					</div>
				)}
				{fetching && <LoadingBar />}
			</div>
			<div className='w-100 text-end'>
				<Button
					variant='primary'
					type='submit'
					className='fw-bolder'
					disabled={
						fetching || !formData.series || !formData.file || !!formErrors
					}
					onClick={handleSubmit}
				>
					Submit
				</Button>
			</div>
		</Form>
	);
};

export default FileForm;
