import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { defaultDashboardFormValues } from '../../lib/myData';
import { LoginFormValues } from '../../types/myTypes';
import axios, { AxiosError } from 'axios';
import LoadingBar from '../LoadingBar';

interface Props {
	handleSignIn: () => void;
}

const DashboardForm = ({ handleSignIn }: Props) => {
	const [formData, setFormData] = useState<LoginFormValues>(
		defaultDashboardFormValues
	);
	const [formErrors, setFormErrors] = useState<string[] | null>(null);
	const [sending, setSending] = useState(false);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormErrors(null);
		const { name, value } = e.target;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		try {
			e.preventDefault();
			setFormErrors(null);
			if (!formData.password) {
				setFormErrors(['Must provide a password.']);
				return;
			}
			const uploadData = new FormData();
			for (const [key, value] of Object.entries(formData)) {
				uploadData.append(key, value);
			}
			setSending(true);
			await axios.post('/api/forms/dashboard-sign-in', uploadData, {
				timeout: 15000,
			});
			setSending(false);
			handleSignIn();
		} catch (error: any) {
			setSending(false);
			if (error instanceof AxiosError) {
				Array.isArray(error?.response?.data)
					? setFormErrors(error?.response?.data || ['Unknown server error.'])
					: setFormErrors([error?.response?.data || 'Unknown server error.']);
			} else {
				setFormErrors([(error as Error).message || 'Unknown server error.']);
			}
		}
	};

	return (
		<Form className='w-50 mx-auto my-5 p-3 bg-light rounded text-center d-flex flex-column gap-3 justify-content-center align-items-center'>
			<h2>Dashboard Access</h2>
			<Form.Group>
				<Form.Label htmlFor=''>Dashboard Password</Form.Label>
				<Form.Control
					className={`${
						formErrors && formData.password
							? 'outline-error'
							: formData.password.length < 8 || formData.password.length > 64
							? 'outline-warning'
							: 'outline-success'
					}`}
					type='password'
					name='password'
					id='password'
					minLength={8}
					maxLength={64}
					onChange={handleInputChange}
					value={formData.password}
					placeholder='Password'
					disabled={sending}
					required
					aria-describedby='dashboardPasswordInputHelpText'
				/>
				<Form.Text muted id='dashboardPasswordInputHelpText'>
					Password 8-64 characters long
				</Form.Text>
			</Form.Group>
			{formErrors && (
				<div className='m-0 mt-4 alert alert-danger alert-dismissible'>
					{formErrors.map((message, index) => (
						<div key={index}>{message}</div>
					))}
					<button
						type='button'
						className='btn btn-close'
						onClick={() => setFormErrors(null)}
					></button>
				</div>
			)}
			{sending && <LoadingBar margin='1rem 0' width='50%' />}
			<Button
				variant='dark'
				className='fw-bolder'
				disabled={sending || !formData.password || !!formErrors}
				onClick={handleSubmit}
			>
				Submit
			</Button>
		</Form>
	);
};

export default DashboardForm;
