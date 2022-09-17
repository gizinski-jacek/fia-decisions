import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { ThemeContext } from '../hooks/ThemeProvider';
import { defaultTextData } from '../lib/myData';
import { FormTextData } from '../types/myTypes';

const Drawer = () => {
	const { toggleTheme } = useContext(ThemeContext);
	const [showFormModal, setShowFormModal] = useState(false);
	const [showFileForm, setShowFileForm] = useState(true);
	const [formSelectedSeries, setFormSelectedSeries] = useState('');
	const [formFileData, setFormFileData] = useState<File | null>(null);
	const [formTextData, setFormTextData] =
		useState<FormTextData>(defaultTextData);
	const [formErrors, setFormErrors] = useState<string[]>([]);
	const [showCalendarModal, setShowCalendarModal] = useState(false);
	const router = useRouter();

	const handleResetForms = () => {
		setFormSelectedSeries('');
		setFormTextData(defaultTextData);
		setFormFileData(null);
		setFormErrors([]);
	};

	const handleToggleTheme = () => {
		toggleTheme();
	};

	const handleOpenFormModal = () => {
		setShowFormModal(true);
	};

	const handleCloseFormModal = () => {
		handleResetForms();
		setShowFormModal(false);
	};

	const handleToggleForm = () => {
		setFormErrors([]);
		setFormFileData(null);
		setShowFileForm((prevState) => !prevState);
	};

	const handleSelectChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		setFormErrors([]);
		setFormSelectedSeries(e.target.value);
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
		setFormFileData(file);
	};

	const handleSubmitFile = async () => {
		try {
			if (!formSelectedSeries) {
				setFormErrors(['Must choose Formula series']);
				return;
			}
			if (!formFileData) {
				setFormErrors(['Must choose a PDF file']);
				return;
			}
			const formData = new FormData();
			formData.append('doc_file', formFileData);

			await axios.post(
				`/api/forms/doc-file?series=${formSelectedSeries}`,
				formData
			);
			return;
			handleResetForms();
		} catch (error) {
			console.log(error);
			// if (error instanceof AxiosError) {
			// 	setFormErrors([error?.response?.data || 'Unknown server error']);
			// } else {
			// 	setFormErrors([(error as Error).message || 'Unknown server error']);
			// }
		}
	};

	const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormErrors([]);
		const { name, value } = e.target;
		setFormTextData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleSubmitText = async () => {
		try {
			if (!formTextData.doc_title && !formTextData.doc_link) {
				setFormErrors(['Must provide at least title or link']);
				return;
			}
			const formData = new FormData();
			for (const [key, value] of Object.entries(formTextData)) {
				formData.append(key, value);
			}
			const res = await axios.post('/api/forms/doc-data', formData);
			handleResetForms();
		} catch (error) {
			if (error instanceof AxiosError) {
				setFormErrors([error?.response?.data || 'Unknown server error']);
			} else {
				setFormErrors([(error as Error).message || 'Unknown server error']);
			}
		}
	};

	const handleOpenCalendarModal = () => {
		setShowCalendarModal(true);
	};

	const handleCloseCalendarModal = () => {
		setShowCalendarModal(false);
	};

	return (
		<>
			<nav className='d-flex flex-column flex-sm-row bg-light'>
				<ul className='nav flex-grow-1 nav-tabs justify-content-between justify-content-sm-start nav-fill p-2 gap-5'>
					{/* <li className='nav-item'>
						<Link href='/'>
							<a
								className={`w-100 btn btn-sm btn-success ${
									router.pathname === '/' ? 'active' : ''
								}`}
							>
								Home
							</a>
						</Link>
					</li> */}
					<li className='nav-item'>
						<Link href={'/f1'}>
							<a
								className={`w-100 btn btn-sm btn-danger ${
									router.query.series === 'f1' ? 'active' : ''
								}`}
							>
								F1
							</a>
						</Link>
					</li>
					<li className='nav-item'>
						<Link href={'/f2'}>
							<a
								className={`w-100 btn btn-sm btn-primary ${
									router.query.series === 'f2' ? 'active' : ''
								}`}
							>
								F2
							</a>
						</Link>
					</li>
					<li className='nav-item '>
						<Link href={'/f3'}>
							<a
								className={`w-100 btn btn-sm btn-secondary ${
									router.query.series === 'f3' ? 'active' : ''
								}`}
							>
								F3
							</a>
						</Link>
					</li>
				</ul>
				<ul className='nav nav-tabs nav-fill justify-content-between p-2 gap-5'>
					<li className='nav-item'>
						<Link href={'/f2'}>
							<Button
								variant='warning'
								size='sm'
								className='w-100'
								onClick={handleOpenCalendarModal}
							>
								Calendar
							</Button>
						</Link>
					</li>
					{/* <li className='nav-item ms-auto'>
						<Button
							variant='dark'
							size='sm'
							className='w-100'
							onClick={handleToggleTheme}
						>
							Mode
						</Button>
					</li> */}
					<li className='nav-item'>
						<Button
							variant='info'
							size='sm'
							className='w-100'
							onClick={handleOpenFormModal}
						>
							Contact
						</Button>
					</li>
				</ul>
			</nav>
			<Modal
				show={showFormModal}
				onHide={handleCloseFormModal}
				dialogClassName='modal-lg'
			>
				<Modal.Header closeButton>
					<Modal.Title>Document Form</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>
						If You believe a penalty is missing you can let me know through this
						form.
					</p>
					<p>
						You can send a PDF file or provide some data that will help me find
						the penalty.
					</p>
					<p>
						Right now only documents containing words{' '}
						<b>&quot;Decision&quot;</b> and <b>&quot;Offence&quot;</b> in the
						title and fields such as{' '}
						<b>&quot;Session&quot;, &quot;Fact&quot;, &quot;Offence&quot;</b>{' '}
						and <b>&quot;Decision&quot;</b> are supported.
					</p>
					{showFileForm ? (
						<Form>
							<Form.Group className='p-2 rounded-2 bg-light'>
								<Form.Label htmlFor='doc_file_series'>Select series</Form.Label>
								<Form.Select
									className={`mb-2 ${
										formErrors.length > 0 && !formSelectedSeries
											? 'outline-error'
											: !formSelectedSeries
											? 'outline-warning'
											: 'outline-success'
									}`}
									name='doc_file_series'
									id='doc_file_series'
									defaultValue=''
									onChange={handleSelectChange}
									value={formSelectedSeries}
								>
									<option value=''>Choose Formula series</option>
									<option value='formula1'>Formula 1</option>
									<option value='formula2'>Formula 2</option>
									<option value='formula3'>Formula 3</option>
								</Form.Select>
								<Form.Label htmlFor='doc_file'>Select file</Form.Label>
								<Form.Control
									className={`mb-2 ${
										formErrors.length > 0 && !formFileData
											? 'outline-error'
											: !formFileData
											? 'outline-warning'
											: 'outline-success'
									}`}
									type='file'
									name='doc_file'
									id='doc_file'
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
						</Form>
					) : (
						<Form>
							<Form.Group className='p-2 rounded-2 bg-light'>
								<Form.Label htmlFor='doc_series'>Series</Form.Label>
								<Form.Control
									className='mb-2'
									type='text'
									name='doc_series'
									id='doc_series'
									maxLength={16}
									onChange={handleInputChange}
									value={formTextData.doc_series}
								/>
								<Form.Label htmlFor='doc_title'>Title</Form.Label>
								<Form.Control
									className={`mb-2 ${
										formErrors.length > 0 &&
										!formTextData.doc_title &&
										!formTextData.doc_link
											? 'outline-error'
											: !formTextData.doc_title && !formTextData.doc_link
											? 'outline-warning'
											: 'outline-success'
									}`}
									type='text'
									name='doc_title'
									id='doc_title'
									maxLength={128}
									onChange={handleInputChange}
									value={formTextData.doc_title}
								/>
								<Form.Label htmlFor='doc_link'>Link</Form.Label>
								<Form.Control
									className={`mb-2 ${
										formErrors.length > 0 &&
										!formTextData.doc_title &&
										!formTextData.doc_link
											? 'outline-error'
											: !formTextData.doc_title && !formTextData.doc_link
											? 'outline-warning'
											: 'outline-success'
									}`}
									type='text'
									name='doc_link'
									id='doc_link'
									maxLength={256}
									onChange={handleInputChange}
									value={formTextData.doc_link}
								/>
							</Form.Group>
							{formErrors.map((message, index) => (
								<div className='mx-1 text-danger' key={index}>
									{message}
								</div>
							))}
						</Form>
					)}
				</Modal.Body>
				<Modal.Footer className='d-flex flex-row'>
					<Button
						variant='warning'
						type='submit'
						className='me-auto'
						onClick={handleToggleForm}
					>
						Change Form
					</Button>
					<Button
						variant='primary'
						type='submit'
						onClick={() =>
							showFileForm ? handleSubmitFile() : handleSubmitText()
						}
					>
						Submit
					</Button>
				</Modal.Footer>
			</Modal>
			<Modal
				show={showCalendarModal}
				onHide={handleCloseCalendarModal}
				dialogClassName='modal-lg'
			>
				<Modal.Header closeButton>
					<Modal.Title>Race Calendar</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{/* <div className='text-break'>{modalDataRender(data)}</div> */}
				</Modal.Body>
				<Modal.Footer className='d-flex flex-row'>
					{/* <div className='me-auto'>Stewards: {data.stewards.join(', ')}</div> */}
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default Drawer;
