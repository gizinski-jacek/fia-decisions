import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../hooks/ThemeProvider';
import { DrawerContext } from '../../hooks/DrawerProvider';
import { Button, Modal } from 'react-bootstrap';
import { WeekendData } from '../../types/myTypes';
import FileForm from '../forms/FileForm';
import DataForm from '../forms/DataForm';
import ContactForm from '../forms/ContactForm';
import style from '../../styles/Slider.module.scss';
import axios from 'axios';
import CalendarWrapper from '../wrappers/CalendarWrapper';

interface Props {
	screenIsSmall: boolean;
}

const DrawerUtilities = ({ screenIsSmall }: Props) => {
	const { toggleTheme } = useContext(ThemeContext);
	const { drawer } = useContext(DrawerContext);

	const [showFormModal, setShowFormModal] = useState(false);
	const [displayedForm, setDisplayedForm] = useState<
		'file' | 'data' | 'contact'
	>('file');
	const [showCalendarModal, setShowCalendarModal] = useState(false);
	// const [calendarTimezone, setCalendarTimezone] = useState<'my' | 'track'>(
	// 	'my'
	// );
	const [calendarData, setCalendarData] = useState<WeekendData[]>([]);
	const [nextRace, setNextRace] = useState<WeekendData | null>(null);

	const getCalendarData = async (): Promise<WeekendData[]> => {
		const res = await axios.get('https://ergast.com/api/f1/current.json');
		return res.data.MRData.RaceTable.Races;
	};

	useEffect(() => {
		(async () => {
			const data = await getCalendarData();
			const timeToday = new Date('2022/10/3 03:59:59');
			const oneDay = 24 * 60 * 60 * 1000;
			const futureRaces = data.filter(
				(r) =>
					new Date(r.date + ' ' + r.time).getTime() >
					timeToday.getTime() - oneDay
			);
			const dayAfterTheNextRace =
				new Date(futureRaces[0].date + ' ' + futureRaces[0].time).setHours(4) +
				oneDay;
			let upcomingRace: WeekendData;
			if (dayAfterTheNextRace > timeToday.getTime()) {
				upcomingRace = futureRaces[0];
			} else {
				upcomingRace = futureRaces[1];
			}
			setNextRace(upcomingRace);
			setCalendarData(data);
		})();
	}, []);

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
			<ul
				className={`nav nav-fill nav-tabs flex-nowrap p-2  
						${drawer.onLeft ? 'flex-sm-column gap-2' : 'flex-row gap-3'}
						${screenIsSmall || drawer.onLeft ? '' : 'custom-border'}`}
			>
				<li className='nav-item'>
					<Button
						variant='warning'
						size='sm'
						className='w-100 fw-bolder'
						onClick={handleOpenCalendarModal}
					>
						<div
							className={`d-flex align-items-center justify-content-center text-nowrap 
									${drawer.onLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'}`}
						>
							<i
								className={`bi bi-calendar-week fs-6 
										${
											screenIsSmall
												? 'me-2'
												: drawer.onLeft && drawer.isSmall
												? 'm-auto'
												: 'me-2'
										}`}
							></i>
							{screenIsSmall
								? 'Calendar'
								: drawer.onLeft && drawer.isSmall
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
									className={`d-flex align-items-center justify-content-center text-nowrap 
									${drawer.onLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'}
									${style.mode} ${style[selectedTheme]}`}
								>
									{screenIsSmall ? (
										<div className='d-flex align-items-center'>
											<div className={`me-2 ${style.mode_slider}`}>
												<div className={style.mode_slider_circle}></div>
											</div>
											Theme
										</div>
									) : drawer.onLeft && drawer.isSmall ? (
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
							className={`d-flex align-items-center justify-content-center text-nowrap 
									${drawer.onLeft ? 'justify-content-sm-start' : 'justify-content-sm-center'}`}
						>
							<i
								className={`bi bi-envelope fs-6 
										${
											screenIsSmall
												? 'me-2'
												: drawer.onLeft && drawer.isSmall
												? 'm-auto'
												: 'me-2'
										}`}
							></i>
							{screenIsSmall
								? 'Contact'
								: drawer.onLeft && drawer.isSmall
								? ''
								: 'Contact'}
						</div>
					</Button>
				</li>
			</ul>
			<Modal
				show={showFormModal}
				onHide={handleCloseFormModal}
				dialogClassName='modal-md'
			>
				<Modal.Header closeButton>
					<Modal.Title className='d-flex gap-5 me-2'>
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
							<h3 className='m-0 text-nowrap'>
								F1 {calendarData.find((w) => w.season !== undefined)?.season}{' '}
								Race Calendar
							</h3>
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
							nextRace={nextRace}
						/>
					}
				</Modal.Body>
			</Modal>
		</>
	);
};

export default DrawerUtilities;
