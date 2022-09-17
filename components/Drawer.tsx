import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Modal } from 'react-bootstrap';
import { ThemeContext } from '../hooks/ThemeProvider';
import FileForm from './forms/FileForm';
import DataForm from './forms/DataForm';
import ContactForm from './forms/ContactForm';

const Drawer = () => {
	const { toggleTheme } = useContext(ThemeContext);
	const [showFormModal, setShowFormModal] = useState(false);
	const [displayedForm, setDisplayedForm] = useState<
		'file' | 'data' | 'contact'
	>('file');
	const [showCalendarModal, setShowCalendarModal] = useState(false);
	const router = useRouter();

	const handleToggleTheme = () => {
		toggleTheme();
	};

	const handleOpenFormModal = () => {
		setShowFormModal(true);
	};

	const handleCloseFormModal = () => {
		setShowFormModal(false);
	};

	const handleChangeForm = (value: 'file' | 'data' | 'contact') => {
		setDisplayedForm(value);
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
								className={`w-100 btn btn-sm btn-success fw-bolder ${
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
								className={`w-100 btn btn-sm btn-danger fw-bolder ${
									router.query.series === 'f1' ? 'active' : ''
								}`}
							>
								Formula 1
							</a>
						</Link>
					</li>
					<li className='nav-item'>
						<Link href={'/f2'}>
							<a
								className={`w-100 btn btn-sm btn-primary fw-bolder ${
									router.query.series === 'f2' ? 'active' : ''
								}`}
							>
								Formula 2
							</a>
						</Link>
					</li>
					<li className='nav-item '>
						<Link href={'/f3'}>
							<a
								className={`w-100 btn btn-sm btn-secondary fw-bolder ${
									router.query.series === 'f3' ? 'active' : ''
								}`}
							>
								Formula 3
							</a>
						</Link>
					</li>
				</ul>
				<ul className='nav nav-tabs nav-fill justify-content-between p-2 gap-5'>
					{/* <li className='nav-item'>
						<Button
							variant='warning'
							size='sm'
							className='fw-bolder'
							onClick={handleOpenCalendarModal}
						>
							Calendar
						</Button>
					</li> */}
					{/* <li className='nav-item ms-auto'>
						<Button
							variant='dark'
							size='sm'
							className='fw-bolder'
							onClick={handleToggleTheme}
						>
							Mode
						</Button>
					</li> */}
					<li className='nav-item'>
						<Button
							variant='info'
							size='sm'
							className='fw-bolder text-white'
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
				dialogClassName='modal-md'
			>
				<Modal.Header closeButton>
					<Modal.Title className='d-flex gap-5'>
						<Button
							variant={`success ${displayedForm === 'file' ? 'active' : ''}`}
							type='submit'
							className='fw-bolder'
							onClick={() => handleChangeForm('file')}
						>
							Send File
						</Button>
						<Button
							variant={`success ${displayedForm === 'data' ? 'active' : ''}`}
							type='submit'
							className='fw-bolder'
							onClick={() => handleChangeForm('data')}
						>
							Send Data
						</Button>
						<Button
							variant={`success ${displayedForm === 'contact' ? 'active' : ''}`}
							type='submit'
							className='fw-bolder'
							onClick={() => handleChangeForm('contact')}
						>
							Contact
						</Button>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{displayedForm === 'file' ? (
						<FileForm />
					) : displayedForm === 'data' ? (
						<DataForm />
					) : displayedForm === 'contact' ? (
						<ContactForm />
					) : null}
				</Modal.Body>
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
