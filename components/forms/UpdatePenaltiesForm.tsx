import { useState, useRef, useContext } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { UpdatePenaltiesFormValues } from '../../types/myTypes';
import {
	defaultUpdatePenaltiesFormValues,
	supportedSeries,
} from '../../lib/myData';
import LoadingBar from '../LoadingBar';
import { SeriesDataContext } from '../../hooks/SeriesDataContextProvider';
import { useRouter } from 'next/router';
import ErrorMsg from '../ErrorMsg';

const UpdatePenaltiesForm = () => {
	const { yearsBySeries } = useContext(SeriesDataContext);
	const [formData, setFormData] = useState<UpdatePenaltiesFormValues>(
		defaultUpdatePenaltiesFormValues
	);
	const [formErrors, setFormErrors] = useState<string[] | null>(null);
	const [fetching, setFetching] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const router = useRouter();

	const handleInputChange = async (e: React.ChangeEvent<HTMLElement>) => {
		handleDismissAlert();
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

	const handleUpdatePenaltiesNewest = async (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		try {
			e.preventDefault();
			handleDismissAlert();
			if (!formData.series) {
				setFormErrors(['Must select a Series.']);
				return;
			}
			setFetching(true);
			await axios.get(
				`/api/dashboard/update-penalties-newest/${formData.series}/${
					formData.year || ''
				}`,
				{ timeout: 25000 }
			);
			setFormData(defaultUpdatePenaltiesFormValues);
			formRef.current?.reset();
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
					router.push('/sign-in');
				} else {
					setFormErrors([
						(error as Error).message ||
							'Unknown server error. Updating documents failed.',
					]);
				}
			}
			setFetching(false);
		}
	};

	const handleUpdatePenaltiesAll = async (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		try {
			e.preventDefault();
			handleDismissAlert();
			if (!formData.series || !formData.year) {
				setFormErrors(['Must select a Series.']);
				return;
			}
			const confirm = window.confirm(
				'This update process will take a long time. Are You sure you want to update all documents from this year?'
			);
			if (!confirm) return;
			setFetching(true);
			await axios.get(
				`/api/dashboard/update-penalties-all/${formData.series}/${formData.year}`,
				{ timeout: 25000 }
			);
			setFormData(defaultUpdatePenaltiesFormValues);
			formRef.current?.reset();
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
					router.push('/sign-in');
				} else {
					setFormErrors([
						(error as Error).message ||
							'Unknown server error. Updating documents failed.',
					]);
				}
			}
			setFetching(false);
		}
	};

	const handleDismissAlert = () => {
		setFormErrors(null);
		setSubmitSuccess(null);
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
						<ErrorMsg errors={formErrors} dismiss={handleDismissAlert} />
					)}
					{submitSuccess && (
						<div className='d-flex m-0 alert alert-success alert-dismissible overflow-auto custom-alert-maxheight text-start'>
							<i className='bi bi-patch-check-fill fs-5 m-0 me-2'></i>
							<strong>{submitSuccess}</strong>
							<button
								type='button'
								className='btn btn-close'
								onClick={handleDismissAlert}
							></button>
						</div>
					)}
					{fetching && <LoadingBar margin='2rem 5rem' />}
				</div>
			</Form>
			<Button
				className='w-50'
				variant='warning'
				disabled={
					fetching || !formData.series || !formData.year || !!formErrors
				}
				onClick={handleUpdatePenaltiesNewest}
			>
				Update Newest
			</Button>
			<Button
				className='w-50'
				variant='danger'
				disabled={
					fetching || !formData.series || !formData.year || !!formErrors
				}
				onClick={handleUpdatePenaltiesAll}
			>
				Update All
			</Button>
		</div>
	);
};

export default UpdatePenaltiesForm;
