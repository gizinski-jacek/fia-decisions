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
	const [formErrors, setFormErrors] = useState<string[]>([]);
	const [sending, setSending] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	const handleSelectChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		setFormErrors([]);
		const { name, value } = e.target;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormErrors([]);
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
		e.preventDefault();
		setSubmitSuccess(false);
		setFormErrors([]);
		try {
			if (!formData.series && !formData.file) {
				setFormErrors(['Must choose a Series and a PDF file.']);
				return;
			}
			const uploadData = new FormData();
			uploadData.append('file', formData.file as File);
			setSending(true);
			await axios.post(`/api/forms/file/${formData.series}`, uploadData, {
				timeout: 15000,
			});
			setFormData(defaultFileFormValues);
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
					FIA site
				</a>{' '}
				marked as <b className='text-danger'>Decision</b> or{' '}
				<b className='text-danger'>Offence</b> are supported.
			</h5>
			<h5>
				<a className='fw-bold' href='/pdf_example.png' target='_blank'>
					Example of a valid file.
				</a>
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
						onChange={handleSelectChange}
						value={formData.series}
						disabled={sending}
						required
					>
						<option value=''>Choose Formula series</option>
						{supportedSeries.map((s, i) => (
							<option key={i} value={s}>
								{s.replace('f', 'Formula ')}
							</option>
						))}
					</Form.Select>
				</Form.Group>
				<Form.Group className='mb-3'>
					<Form.Label htmlFor='file' className='fw-bolder'>
						Select file
					</Form.Label>
					<Form.Control
						className={
							formErrors.length > 0 && !formData.file
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
						disabled={sending}
						required
						aria-describedby='fileSelectHelpText'
					/>
					<Form.Text muted id='fileSelectHelpText'>
						Only PDF files, max size 1MB
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
						<strong>File submitted successfully!</strong>
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

export default FileForm;
