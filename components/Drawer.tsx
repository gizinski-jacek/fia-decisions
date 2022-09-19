import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Modal } from 'react-bootstrap';
import { ThemeContext } from '../hooks/ThemeProvider';
import FileForm from './forms/FileForm';
import DataForm from './forms/DataForm';
import ContactForm from './forms/ContactForm';

interface Props {
	drawerOnLeft: boolean;
	toggleDrawerPosition: () => void;
}

const Drawer = ({ drawerOnLeft, toggleDrawerPosition }: Props) => {
	const { toggleTheme } = useContext(ThemeContext);
	const [drawerSmall, setDrawerSmall] = useState(false);
	const [showFormModal, setShowFormModal] = useState(false);
	const [displayedForm, setDisplayedForm] = useState<
		'file' | 'data' | 'contact'
	>('file');
	const [showCalendarModal, setShowCalendarModal] = useState(false);
	const router = useRouter();

	const toggleDrawerSize = () => {
		setDrawerSmall((prevState) => !prevState);
	};

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
			<nav
				className={`d-flex flex-column bg-light overflow-hidden custom-width ${
					drawerOnLeft
						? drawerSmall
							? 'flex-md-column custom-width-sm'
							: 'flex-md-column custom-width-md'
						: 'flex-md-row'
				}`}
			>
				<ul
					className={`nav nav-tabs nav-fill justify-content-between justify-content-md-start p-2 gap-4 ${
						drawerOnLeft
							? 'flex-sm-column mb-2 pb-3'
							: 'flex-sm-row flex-sm-grow-1'
					}`}
				>
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
								{drawerOnLeft && drawerSmall ? 'F1' : 'Formula 1'}
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
								{drawerOnLeft && drawerSmall ? 'F2' : 'Formula 2'}
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
								{drawerOnLeft && drawerSmall ? 'F3' : 'Formula 3'}
							</a>
						</Link>
					</li>
				</ul>
				<ul
					className={`nav nav-fill justify-content-between p-2 gap-4 order-first order-md-last ${
						drawerOnLeft ? 'flex-sm-column order-sm-last' : 'flex-row nav-tabs'
					} ${drawerOnLeft && drawerSmall ? 'nav-pills' : ''}`}
				>
					{drawerOnLeft && (
						<li className='nav-item d-none d-sm-block'>
							<Button
								variant='dark'
								size='sm'
								className='w-100 fw-bolder'
								onClick={toggleDrawerSize}
							>
								{drawerOnLeft && drawerSmall ? 'S' : 'Size'}
							</Button>
						</li>
					)}
					<li className='nav-item d-none d-sm-block'>
						<Button
							variant='dark'
							size='sm'
							className='w-100 fw-bolder'
							onClick={toggleDrawerPosition}
						>
							{drawerOnLeft && drawerSmall ? 'P' : 'Position'}
						</Button>
					</li>
					<li className={`nav-item`}>
						<Button
							variant='warning'
							size='sm'
							className='w-100 fw-bolder'
							onClick={handleOpenCalendarModal}
						>
							{drawerOnLeft && drawerSmall ? 'Cal' : 'Calendar'}
						</Button>
					</li>
					<li className='nav-item'>
						<Button
							variant='dark'
							size='sm'
							className='w-100 fw-bolder'
							onClick={handleToggleTheme}
						>
							Mode
						</Button>
					</li>
					<li className='nav-item'>
						<Button
							variant='info'
							size='sm'
							className='w-100 fw-bolder'
							onClick={handleOpenFormModal}
						>
							{drawerOnLeft && drawerSmall ? 'Con' : 'Contact'}
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
