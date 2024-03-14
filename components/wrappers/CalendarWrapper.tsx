import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { WeekendData } from '../../types/myTypes';

interface Props {
	calendarData: WeekendData[];
	nextRace: WeekendData | null | undefined;
}

const CalendarWrapper = ({ calendarData, nextRace }: Props) => {
	return (
		<Table size='sm' bordered hover responsive='md' className='m-0'>
			<thead className='align-top'>
				<tr>
					<th>
						<p>{calendarData.length} Races</p>
					</th>
					<th>
						<p>Race Name</p>
					</th>
					<th className='text-center'>
						<p>Date</p>
					</th>
					<th className='text-center'>
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
					<th className='text-center'>
						<p>Friday</p>
						<div>
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
					<th className='text-center'>
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
					<th className='text-center'>
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
					<th className='text-center'>
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
			<tbody className='align-top'>
				{calendarData.map((weekend) => {
					if (weekend.Sprint) {
						return (
							<tr
								key={weekend.Circuit.circuitId}
								className={`${
									weekend.round === nextRace?.round ? 'bg-warning' : 'bg-light'
								}`}
							>
								<td>
									<p>No. {weekend.round}</p>
								</td>
								<td>
									<OverlayTrigger
										placement='top'
										overlay={
											<Tooltip>Circuit: {weekend.Circuit.circuitName}</Tooltip>
										}
									>
										<a href={weekend.url}>{weekend.raceName} (Sprint)</a>
									</OverlayTrigger>
								</td>
								<td className='text-center fw-semibold'>
									<span>
										{weekend.FirstPractice.date.slice(-2) +
											'-' +
											new Date(
												weekend.date + ' ' + weekend.time
											).toLocaleString(undefined, {
												day: '2-digit',
												month: '2-digit',
												year: 'numeric',
											})}
									</span>
								</td>
								<td>
									<div className='text-primary text-center fw-semibold'>
										{new Date(
											weekend.FirstPractice.date +
												' ' +
												weekend.FirstPractice.time
										).toLocaleString(undefined, {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</div>
								</td>
								<td>
									<div className='text-danger text-center fw-semibold'>
										{new Date(
											weekend.Qualifying.date + ' ' + weekend.Qualifying.time
										).toLocaleString(undefined, {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</div>
								</td>
								<td>
									<div className='text-primary text-center fw-semibold'>
										{new Date(
											weekend.SecondPractice.date +
												' ' +
												weekend.SecondPractice.time
										).toLocaleString(undefined, {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</div>
								</td>
								<td>
									<div className='text-success text-center fw-semibold'>
										{new Date(
											weekend.Sprint.date + ' ' + weekend.Sprint.time
										).toLocaleString(undefined, {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</div>
								</td>
								<td>
									<div className='text-success text-center fw-semibold'>
										{new Date(weekend.date + ' ' + weekend.time).toLocaleString(
											undefined,
											{
												hour: '2-digit',
												minute: '2-digit',
											}
										)}
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
								<td>
									<p>No. {weekend.round}</p>
								</td>
								<td>
									<OverlayTrigger
										placement='top'
										overlay={
											<Tooltip>Circuit: {weekend.Circuit.circuitName}</Tooltip>
										}
									>
										<a href={weekend.url}>{weekend.raceName}</a>
									</OverlayTrigger>
								</td>
								<td className='text-center fw-semibold'>
									<span>
										{weekend.FirstPractice.date.slice(-2) +
											'-' +
											new Date(
												weekend.date + ' ' + weekend.time
											).toLocaleString(undefined, {
												day: '2-digit',
												month: '2-digit',
												year: 'numeric',
											})}
									</span>
								</td>
								<td>
									<div className='text-primary text-center fw-semibold'>
										{new Date(
											weekend.FirstPractice.date +
												' ' +
												weekend.FirstPractice.time
										).toLocaleString(undefined, {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</div>
								</td>
								<td>
									<div className='text-primary text-center fw-semibold'>
										{new Date(
											weekend.SecondPractice.date +
												' ' +
												weekend.SecondPractice.time
										).toLocaleString(undefined, {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</div>
								</td>
								<td>
									<div className='text-primary text-center fw-semibold'>
										{new Date(
											weekend.ThirdPractice.date +
												' ' +
												weekend.ThirdPractice.time
										).toLocaleString(undefined, {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</div>
								</td>
								<td>
									<div className='text-danger text-center fw-semibold'>
										{new Date(
											weekend.Qualifying.date + ' ' + weekend.Qualifying.time
										).toLocaleString(undefined, {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</div>
								</td>
								<td>
									<div className='text-success text-center fw-semibold'>
										{new Date(weekend.date + ' ' + weekend.time).toLocaleString(
											undefined,
											{
												hour: '2-digit',
												minute: '2-digit',
											}
										)}
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
