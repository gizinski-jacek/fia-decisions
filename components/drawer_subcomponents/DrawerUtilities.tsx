import { useContext, useEffect, useState } from 'react';
import { DrawerContext } from '../../hooks/DrawerProvider';
import { Button, Modal } from 'react-bootstrap';
import { ErgastSeasonData, WeekendData } from '../../types/myTypes';
import FileForm from '../forms/FileForm';
import DataForm from '../forms/DataForm';
import ContactForm from '../forms/ContactForm';
import axios from 'axios';
import CalendarWrapper from '../wrappers/CalendarWrapper';
import LoadingBar from '../LoadingBar';

interface Props {
	screenIsSmall: boolean;
}

const DrawerUtilities = ({ screenIsSmall }: Props) => {
	const { drawer } = useContext(DrawerContext);

	const [showFormModal, setShowFormModal] = useState(false);
	const [displayedForm, setDisplayedForm] = useState<
		'file' | 'data' | 'contact'
	>('file');
	const [showCalendarModal, setShowCalendarModal] = useState(false);
	const [calendarData, setCalendarData] = useState<WeekendData[] | null>(null);
	const [nextRace, setNextRace] = useState<WeekendData | null>(null);
	const [calendarError, setCalendarError] = useState<string | null>(null);

	const getCalendarData = async () => {
		try {
			const currentSeason = new Date().getFullYear();
			let res: ErgastSeasonData = await axios.get(
				`https://ergast.com/api/f1/${currentSeason}.json`,
				{ timeout: 15000 }
			);
			if (!res.data.MRData.RaceTable.Races.length) {
				res = await axios.get('https://ergast.com/api/f1/current.json', {
					timeout: 15000,
				});
			}
			const timeToday = new Date();
			const oneDay = 24 * 60 * 60 * 1000;
			const futureRaces = res.data.MRData.RaceTable.Races.filter(
				(weekend) =>
					new Date(weekend.date + ' ' + weekend.time).getTime() >
					timeToday.getTime() - oneDay
			);
			let nextRace: WeekendData | null = null;
			if (futureRaces.length) {
				const dayAfterTheNextRace =
					new Date(futureRaces[0].date + ' ' + futureRaces[0].time).setHours(
						0
					) + oneDay;
				if (dayAfterTheNextRace > timeToday.getTime()) {
					nextRace = futureRaces[0];
				} else {
					nextRace = futureRaces[1];
				}
			}
			setCalendarData(res.data.MRData.RaceTable.Races);
			setNextRace(nextRace);
		} catch (error: any) {
			setCalendarData(null);
			setNextRace(null);
			setCalendarError('Error fetching calendar data.');
		}
	};

	useEffect(() => {
		(() => {
			getCalendarData();
		})();
	}, []);

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
						<div className='d-flex align-items-center justify-content-center text-nowrap'>
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
				<li className='nav-item'>
					<Button
						variant='info'
						size='sm'
						className='w-100 fw-bolder'
						onClick={handleOpenFormModal}
					>
						<div className='d-flex align-items-center justify-content-center text-nowrap'>
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
							className='fw-bolder'
							onClick={() => handleChangeForm('file')}
						>
							Send File
						</Button>
						<Button
							variant={`success ${displayedForm === 'data' ? 'active' : ''}`}
							className='fw-bolder'
							onClick={() => handleChangeForm('data')}
						>
							Send Info
						</Button>
						<Button
							variant={`success ${displayedForm === 'contact' ? 'active' : ''}`}
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
						<h3 className='fw-bold'>
							Formula 1{' '}
							{calendarData?.find((w) => w.season !== undefined)?.season} Race
							Calendar
						</h3>
						<h6>All times shown are in your local time zone.</h6>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className='bg-light rounded'>
					{calendarError ? (
						<div className='m-2 alert alert-danger text-capitalize'>
							<h3>{calendarError}</h3>
						</div>
					) : calendarData ? (
						<CalendarWrapper calendarData={calendarData} nextRace={nextRace} />
					) : (
						<LoadingBar margin='5rem' />
					)}
				</Modal.Body>
			</Modal>
		</>
	);
};

export default DrawerUtilities;
