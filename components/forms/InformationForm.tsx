import { useState, useRef, useContext } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { InformationFormValues } from '../../types/myTypes';
import {
	defaultInformationFormValues,
	supportedSeries,
} from '../../lib/myData';
import LoadingBar from '../LoadingBar';
import { SeriesDataContext } from '../../hooks/SeriesDataContextProvider';
import ErrorMsg from '../ErrorMsg';

const InformationForm = () => {
	const { yearsBySeries } = useContext(SeriesDataContext);
	const [formData, setFormData] = useState<InformationFormValues>(
		defaultInformationFormValues
	);
	const [formErrors, setFormErrors] = useState<string[] | null>(null);
	const [fetching, setFetching] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const handleInputChange = async (e: React.ChangeEvent<HTMLElement>) => {
		handleDismissAlert();
		const { name, value } = e.target as HTMLSelectElement | HTMLInputElement;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		try {
			e.preventDefault();
			handleDismissAlert();
			if (!formData.series || !formData.year || !formData.description) {
				setFormErrors([
					'Must select a Series, a Year and provide a Description.',
				]);
				return;
			}
			const uploadData = new FormData();
			for (const [key, value] of Object.entries(formData)) {
				uploadData.append(key, value);
			}
			setFetching(true);
			await axios.post('/api/forms/info', uploadData, { timeout: 15000 });
			setFormData(defaultInformationFormValues);
			formRef.current?.reset();
			setSubmitSuccess('Form submitted successfully!');
			setFetching(false);
		} catch (error: any) {
			if (error instanceof AxiosError) {
				Array.isArray(error?.response?.data)
					? setFormErrors(
							error?.response?.data || [
								'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.',
							]
					  )
					: setFormErrors([
							error?.response?.data ||
								'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.',
					  ]);
			} else {
				setFormErrors([
					(error as Error).message ||
						'Unknown server error. If it is a reoccuring error, please use the Contact form to report this issue.',
				]);
			}
			setFetching(false);
		}
	};

	const handleDismissAlert = () => {
		setFormErrors(null);
		setSubmitSuccess(null);
	};

	return (
		<Form ref={formRef} className='d-flex flex-column gap-3'>
			<h5>
				Use this form to provide information about a penalty You believe is
				missing from the list.
			</h5>
			<div className='d-flex flex-column gap-3 p-3 rounded-2 bg-light'>
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
						value={formData.series}
						disabled={fetching}
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
						value={formData.year}
						disabled={fetching || !formData.series}
						required
						aria-describedby='selectYearHelpText'
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
					<Form.Text muted id='messageInputHelpText'>
						Select Series to see supported years.
					</Form.Text>
				</Form.Group>
				<Form.Group>
					<Form.Label htmlFor='title' className='fw-bolder'>
						Penalty Description
					</Form.Label>
					<Form.Control
						className={
							formErrors && !formData.description
								? 'outline-error'
								: !formData.description ||
								  formData.description.length < 16 ||
								  formData.description.length > 512
								? 'outline-warning'
								: 'outline-success'
						}
						type='text'
						as='textarea'
						name='description'
						id='description'
						minLength={8}
						maxLength={512}
						rows={formData.description.length <= 256 ? 6 : 12}
						onChange={handleInputChange}
						value={formData.description}
						placeholder='Description, Title or Link'
						disabled={fetching}
						required
						aria-describedby='descriptionInputHelpText'
					/>
					<Form.Text muted id='descriptionInputHelpText'>
						Description, 16-512 characters long.
					</Form.Text>
				</Form.Group>
				{formErrors && (
					<ErrorMsg errors={formErrors} dismiss={handleDismissAlert} />
				)}
				{submitSuccess && (
					<div className='d-flex m-0 mb-2 alert alert-success alert-dismissible overflow-auto custom-alert-maxheight text-start'>
						<i className='bi bi-patch-check-fill fs-5 m-0 me-2'></i>
						<strong>{submitSuccess}</strong>
						<button
							type='button'
							className='btn btn-close'
							onClick={handleDismissAlert}
						></button>
					</div>
				)}
				{fetching && <LoadingBar width='100%' />}
			</div>
			<div className='w-100 text-end'>
				<Button
					variant='primary'
					type='submit'
					className='fw-bolder'
					disabled={
						fetching ||
						!formData.series ||
						!formData.year ||
						!formData.description ||
						!!formErrors
					}
					onClick={handleSubmit}
				>
					Submit
				</Button>
			</div>
		</Form>
	);
};

export default InformationForm;
