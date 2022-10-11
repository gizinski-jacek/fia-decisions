import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { WeekendData } from '../../types/myTypes';

interface Props {
	calendarData: WeekendData[];
	nextRace: WeekendData | null;
}

const CalendarWrapper = ({ calendarData, nextRace }: Props) => {
	return (
		<Table size='sm' bordered hover responsive='sm' className='m-0'>
			<thead>
				<tr>
					<th className='d-none d-lg-table-cell'>
						<p>Total: {calendarData.length}</p>
					</th>
					<th>
						<p>Race Info</p>
					</th>
					<th>
						<p>Date</p>
					</th>
					<th>
						<p>Friday</p>
						<OverlayTrigger
							placement='top'
							overlay={<Tooltip>Free Practice 1</Tooltip>}
						>
							<span className='text-primary text-decoration-underline'>
								FP1
							</span>
						</OverlayTrigger>
					</th>
					<th>
						<p>Friday</p>
						<div className='d-md-flex'>
							<OverlayTrigger
								placement='top'
								overlay={<Tooltip>Free Practice 2</Tooltip>}
							>
								<span className='text-primary text-decoration-underline'>
									FP2
								</span>
							</OverlayTrigger>
							<span className='mx-1'>/</span>
							<OverlayTrigger
								placement='top'
								overlay={<Tooltip>Qualifying</Tooltip>}
							>
								<span className='text-danger text-decoration-underline'>Q</span>
							</OverlayTrigger>
						</div>
					</th>
					<th>
						<p>Saturday</p>
						<OverlayTrigger
							placement='top'
							overlay={<Tooltip>Free Practice 3</Tooltip>}
						>
							<span className='text-primary text-decoration-underline'>
								FP3
							</span>
						</OverlayTrigger>
					</th>
					<th>
						<p>Saturday</p>
						<div>
							<OverlayTrigger
								placement='top'
								overlay={<Tooltip>Qualifying</Tooltip>}
							>
								<span className='text-danger text-decoration-underline'>Q</span>
							</OverlayTrigger>
							<span className='mx-1'>/</span>
							<OverlayTrigger
								placement='top'
								overlay={<Tooltip>Sprint Race</Tooltip>}
							>
								<span className='text-success text-decoration-underline'>
									Sprint
								</span>
							</OverlayTrigger>
						</div>
					</th>
					<th>
						<p>Sunday</p>
						<OverlayTrigger
							placement='top'
							overlay={<Tooltip>Main Race</Tooltip>}
						>
							<span className='text-success text-decoration-underline'>
								Race
							</span>
						</OverlayTrigger>
					</th>
				</tr>
			</thead>
			<tbody>
				{calendarData.map((weekend) => {
					if (weekend.Sprint) {
						return (
							<tr
								key={weekend.Circuit.circuitId}
								className={`${
									weekend.round === nextRace?.round ? 'bg-warning' : 'bg-light'
								}`}
							>
								<td className='d-none d-lg-table-cell'>
									<p>Race {weekend.round}</p>
								</td>
								<td>
									<OverlayTrigger
										placement='top'
										overlay={
											<Tooltip>Track: {weekend.Circuit.circuitName}</Tooltip>
										}
									>
										<a href={weekend.url}>{weekend.raceName}</a>
									</OverlayTrigger>
								</td>
								<td>
									<span className='fw-bold ms-auto'>
										{new Date(
											weekend.SecondPractice.date +
												' ' +
												weekend.SecondPractice.time
										).toLocaleString([], {
											year: '2-digit',
											month: '2-digit',
											day: '2-digit',
										})}
									</span>
								</td>
								<td>
									<div className='d-flex flex-column flex-md-row justify-content-between'>
										<span className='text-primary fw-bold me-1'>FP1: </span>
										<span className='fw-bold'>
											{new Date(
												weekend.FirstPractice.date +
													' ' +
													weekend.FirstPractice.time
											).toLocaleString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-flex flex-column flex-md-row justify-content-between'>
										<span className='text-danger fw-bold me-1'>Q: </span>
										<span className='fw-bold'>
											{new Date(
												weekend.Qualifying.date + ' ' + weekend.Qualifying.time
											).toLocaleString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-flex flex-column flex-md-row justify-content-between'>
										<span className='text-primary fw-bold me-1'>FP2: </span>
										<span className='fw-bold'>
											{new Date(
												weekend.SecondPractice.date +
													' ' +
													weekend.SecondPractice.time
											).toLocaleString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-flex flex-column flex-md-row justify-content-between'>
										<span className='text-success fw-bold me-1'>S: </span>
										<span className='fw-bold'>
											{new Date(
												weekend.Sprint.date + ' ' + weekend.Sprint.time
											).toLocaleString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-flex flex-column flex-md-row justify-content-between'>
										<span className='text-success fw-bold me-1'>R: </span>
										<span className='fw-bold'>
											{new Date(
												weekend.date + ' ' + weekend.time
											).toLocaleString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
							</tr>
						);
					} else if (weekend.ThirdPractice) {
						return (
							<tr
								key={weekend.Circuit.circuitId}
								className={`${
									weekend.round === nextRace?.round ? 'bg-warning' : 'bg-light'
								}`}
							>
								<td className='d-none d-lg-table-cell'>
									<p>Race {weekend.round}</p>
								</td>
								<td>
									<OverlayTrigger
										placement='top'
										overlay={
											<Tooltip>Track: {weekend.Circuit.circuitName}</Tooltip>
										}
									>
										<a href={weekend.url}>{weekend.raceName}</a>
									</OverlayTrigger>
								</td>
								<td>
									<span className='fw-bold'>
										{new Date(
											weekend.SecondPractice.date +
												' ' +
												weekend.SecondPractice.time
										).toLocaleString([], {
											year: '2-digit',
											month: '2-digit',
											day: '2-digit',
										})}
									</span>
								</td>
								<td>
									<div className='d-flex flex-column flex-md-row justify-content-between'>
										<span className='text-primary fw-bold me-1'>FP1: </span>
										<span className='fw-bold'>
											{new Date(
												weekend.FirstPractice.date +
													' ' +
													weekend.FirstPractice.time
											).toLocaleString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-flex flex-column flex-md-row justify-content-between'>
										<span className='text-primary fw-bold me-1'>FP2: </span>
										<span className='fw-bold'>
											{new Date(
												weekend.SecondPractice.date +
													' ' +
													weekend.SecondPractice.time
											).toLocaleString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-flex flex-column flex-md-row justify-content-between'>
										<span className='text-primary fw-bold me-1'>FP3: </span>
										<span className='fw-bold'>
											{new Date(
												weekend.ThirdPractice.date +
													' ' +
													weekend.ThirdPractice.time
											).toLocaleString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-flex flex-column flex-md-row justify-content-between'>
										<span className='text-danger fw-bold me-1'>Q: </span>
										<span className='fw-bold'>
											{new Date(
												weekend.Qualifying.date + ' ' + weekend.Qualifying.time
											).toLocaleString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-flex flex-column flex-md-row justify-content-between'>
										<span className='text-success fw-bold me-1'>R: </span>
										<span className='fw-bold'>
											{new Date(
												weekend.date + ' ' + weekend.time
											).toLocaleString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
							</tr>
						);
					}
				})}
			</tbody>
		</Table>
	);
};

export default CalendarWrapper;
