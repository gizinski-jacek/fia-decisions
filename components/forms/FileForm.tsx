import { useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { FormFileData } from '../../types/myTypes';
import { defaultFileData } from '../../lib/myData';
import LoadingBar from '../LoadingBar';

const FileForm = () => {
	const [formData, setFormData] = useState<FormFileData>(defaultFileData);
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
			setFormErrors(['File is too large.']);
			return;
		}
		if (file.type !== 'application/pdf') {
			setFormErrors(['Only images PDF files are allowed.']);
			return;
		}
		setFormData((prevState) => ({ ...prevState, file: file }));
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setFormErrors([]);
		try {
			if (!formData.series && !formData.file) {
				setFormErrors(['Must choose a Series and a PDF file.']);
				return;
			}
			if (!formData.series) {
				setFormErrors(['Must choose a Series.']);
				return;
			}
			if (!formData.file) {
				setFormErrors(['Must choose a PDF file.']);
				return;
			}
			const uploadData = new FormData();
			uploadData.append('file', formData.file as File);
			setSending(true);
			await axios.post(
				`/api/forms/doc-file?series=${formData.series}`,
				uploadData,
				{ timeout: 15000 }
			);
			setFormData(defaultFileData);
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
				Use this form to send a PDF file of a penalty You believe is missing
				from the list.
			</h4>
			<h4>
				Only official documents from{' '}
				<a
					href='https://www.fia.com/documents/championships'
					target='_blank'
					rel='noreferrer'
				>
					FIA site
				</a>{' '}
				containing words <b className='text-success'>Decision</b> and{' '}
				<b className='text-success'>Offence</b> in the{' '}
				<b className='text-success'>title</b> and{' '}
				<b className='text-danger'>fields</b> such as{' '}
				<b className='text-danger'>Session, Fact, Offence, Decision</b> are
				supported.
			</h4>
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
					>
						<option value=''>Choose Formula series</option>
						<option value='formula1'>Formula 1</option>
						<option value='formula2'>Formula 2</option>
						<option value='formula3'>Formula 3</option>
					</Form.Select>
				</Form.Group>
				<Form.Group>
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
						aria-describedby='fileSelectHelpText'
					/>
					<Form.Text muted id='fileSelectHelpText'>
						Only PDF files, max size 1MB
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

export default FileForm;
