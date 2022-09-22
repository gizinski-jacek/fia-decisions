import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { WeekendData } from '../../types/myTypes';

interface Props {
	calendarData: WeekendData[];
	// timezone: 'my' | 'track';
	nextRace: WeekendData | null;
}

const CalendarWrapper = ({ calendarData, nextRace }: Props) => {
	return (
		<Table size='sm' striped bordered hover responsive='sm'>
			<thead>
				<tr>
					<th className='d-none d-lg-table-cell'>
						<p>Total: {calendarData.length}</p>
					</th>
					<th>
						<p>{`Race / Track Name & Wiki`}</p>
					</th>
					<th>
						<p>Date</p>
					</th>
					<th>
						<p>Friday</p>
						<OverlayTrigger
							placement='left'
							overlay={<Tooltip>Free Practice 1</Tooltip>}
						>
							<span className='text-info text-decoration-underline'>FP1</span>
						</OverlayTrigger>
					</th>
					<th>
						<p>Friday</p>
						<div className='d-md-flex'>
							<OverlayTrigger
								placement='left'
								overlay={<Tooltip>Free Practice 2</Tooltip>}
							>
								<span className='text-info text-decoration-underline'>FP2</span>
							</OverlayTrigger>
							<span className='mx-1'>/</span>
							<OverlayTrigger
								placement='left'
								overlay={<Tooltip>Qualifying</Tooltip>}
							>
								<span className='text-danger text-decoration-underline'>Q</span>
							</OverlayTrigger>
						</div>
					</th>
					<th>
						<p>Saturday</p>
						<OverlayTrigger
							placement='left'
							overlay={<Tooltip>Free Practice 3</Tooltip>}
						>
							<span className='text-info text-decoration-underline'>FP3</span>
						</OverlayTrigger>
					</th>
					<th>
						<p>Saturday</p>
						<div className='d-flex'>
							<OverlayTrigger
								placement='left'
								overlay={<Tooltip>Qualifying</Tooltip>}
							>
								<span className='text-danger text-decoration-underline'>Q</span>
							</OverlayTrigger>
							<span className='mx-1'>/</span>
							<OverlayTrigger
								placement='left'
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
							placement='left'
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
										placement='left'
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
										).toLocaleString(undefined, {
											year: '2-digit',
											month: '2-digit',
											day: '2-digit',
										})}
									</span>
								</td>
								<td>
									<div className='d-md-flex'>
										<span className='text-info fw-bold me-1'>FP1: </span>
										<span className='fw-bold ms-auto'>
											{new Date(
												weekend.FirstPractice.date +
													' ' +
													weekend.FirstPractice.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-md-flex'>
										<span className='text-danger fw-bold me-1'>Q: </span>
										<span className='fw-bold ms-auto'>
											{new Date(
												weekend.Qualifying.date + ' ' + weekend.Qualifying.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-md-flex'>
										<span className='text-info fw-bold me-1'>FP2: </span>
										<span className='fw-bold ms-auto'>
											{new Date(
												weekend.SecondPractice.date +
													' ' +
													weekend.SecondPractice.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-md-flex'>
										<span className='text-success fw-bold me-1'>S: </span>
										<span className='fw-bold ms-auto'>
											{new Date(
												weekend.Sprint.date + ' ' + weekend.Sprint.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-md-flex'>
										<span className='text-success fw-bold me-1'>R: </span>
										<span className='fw-bold ms-auto'>
											{new Date(
												weekend.date + ' ' + weekend.time
											).toLocaleString(undefined, {
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
										placement='left'
										overlay={
											<Tooltip>Track: {weekend.Circuit.circuitName}</Tooltip>
										}
									>
										<a href={weekend.url}>{weekend.raceName}</a>
									</OverlayTrigger>
								</td>
								<td>
									<span className='fw-bold text-wrap'>
										{new Date(
											weekend.SecondPractice.date +
												' ' +
												weekend.SecondPractice.time
										).toLocaleString(undefined, {
											year: '2-digit',
											month: '2-digit',
											day: '2-digit',
										})}
									</span>
								</td>
								<td>
									<div className='d-md-flex'>
										<span className='text-info fw-bold me-1'>FP1: </span>
										<span className='fw-bold ms-auto'>
											{new Date(
												weekend.FirstPractice.date +
													' ' +
													weekend.FirstPractice.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-md-flex'>
										<span className='text-info fw-bold me-1'>FP2: </span>
										<span className='fw-bold ms-auto'>
											{new Date(
												weekend.SecondPractice.date +
													' ' +
													weekend.SecondPractice.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-md-flex'>
										<span className='text-info fw-bold me-1'>FP3: </span>
										<span className='fw-bold ms-auto'>
											{new Date(
												weekend.ThirdPractice.date +
													' ' +
													weekend.ThirdPractice.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-md-flex'>
										<span className='text-danger fw-bold me-1'>Q: </span>
										<span className='fw-bold ms-auto'>
											{new Date(
												weekend.Qualifying.date + ' ' + weekend.Qualifying.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
								</td>
								<td>
									<div className='d-md-flex'>
										<span className='text-success fw-bold me-1'>R: </span>
										<span className='fw-bold ms-auto'>
											{new Date(
												weekend.date + ' ' + weekend.time
											).toLocaleString(undefined, {
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
