import { useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { FormFileData } from '../../types/myTypes';
import { defaultFileData } from '../../lib/myData';

const FileForm = () => {
	const [formData, setFormData] = useState<FormFileData>(defaultFileData);
	const [formErrors, setFormErrors] = useState<string[]>([]);
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
			setFormErrors(['File too large']);
			return;
		}
		if (file.type !== 'application/pdf') {
			setFormErrors(['Only images PDF files are allowed']);
			return;
		}
		setFormData((prevState) => ({ ...prevState, file: file }));
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		try {
			if (!formData.series && !formData.file) {
				setFormErrors(['Must choose series and PDF file']);
				return;
			}
			const uploadData = new FormData();
			uploadData.append('file', formData.file as File);
			await axios.post(
				`/api/forms/doc-file?series=${formData.series}`,
				uploadData
			);
			setFormData(defaultFileData);
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
				Use this form to send a PDF file of a penalty You believe is missing
				from the list.
			</h4>
			<h4>
				Only official documents from{' '}
				<Link href='https://www.fia.com/documents/championships'>FIA site</Link>{' '}
				containing words <b className='text-success'>Decision</b> and{' '}
				<b className='text-success'>Offence</b> in the{' '}
				<b className='text-success'>title</b> and{' '}
				<b className='text-danger'>fields</b> such as{' '}
				<b className='text-danger'>Session, Fact, Offence, Decision</b> are
				supported.
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
					onChange={handleSelectChange}
					value={formData.series}
				>
					<option value=''>Choose Formula series</option>
					<option value='formula1'>Formula 1</option>
					<option value='formula2'>Formula 2</option>
					<option value='formula3'>Formula 3</option>
				</Form.Select>
				<Form.Label htmlFor='file'>Select file</Form.Label>
				<Form.Control
					className={`mb-2 ${
						formErrors.length && !formData.file
							? 'outline-error'
							: !formData.file
							? 'outline-warning'
							: 'outline-success'
					}`}
					type='file'
					name='file'
					id='file'
					accept='.pdf'
					onChange={handleFileChange}
				/>
				<Form.Text className='text-muted'>
					Only PDF files, max size 1MB
				</Form.Text>
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

export default FileForm;
