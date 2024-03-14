import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { defaultSignInFormValues } from '../../lib/myData';
import { LoginFormValues } from '../../types/myTypes';
import axios, { AxiosError } from 'axios';
import LoadingBar from '../LoadingBar';
import { useRouter } from 'next/router';

const SignInForm = () => {
	const [formData, setFormData] = useState<LoginFormValues>(
		defaultSignInFormValues
	);
	const [formErrors, setFormErrors] = useState<string[] | null>(null);
	const [fetching, setFetching] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const router = useRouter();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
			setFetching(true);
			await axios.post('/api/forms/dashboard-sign-in', uploadData, {
				timeout: 15000,
			});
			setFetching(false);
			router.push('/dashboard');
		} catch (error: any) {
			if (error instanceof AxiosError) {
				Array.isArray(error?.response?.data)
					? setFormErrors(error?.response?.data || ['Unknown server error.'])
					: setFormErrors([error?.response?.data || 'Unknown server error.']);
			} else {
				setFormErrors([(error as Error).message || 'Unknown server error.']);
			}
			setFetching(false);
		}
	};

	const handleShowPassword = () => {
		setShowPassword(true);
	};

	const handleHidePassword = () => {
		setShowPassword(false);
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
							: formData.password.length < 16 || formData.password.length > 64
							? 'outline-warning'
							: 'outline-success'
					}`}
					type={showPassword ? 'text' : 'password'}
					name='password'
					id='password'
					minLength={16}
					maxLength={64}
					onChange={handleInputChange}
					value={formData.password}
					placeholder='Password'
					disabled={fetching}
					required
					aria-describedby='dashboardPasswordInputHelpText'
				/>
				<Form.Text muted id='dashboardPasswordInputHelpText'>
					Password, 16-64 characters long.
				</Form.Text>
				{showPassword ? (
					<i
						className='bi bi-eye-slash-fill fs-5 m-0 ms-2'
						onClick={handleHidePassword}
					></i>
				) : (
					<i
						className='bi bi-eye-fill fs-5 m-0 ms-2'
						onClick={handleShowPassword}
					></i>
				)}
			</Form.Group>
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
			{fetching && <LoadingBar margin='1rem 0' width='50%' />}
			<Button
				variant='dark'
				type='submit'
				className='fw-bolder'
				disabled={fetching || !formData.password || !!formErrors}
				onClick={handleSubmit}
			>
				Submit
			</Button>
		</Form>
	);
};

export default SignInForm;
