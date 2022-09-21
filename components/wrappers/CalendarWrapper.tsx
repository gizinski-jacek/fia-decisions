import { Table } from 'react-bootstrap';
import { WeekendData } from '../../types/myTypes';

interface Props {
	calendarData: WeekendData[];
	// timezone: 'my' | 'track';
}

const RaceWeekendWrapper = ({ calendarData }: Props) => {
	return (
		<Table striped bordered hover responsive>
			<thead>
				<tr>
					<th>
						<p>Total: {calendarData.length}</p>
					</th>
					<th>
						<p>{`Race Name & Track Wiki`}</p>
					</th>
					<th>
						<p>Date</p>
					</th>
					<th>
						<p>Friday</p>
						<u className='text-info'>FP1</u>
					</th>
					<th>
						<p>Friday</p>
						<u className='text-info'>FP2</u> /{' '}
						<u className='text-danger'>Quali</u>
					</th>
					<th>
						<p>Saturday</p>
						<u className='text-info'>FP3</u>
					</th>
					<th>
						<p>Saturday</p>
						<u className='text-danger'>Q</u> /{' '}
						<u className='text-success'>Sprint</u>
					</th>
					<th>
						<p>Sunday</p>
						<u className='text-success'>Race</u>
					</th>
				</tr>
			</thead>
			<tbody>
				{calendarData.map((weekend) => {
					if (weekend.Sprint) {
						return (
							<tr key={weekend.Circuit.circuitId}>
								<td>
									<p>Race {weekend.round}</p>
								</td>
								<td>
									<a href={weekend.url}>{weekend.Circuit.circuitName}</a>
								</td>
								<td>
									<strong>
										{new Date(
											weekend.SecondPractice.date +
												' ' +
												weekend.SecondPractice.time
										).toLocaleString(undefined, {
											year: '2-digit',
											month: '2-digit',
											day: '2-digit',
										})}
									</strong>
								</td>
								<td>
									<div className='d-flex'>
										<span className='text-info text-decoration-underline fw-bold'>
											FP1:{' '}
										</span>
										<strong className='ms-auto'>
											{new Date(
												weekend.FirstPractice.date +
													' ' +
													weekend.FirstPractice.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</strong>
									</div>
								</td>
								<td>
									<div className='d-flex'>
										<span className='text-danger text-decoration-underline fw-bold'>
											Q:{' '}
										</span>
										<strong className='ms-auto'>
											{new Date(
												weekend.Qualifying.date + ' ' + weekend.Qualifying.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</strong>
									</div>
								</td>
								<td>
									<div className='d-flex'>
										<span className='text-info text-decoration-underline fw-bold'>
											FP2:{' '}
										</span>
										<strong className='ms-auto'>
											{new Date(
												weekend.SecondPractice.date +
													' ' +
													weekend.SecondPractice.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</strong>
									</div>
								</td>
								<td>
									<div className='d-flex'>
										<span className='text-success text-decoration-underline fw-bold'>
											S:{' '}
										</span>
										<strong className='ms-auto'>
											{new Date(
												weekend.Sprint.date + ' ' + weekend.Sprint.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</strong>
									</div>
								</td>
								<td>
									<div className='d-flex'>
										<span className='text-success text-decoration-underline fw-bold'>
											R:{' '}
										</span>
										<strong className='ms-auto'>
											{new Date(
												weekend.date + ' ' + weekend.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</strong>
									</div>
								</td>
							</tr>
						);
					} else if (weekend.ThirdPractice) {
						return (
							<tr key={weekend.Circuit.circuitId}>
								<td>
									<p>Race {weekend.round}</p>
								</td>
								<td>
									<a href={weekend.url}>{weekend.raceName}</a>
								</td>
								<td>
									<strong>
										{new Date(
											weekend.SecondPractice.date +
												' ' +
												weekend.SecondPractice.time
										).toLocaleString(undefined, {
											year: '2-digit',
											month: '2-digit',
											day: '2-digit',
										})}
									</strong>
								</td>
								<td>
									<div className='d-flex'>
										<span className='text-info text-decoration-underline fw-bold'>
											FP1:{' '}
										</span>
										<strong className='ms-auto'>
											{new Date(
												weekend.FirstPractice.date +
													' ' +
													weekend.FirstPractice.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</strong>
									</div>
								</td>
								<td>
									<div className='d-flex'>
										<span className='text-info text-decoration-underline fw-bold'>
											FP2:{' '}
										</span>
										<strong className='ms-auto'>
											{new Date(
												weekend.SecondPractice.date +
													' ' +
													weekend.SecondPractice.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</strong>
									</div>
								</td>
								<td>
									<div className='d-flex'>
										<span className='text-info text-decoration-underline fw-bold'>
											FP3:{' '}
										</span>
										<strong className='ms-auto'>
											{new Date(
												weekend.ThirdPractice.date +
													' ' +
													weekend.ThirdPractice.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</strong>
									</div>
								</td>
								<td>
									<div className='d-flex'>
										<span className='text-danger text-decoration-underline fw-bold'>
											Q:{' '}
										</span>
										<strong className='ms-auto'>
											{new Date(
												weekend.Qualifying.date + ' ' + weekend.Qualifying.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</strong>
									</div>
								</td>
								<td>
									<div className='d-flex'>
										<span className='text-success text-decoration-underline fw-bold'>
											R:{' '}
										</span>
										<strong className='ms-auto'>
											{new Date(
												weekend.date + ' ' + weekend.time
											).toLocaleString(undefined, {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</strong>
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

export default RaceWeekendWrapper;
