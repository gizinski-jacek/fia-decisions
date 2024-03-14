import { useState, useRef, useContext } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { UpdateDocsFormValues } from '../../types/myTypes';
import { defaultUpdateDocsFormValues, supportedSeries } from '../../lib/myData';
import LoadingBar from '../LoadingBar';
import { SupportedSeriesDataContext } from '../../hooks/SupportedYearsProvider';

interface Props {
	reloadRoute: () => void;
}

const UpdateDocsForm = ({ reloadRoute }: Props) => {
	const { yearsBySeries } = useContext(SupportedSeriesDataContext);
	const [formData, setFormData] = useState<UpdateDocsFormValues>(
		defaultUpdateDocsFormValues
	);
	const [formErrors, setFormErrors] = useState<string[] | null>(null);
	const [fetching, setFetching] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	const handleInputChange = async (e: React.ChangeEvent<HTMLElement>) => {
		const { name, value } = e.target as HTMLSelectElement | HTMLInputElement;
		if (name === 'series') {
			setFormData((prevState) => ({
				...prevState,
				[name]: value,
				year: '',
			}));
		} else {
			setFormData((prevState) => ({ ...prevState, [name]: value }));
		}
	};

	const handleUpdateDocsNewest = async () => {
		try {
			setFormErrors(null);
			setSubmitSuccess(false);
			if (!formData.series) {
				setFormErrors(['Must select a Series.']);
				return;
			}
			setFetching(true);
			await axios.get(
				`/api/dashboard/update-newest/${formData.series}/${
					formData.year || ''
				}`,
				{ timeout: 25000 }
			);
			setSubmitSuccess(true);
			setFetching(false);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					reloadRoute();
				} else {
					Array.isArray(error?.response?.data)
						? setFormErrors(
								error?.response?.data || [
									'Unknown server error. Updating documents failed.',
								]
						  )
						: setFormErrors([
								error?.response?.data ||
									'Unknown server error. Updating documents failed.',
						  ]);
				}
			} else {
				if (error.status === 401) {
					reloadRoute();
				} else {
					setFormErrors([
						(error as Error).message ||
							'Unknown server error. Updating documents failed.',
					]);
				}
			}
			setSubmitSuccess(false);
			setFetching(false);
		}
	};

	const handleUpdateDocsAll = async () => {
		try {
			setFormErrors(null);
			setSubmitSuccess(false);
			if (!formData.series || !formData.year) {
				setFormErrors(['Must select a Series.']);
				return;
			}
			setFetching(true);
			const confirm = window.confirm(
				'This update process will take a long time. Are You sure you want to update all documents from this year?'
			);
			if (confirm) {
				await axios.get(
					`/api/dashboard/update-all/${formData.series}/${formData.year}`,
					{ timeout: 25000 }
				);
			}
			setSubmitSuccess(true);
			setFetching(false);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					reloadRoute();
				} else {
					Array.isArray(error?.response?.data)
						? setFormErrors(
								error?.response?.data || [
									'Unknown server error. Updating documents failed.',
								]
						  )
						: setFormErrors([
								error?.response?.data ||
									'Unknown server error. Updating documents failed.',
						  ]);
				}
			} else {
				if (error.status === 401) {
					reloadRoute();
				} else {
					setFormErrors([
						(error as Error).message ||
							'Unknown server error. Updating documents failed.',
					]);
				}
			}
			setSubmitSuccess(false);
			setFetching(false);
		}
	};

	return (
		<div className='d-flex flex-column gap-3 align-items-center mb-3'>
			<Form ref={formRef} className='d-flex flex-column gap-3 mb-3'>
				<h5>
					Use this form to force update penalties for selected Series and Year.
				</h5>
				<div className='d-flex flex-column gap-4 justify-content-between'>
					<div className='d-flex gap-3 p-3 justify-content-evenly bg-light'>
						<Form.Group>
							<Form.Label htmlFor='series' className='fw-bolder'>
								Series
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
								value={formData.series || ''}
								disabled={fetching}
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
								Year
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
								value={formData.year || ''}
								disabled={fetching || !formData.series}
							>
								<option value=''>Select Year</option>
								{(() => {
									if (!yearsBySeries || !formData.series) return;
									return yearsBySeries[formData.series]?.map((year) => (
										<option key={year} value={year}>
											{year}
										</option>
									));
								})()}
							</Form.Select>
						</Form.Group>
					</div>
					{formErrors && (
						<div className='m-0 alert alert-danger alert-dismissible overflow-auto custom-alert-maxheight text-start'>
							{formErrors.map((message, index) => (
								<div className='d-flex mb-2' key={index}>
									<i className='bi bi-exclamation-triangle-fill fs-5 m-0 me-2'></i>
									<strong>{message}</strong>
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
						<div className='d-flex m-0 alert alert-success alert-dismissible overflow-auto custom-alert-maxheight text-start'>
							<i className='bi bi-patch-check-fill fs-5 m-0 me-2'></i>
							<strong>Update request issued successfully!</strong>
							<button
								type='button'
								className='btn btn-close'
								onClick={() => setSubmitSuccess(false)}
							></button>
						</div>
					)}
					{fetching && <LoadingBar margin='2rem 5rem' />}
				</div>
			</Form>
			<Button
				className='w-50'
				variant='warning'
				disabled={fetching || !formData.series || !!formErrors}
				onClick={handleUpdateDocsNewest}
			>
				Update Newest
			</Button>
			<Button
				className='w-50'
				variant='danger'
				disabled={
					fetching || !formData.series || !formData.year || !!formErrors
				}
				onClick={handleUpdateDocsAll}
			>
				Update All
			</Button>
		</div>
	);
};

export default UpdateDocsForm;
