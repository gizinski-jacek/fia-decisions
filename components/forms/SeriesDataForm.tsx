import { useState, useRef, useContext } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { SeriesDataFormValues } from '../../types/myTypes';
import {
	defaultSeriesDataFormValues,
	fiaDomain,
	supportedSeries,
} from '../../lib/myData';
import LoadingBar from '../LoadingBar';
import { SeriesDataContext } from '../../hooks/SeriesDataContextProvider';
import { useRouter } from 'next/router';

const SeriesDataForm = () => {
	const { seriesData: supportedSeriesData, fetchSeriesData } =
		useContext(SeriesDataContext);
	const [formData, setFormData] = useState<SeriesDataFormValues>(
		defaultSeriesDataFormValues
	);
	const [formErrors, setFormErrors] = useState<string[] | null>(null);
	const [fetching, setFetching] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
	const [showForm, setShowForm] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	const router = useRouter();

	const handleInputChange = async (e: React.ChangeEvent<HTMLElement>) => {
		const { name, value } = e.target as HTMLSelectElement | HTMLInputElement;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		try {
			e.preventDefault();
			setSubmitSuccess(null);
			setFormErrors(null);
			if (!formData.series || !formData.year || !formData.documents_url) {
				setFormErrors([
					'Must select a Series, a Year and provide a Documents Page URL.',
				]);
				return;
			}
			if (!formData.documents_url.includes(fiaDomain)) {
				setFormErrors([
					'URL does not seem to point to https://www.fia.com domain.',
				]);
				return;
			}
			const uploadData = new FormData();
			for (const [key, value] of Object.entries(formData)) {
				uploadData.append(key, value);
			}
			setFetching(true);
			await axios.post('/api/forms/series-data', uploadData, {
				timeout: 15000,
			});
			setFormData(defaultSeriesDataFormValues);
			formRef.current?.reset();
			setSubmitSuccess('Data submitted successfully!');
			fetchSeriesData();
			setFetching(false);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					router.push('/sign-in');
				} else {
					Array.isArray(error?.response?.data)
						? setFormErrors(
								error?.response?.data || [
									'Unknown server error. Saving entry failed.',
								]
						  )
						: setFormErrors([
								error?.response?.data ||
									'Unknown server error. Saving entry failed.',
						  ]);
				}
			} else {
				if (error.status === 401) {
					router.push('/sign-in');
				} else {
					setFormErrors([
						(error as Error).message ||
							'Unknown server error. Saving entry failed.',
					]);
				}
			}
			setSubmitSuccess(null);
			setFetching(false);
		}
	};

	const handleDelete = async (
		e: React.MouseEvent<HTMLButtonElement>,
		series: string,
		id: string,
		year: string
	) => {
		try {
			e.preventDefault();
			setSubmitSuccess(null);
			setFormErrors(null);
			const confirm = window.confirm(
				'This action is irreversible. Are you sure You want to Delete this document?'
			);
			if (!confirm) return;
			if (!series || !id || !year) {
				setFormErrors(['Must provide a Series, a Year and an Id.']);
				return;
			}
			setFetching(true);
			await axios.delete(`/api/dashboard/series-data/${series}/${id}/${year}`, {
				timeout: 15000,
			});
			setSubmitSuccess('Data deleted successfully!');
			fetchSeriesData();
			setFetching(false);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					router.push('/sign-in');
				} else {
					Array.isArray(error?.response?.data)
						? setFormErrors(
								error?.response?.data || [
									'Unknown server error. Deleting entry failed.',
								]
						  )
						: setFormErrors([
								error?.response?.data ||
									'Unknown server error. Deleting entry failed.',
						  ]);
				}
			} else {
				if (error.status === 401) {
					router.push('/sign-in');
				} else {
					setFormErrors([
						(error as Error).message ||
							'Unknown server error. Deleting entry failed.',
					]);
				}
			}
			setSubmitSuccess(null);
			setFetching(false);
		}
	};

	const handleShowForm = () => {
		setShowForm(true);
	};

	const handleHideForm = () => {
		setFormData(defaultSeriesDataFormValues);
		setShowForm(false);
	};

	const handleAutomaticSeriesDataAcquire = async (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		try {
			e.preventDefault();
			setSubmitSuccess(null);
			setFormErrors(null);
			const confirm = window.confirm(
				'This action will try to automatically acquire Series Data from FIA website?'
			);
			if (!confirm) return;
			setFetching(true);
			await axios.get(`/api/dashboard/auto-update-series-data`, {
				timeout: 15000,
			});
			setSubmitSuccess('Request issued successfully!');
			setFetching(false);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					router.push('/sign-in');
				} else {
					Array.isArray(error?.response?.data)
						? setFormErrors(
								error?.response?.data || [
									'Unknown server error. Request failed.',
								]
						  )
						: setFormErrors([
								error?.response?.data ||
									'Unknown server error. Request failed.',
						  ]);
				}
			} else {
				if (error.status === 401) {
					router.push('/sign-in');
				} else {
					setFormErrors([
						(error as Error).message || 'Unknown server error. Request failed.',
					]);
				}
			}
			setSubmitSuccess(null);
			setFetching(false);
		}
	};

	return (
		<>
			<div className='d-flex flex-column gap-3 mb-3'>
				{showForm ? (
					<Form ref={formRef} className='d-flex flex-column gap-3'>
						<div className='d-flex flex-column p-3 gap-3 rounded-2 bg-light'>
							<div className='d-flex gap-3 gap-lg-5'>
								<Form.Group>
									<Form.Label htmlFor='series' className='fw-bolder'>
										Select Series
									</Form.Label>
									<Form.Select
										className={
											formErrors && !formData.series
												? 'outline-error'
												: !formData.series
												? 'outline-warning'
												: 'outline-success'
										}
										name='series'
										id='series'
										onChange={handleInputChange}
										value={formData.series}
										disabled={fetching || !!formErrors}
										required
									>
										<option value=''>Select Formula Series</option>
										{supportedSeries.map((series) => (
											<option key={series} value={series}>
												{series.replace('f', 'Formula ')}
											</option>
										))}
									</Form.Select>
								</Form.Group>
								<Form.Group>
									<Form.Label htmlFor='year' className='fw-bolder'>
										Select year
									</Form.Label>
									<Form.Select
										className={
											formErrors && !formData.year
												? 'outline-error'
												: !formData.year
												? 'outline-warning'
												: 'outline-success'
										}
										name='year'
										id='year'
										onChange={handleInputChange}
										value={formData.year}
										disabled={fetching || !formData.series}
										required
										aria-describedby='selectYearHelpText'
									>
										<option value=''>Select Year</option>
										{(() => {
											const startNum = new Date().getFullYear() + 1;
											const endNum =
												formData.series === 'f1'
													? 2019
													: formData.series === 'f2'
													? 2021
													: formData.series === 'f3'
													? 2021
													: null;
											if (!endNum) return;
											const range = Array.from(
												new Array(startNum - endNum),
												(x, i) => startNum - (i + 1)
											);
											return range.map((year) => (
												<option key={year} value={year}>
													{year}
												</option>
											));
										})()}
									</Form.Select>
									<Form.Text muted id='messageInputHelpText'>
										Select Series to see supported years.
									</Form.Text>
								</Form.Group>
							</div>
							<Form.Group>
								<Form.Label htmlFor='documents_url' className='fw-bolder'>
									FIA Documents Page URL
								</Form.Label>
								<Form.Control
									className={
										formErrors && !formData.documents_url
											? 'outline-error'
											: !formData.documents_url ||
											  formData.documents_url.length < 64 ||
											  formData.documents_url.length > 512
											? 'outline-warning'
											: 'outline-success'
									}
									type='url'
									as='textarea'
									name='documents_url'
									id='documents_url'
									minLength={64}
									maxLength={512}
									rows={4}
									onChange={handleInputChange}
									value={formData.documents_url}
									placeholder='Provide URL'
									disabled={fetching || !!formErrors}
									required
									aria-describedby='documentsURLInputHelpText'
								/>
								<Form.Text muted id='documentsURLInputHelpText'>
									FIA Documents Page URL, must point to official FIA domain,
									64-512 characters long.
								</Form.Text>
							</Form.Group>
						</div>
						<div className='d-flex align-items-center'>
							<Button
								variant='primary'
								type='button'
								className='fw-bolder text-nowrap'
								disabled={fetching}
								onClick={handleHideForm}
							>
								Hide Form
							</Button>
							{fetching && <LoadingBar width='100%' margin='0 2rem' />}

							<Button
								variant='primary'
								type='submit'
								className='fw-bolder ms-auto'
								disabled={
									fetching ||
									!formData.series ||
									!formData.year ||
									!formData.documents_url ||
									!!formErrors
								}
								onClick={handleSubmit}
							>
								Submit
							</Button>
						</div>
					</Form>
				) : (
					<div className='d-flex gap-3 justify-content-between'>
						<Button
							variant='primary'
							type='button'
							className='fw-bolder text-nowrap'
							disabled={fetching}
							onClick={handleShowForm}
						>
							Show Form
						</Button>
						<Button
							variant='warning'
							type='button'
							className='fw-bolder text-nowrap'
							disabled={fetching || !!formErrors}
							onClick={handleAutomaticSeriesDataAcquire}
						>
							Automatic Data Acquisition
						</Button>
					</div>
				)}
				{formErrors && (
					<div className='m-0 alert alert-danger alert-dismissible overflow-auto custom-alert-maxheight text-start'>
						{formErrors.map((message, index) => (
							<div className='d-flex mb-2' key={index}>
								<i className='bi bi-exclamation-triangle-fill fs-5 m-0 me-2'></i>
								<strong className='ms-2 me-4'>{message}</strong>
							</div>
						))}
						<button
							type='button'
							className='btn btn-close'
							onClick={() => setFormErrors(null)}
						></button>
					</div>
				)}
				{submitSuccess && (
					<div className='d-flex m-0 mb-2 alert alert-success alert-dismissible overflow-auto custom-alert-maxheight text-start'>
						<i className='bi bi-patch-check-fill fs-5 m-0 me-2'></i>
						<strong>{submitSuccess}</strong>
						<button
							type='button'
							className='btn btn-close'
							onClick={() => setSubmitSuccess(null)}
						></button>
					</div>
				)}
			</div>
			<Table size='md' bordered hover responsive='md' className='m-0'>
				<thead className='align-top'>
					<tr>
						<th className='text-center'>
							<p>Series</p>
						</th>
						<th className='text-center'>
							<p>Year</p>
						</th>
						<th className='text-center'>
							<p>Page URL</p>
						</th>
						<th className='text-center'>
							<p>#</p>
						</th>
					</tr>
				</thead>
				<tbody className='align-top'>
					{supportedSeriesData?.map((data, i) => {
						return (
							<tr key={i}>
								<td className='text-center text-nowrap'>
									{data.series.toUpperCase()}
								</td>
								<td className='text-center text-nowrap '>{data.year}</td>
								<td className='text-center text-wrap'>
									<a href={data.documents_url} target='_blank' rel='noreferrer'>
										{data.documents_url}
									</a>
								</td>
								<td className='text-center text-wrap'>
									<Button
										variant='danger'
										size='sm'
										className='px-1 py-0'
										disabled={fetching || !!formErrors}
										onClick={(e) =>
											handleDelete(e, data.series, data._id, data.year)
										}
									>
										<i className='bi bi-x fs-5'></i>
									</Button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>
		</>
	);
};

export default SeriesDataForm;
