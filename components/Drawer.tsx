import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Modal } from 'react-bootstrap';
import { ThemeContext } from '../hooks/ThemeProvider';
import FileForm from './forms/FileForm';
import DataForm from './forms/DataForm';
import ContactForm from './forms/ContactForm';
import style from '../styles/Slider.module.scss';
import axios from 'axios';
import { WeekendData } from '../types/myTypes';
import CalendarWrapper from './wrappers/CalendarWrapper';

interface Props {
	drawerOnLeft: boolean;
	toggleDrawerPosition: () => void;
}

const Drawer = ({ drawerOnLeft, toggleDrawerPosition }: Props) => {
	const { theme, toggleTheme } = useContext(ThemeContext);
	// Save theme, position and size in local storage
	const [selectedTheme, setSelectedTheme] = useState('light');
	const [screenIsSmall, setSmallScreen] = useState(false);
	const [drawerIsSmall, setDrawerSmall] = useState(false);
	const [drawerIsHidden, setDrawerHidden] = useState(false);
	const [showFormModal, setShowFormModal] = useState(false);
	const [displayedForm, setDisplayedForm] = useState<
		'file' | 'data' | 'contact'
	>('file');
	const [showCalendarModal, setShowCalendarModal] = useState(false);
	// const [calendarTimezone, setCalendarTimezone] = useState<'my' | 'track'>(
	// 	'my'
	// );
	const [calendarData, setCalendarData] = useState<WeekendData[]>([]);
	const router = useRouter();

	const getCalendarData = async (): Promise<WeekendData[]> => {
		const res = await axios.get('http://ergast.com/api/f1/current.json');
		return res.data.MRData.RaceTable.Races;
	};

	useEffect(() => {
		(async () => {
			setCalendarData(await getCalendarData());
		})();
	}, []);

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

	// const toggleCalendarTimezone = (value: 'my' | 'track') => {
	// 	setCalendarTimezone(value);
	// };

	return (
		<>
			<nav
				className={`d-flex bg-light border-bottom border-end 
				${drawerOnLeft ? 'flex-column' : 'flex-row'}
				${drawerIsHidden ? 'custom-nav-hide' : ''}`}
			>
				<ul
					className={`nav nav-tabs d-none d-sm-flex justify-content-between align-items-center p-2 p-md-2 gap-2 
					${
						drawerOnLeft && drawerIsSmall
							? 'flex-column'
							: drawerOnLeft && !drawerIsSmall
							? 'flex-row'
							: 'flex-column flex-lg-row border-start order-sm-4'
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
						${drawerOnLeft ? 'flex-sm-column gap-2' : 'flex-sm-row flex-sm-grow-1 gap-3 '}`}
					>
						{/* <li className='nav-item'>
							<Link href='/'>
								<a
									className={`w-100 btn btn-sm btn-success fw-bolder d-flex align-items-center justify-content-center 
									${drawerOnLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'} 
									${router.query.series === '' ? 'active' : ''}`}
								>
									<i
										className={`bi bi-house-door fs-6 
										${screenIsSmall ? 'me-2' : drawerOnLeft && drawerIsSmall ? 'm-auto' : 'me-2'}`}
									></i>
									{screenIsSmall
										? 'Home'
										: drawerOnLeft && drawerIsSmall
										? ''
										: 'Home'}
								</a>
							</Link>
						</li> */}
						<li className='nav-item'>
							<Link href={'/f1'}>
								<a
									className={`w-100 btn btn-sm btn-danger fw-bolder d-flex align-items-center justify-content-center 
									${drawerOnLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'} 
									${router.query.series === 'f1' ? 'active' : ''}`}
								>
									<i
										className={`bi bi-1-square fs-6 
										${screenIsSmall ? 'me-2' : drawerOnLeft && drawerIsSmall ? 'm-auto' : 'me-2'}`}
									></i>
									{screenIsSmall
										? 'Formula 1'
										: drawerOnLeft && drawerIsSmall
										? ''
										: 'Formula 1'}
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
										${screenIsSmall ? 'me-2' : drawerOnLeft && drawerIsSmall ? 'm-auto' : 'me-2'}`}
									></i>
									{screenIsSmall
										? 'Formula 2'
										: drawerOnLeft && drawerIsSmall
										? ''
										: 'Formula 2'}
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
										${screenIsSmall ? 'me-2' : drawerOnLeft && drawerIsSmall ? 'm-auto' : 'me-2'}`}
									></i>
									{screenIsSmall
										? 'Formula 3'
										: drawerOnLeft && drawerIsSmall
										? ''
										: 'Formula 3'}
								</a>
							</Link>
						</li>
					</ul>
					<ul
						className={`nav nav-fill nav-tabs p-2 order-first order-lg-2  
						${drawerOnLeft ? 'flex-sm-column order-sm-2 gap-2' : 'flex-row gap-3'}
						${screenIsSmall || drawerOnLeft ? '' : 'custom-border'}`}
					>
						<li className='nav-item'>
							<Button
								variant='warning'
								size='sm'
								className='w-100 fw-bolder'
								onClick={handleOpenCalendarModal}
							>
								<div
									className={`d-flex align-items-center justify-content-start 
									${drawerOnLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'}`}
								>
									<i
										className={`bi bi-calendar-week fs-6 
										${screenIsSmall ? 'me-2' : drawerOnLeft && drawerIsSmall ? 'm-auto' : 'me-2'}`}
									></i>
									{screenIsSmall
										? 'Calendar'
										: drawerOnLeft && drawerIsSmall
										? ''
										: 'Calendar'}
								</div>
							</Button>
						</li>
						{/* <li className='nav-item'>
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
									{screenIsSmall ? (
										<div className='d-flex align-items-center'>
											<div className={`me-2 ${style.mode_slider}`}>
												<div className={style.mode_slider_circle}></div>
											</div>
											Theme
										</div>
									) : drawerOnLeft && drawerIsSmall ? (
										<span className={`${style.mode_icon} m-auto`}>
											<i className={`bi bi-sun ${style.sun} fs-6`}></i>
											<i className={`bi bi-moon-fill ${style.moon} fs-6`}></i>
										</span>
									) : (
										<div className='d-flex align-items-center'>
											<div className={`me-2 ${style.mode_slider}`}>
												<div className={style.mode_slider_circle}></div>
											</div>
											Theme
										</div>
									)}
								</div>
							</Button>
						</li> */}
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
										${screenIsSmall ? 'me-2' : drawerOnLeft && drawerIsSmall ? 'm-auto' : 'me-2'}`}
									></i>
									{screenIsSmall
										? 'Contact'
										: drawerOnLeft && drawerIsSmall
										? ''
										: 'Contact'}
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
								onClick={toggleDrawerVisiblity}
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
				dialogClassName='modal-lg custom-modal-width'
			>
				<Modal.Header closeButton>
					<Modal.Title className='w-100 me-5'>
						<div className='d-flex align-items-center'>
							<h2 className='m-0'>
								{calendarData.find((w) => w.season !== undefined)?.season} Race
								Calendar
							</h2>
							{/* <div className='d-flex ms-5'>
								<Button
									size='sm'
									className={`mx-2 fw-bold ${
										calendarTimezone === 'my'
											? 'btn-success'
											: 'btn-secondary opacity-75'
									}`}
									onClick={() => toggleCalendarTimezone('my')}
								>
									My Time
								</Button>
								<Button
									size='sm'
									className={`mx-2 fw-bold ${
										calendarTimezone === 'track'
											? 'btn-success'
											: 'btn-secondary opacity-75'
									}`}
									onClick={() => toggleCalendarTimezone('track')}
								>
									Track Time
								</Button>
							</div> */}
						</div>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className='bg-light'>
					{
						<CalendarWrapper
							calendarData={calendarData}
							// timezone={calendarTimezone}
						/>
					}
				</Modal.Body>
			</Modal>
		</>
	);
};

export default Drawer;
