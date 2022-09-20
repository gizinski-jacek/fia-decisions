import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Modal } from 'react-bootstrap';
import { ThemeContext } from '../hooks/ThemeProvider';
import FileForm from './forms/FileForm';
import DataForm from './forms/DataForm';
import ContactForm from './forms/ContactForm';
import style from '../styles/Slider.module.scss';

interface Props {
	drawerOnLeft: boolean;
	toggleDrawerPosition: () => void;
}

const Drawer = ({ drawerOnLeft, toggleDrawerPosition }: Props) => {
	const { theme, toggleTheme } = useContext(ThemeContext);
	const [selectedTheme, setSelectedTheme] = useState('light');
	const [screenIsSmall, setSmallScreen] = useState(false);
	const [drawerIsSmall, setDrawerSmall] = useState(false);
	const [drawerIsHidden, setDrawerHidden] = useState(false);
	const [showFormModal, setShowFormModal] = useState(false);
	const [displayedForm, setDisplayedForm] = useState<
		'file' | 'data' | 'contact'
	>('file');
	const [showCalendarModal, setShowCalendarModal] = useState(false);
	const router = useRouter();

	useEffect(() => {
		setSelectedTheme(theme);
	}, [theme]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const handleResize = () =>
				window.innerWidth < 576 ? setSmallScreen(true) : setSmallScreen(false);

			window.addEventListener('resize', handleResize);

			handleResize();

			return () => window.removeEventListener('resize', handleResize);
		}
	}, []);

	const toggleDrawerSize = () => {
		setDrawerSmall((prevState) => !prevState);
	};

	const toggleDrawerVisiblity = () => {
		setDrawerHidden((prevState) => !prevState);
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
				className={`d-flex bg-light border-bottom border-end 
				${drawerOnLeft ? 'flex-column' : 'flex-row'}
				${!drawerOnLeft && drawerIsHidden ? 'custom-nav-hide' : ''}`}
			>
				<ul
					className={`nav nav-tabs border-start flex-lg-row d-none d-sm-flex justify-content-between align-items-center p-2 p-md-2 gap-2 
					${
						drawerOnLeft && drawerIsSmall
							? 'flex-sm-column gap-2'
							: drawerOnLeft && !drawerIsSmall
							? 'flex-sm-row gap-2'
							: 'flex-sm-column order-sm-4'
					}`}
				>
					<li
						className={`nav-item d-none d-sm-block 
						${drawerOnLeft ? '' : 'order-last'}
						${drawerIsHidden ? 'custom-btn1-show' : ''}`}
					>
						<Button
							variant='dark'
							size='sm'
							className='w-100 fw-bolder'
							onClick={() =>
								drawerOnLeft ? toggleDrawerSize() : toggleDrawerVisiblity()
							}
						>
							{drawerOnLeft ? (
								drawerIsSmall ? (
									<i className='bi bi-arrow-bar-right fs-6'></i>
								) : (
									<i className='bi bi-arrow-bar-left fs-6'></i>
								)
							) : drawerIsHidden ? (
								<i className='bi bi-arrow-bar-down fs-6'></i>
							) : (
								<i className='bi bi-arrow-bar-up fs-6'></i>
							)}
						</Button>
					</li>
					<li className='nav-item d-none d-sm-block'>
						<Button
							variant='dark'
							size='sm'
							className='w-100 fw-bolder'
							onClick={toggleDrawerPosition}
						>
							{drawerOnLeft ? (
								<i className='bi bi-arrow-up-right-square fs-6'></i>
							) : (
								<i className='bi bi-arrow-down-left-square fs-6'></i>
							)}
						</Button>
					</li>
				</ul>
				<div
					className={`flex-grow-1 d-flex flex-column 
					${drawerOnLeft ? 'flex-lg-column' : 'flex-lg-row'}`}
				>
					<ul
						className={`nav nav-tabs nav-fill p-2 py-2 p-md-2 
					${drawerOnLeft ? 'flex-sm-column gap-2' : 'flex-sm-row flex-sm-grow-1 gap-3'}
					${screenIsSmall || drawerOnLeft ? '' : 'border-start'}`}
					>
						<li className='nav-item flex-grow-0'>
							<Link href='/'>
								<a
									className={`w-100 btn btn-sm btn-success fw-bolder d-flex align-items-center justify-content-center 
								${drawerOnLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'} 
								${router.query.series === '' ? 'active' : ''}`}
								>
									<i
										className={`bi bi-house-door fs-6 
									${!screenIsSmall && !drawerIsSmall ? 'me-2' : ''}`}
									></i>
									{!screenIsSmall && !drawerIsSmall && 'Home'}
								</a>
							</Link>
						</li>
						<li className='nav-item'>
							<Link href={'/f1'}>
								<a
									className={`w-100 btn btn-sm btn-danger fw-bolder d-flex align-items-center justify-content-center 
								${drawerOnLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'} 
								${router.query.series === 'f1' ? 'active' : ''}`}
								>
									<i
										className={`bi bi-1-square fs-6 
									${!drawerIsSmall ? 'me-2' : ''}`}
									></i>
									{!drawerIsSmall && 'Formula 1'}
								</a>
							</Link>
						</li>
						<li className='nav-item'>
							<Link href={'/f2'}>
								<a
									className={`w-100 btn btn-sm btn-primary fw-bolder d-flex align-items-center justify-content-center 
								${drawerOnLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'} 
								${router.query.series === 'f2' ? 'active' : ''}`}
								>
									<i
										className={`bi bi-2-square fs-6 
									${!drawerIsSmall ? 'me-2' : ''}`}
									></i>
									{!drawerIsSmall && 'Formula 2'}
								</a>
							</Link>
						</li>
						<li className='nav-item'>
							<Link href={'/f3'}>
								<a
									className={`w-100 btn btn-sm btn-secondary fw-bolder d-flex align-items-center justify-content-center 
								${drawerOnLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'} 
								${router.query.series === 'f3' ? 'active' : ''}`}
								>
									<i
										className={`bi bi-3-square fs-6 
									${!drawerIsSmall ? 'me-2' : ''}`}
									></i>
									{!drawerIsSmall && 'Formula 3'}
								</a>
							</Link>
						</li>
					</ul>
					<ul
						className={`nav nav-fill nav-tabs p-2 order-first order-lg-2  
					${drawerOnLeft ? 'flex-sm-column order-sm-2 gap-2' : 'flex-row gap-3'}
					${screenIsSmall || drawerOnLeft ? '' : 'border-start'}`}
					>
						<li className='nav-item'>
							<Button
								variant='warning'
								size='sm'
								className='w-100 fw-bolder'
								onClick={handleOpenCalendarModal}
							>
								<div
									className={`d-flex align-items-center justify-content-center 
								${drawerOnLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'}`}
								>
									<i
										className={`bi bi-calendar-week fs-6 
									${!drawerIsSmall ? 'me-2' : ''}`}
									></i>
									{!drawerIsSmall && 'Calendar'}
								</div>
							</Button>
						</li>
						<li className='nav-item'>
							<Button
								variant='dark'
								size='sm'
								className='w-100 fw-bolder'
								onClick={handleToggleTheme}
							>
								<div
									className={`d-flex align-items-center justify-content-center 
								${drawerOnLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'}
								${style.mode} ${style[selectedTheme]}`}
								>
									{drawerIsSmall ? (
										<span className={`${style.mode_icon}`}>
											<i className={`bi bi-sun ${style.sun} fs-6 `}></i>
											<i className={`bi bi-moon-fill ${style.moon} fs-6`}></i>
										</span>
									) : (
										<div className='d-flex align-items-center'>
											<div
												className={`${style.mode_slider} 
											${drawerIsSmall ? `${style.hide}` : 'me-2'}`}
											>
												<div className={style.mode_slider_circle}></div>
											</div>
											Mode
										</div>
									)}
								</div>
							</Button>
						</li>
						<li className='nav-item'>
							<Button
								variant='info'
								size='sm'
								className='w-100 fw-bolder'
								onClick={handleOpenFormModal}
							>
								<div
									className={`d-flex align-items-center justify-content-center 
								${drawerOnLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'}`}
								>
									<i
										className={`bi bi-envelope fs-6 
									${!drawerIsSmall ? 'me-2' : ''}`}
									></i>
									{!drawerIsSmall && 'Contact'}
								</div>
							</Button>
						</li>
						<li
							className={`nav-item d-sm-none flex-grow-0 
						${drawerIsHidden ? 'custom-btn2-show' : ''}`}
						>
							<Button
								variant='dark'
								size='sm'
								className='w-100 fw-bolder'
								onClick={() =>
									drawerOnLeft ? toggleDrawerSize() : toggleDrawerVisiblity()
								}
							>
								{drawerIsHidden ? (
									<i className='bi bi-arrow-bar-down fs-6'></i>
								) : (
									<i className='bi bi-arrow-bar-up fs-6'></i>
								)}
							</Button>
						</li>
					</ul>
				</div>
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
