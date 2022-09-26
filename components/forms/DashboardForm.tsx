import { useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { defaultDashboardValues } from '../../lib/myData';
import {
	ContactDocModel,
	DashboardFormValues,
	MissingDocModel,
} from '../../types/myTypes';
import axios, { AxiosError } from 'axios';

interface Props {
	handleSignIn: (data: {
		missing: MissingDocModel[];
		contact: ContactDocModel[];
	}) => void;
}

const DashboardForm = ({ handleSignIn }: Props) => {
	const [formData, setFormData] = useState<DashboardFormValues>(
		defaultDashboardValues
	);
	const [formErrors, setFormErrors] = useState<string[]>([]);
	const [sending, setSending] = useState(false);

	const formRef = useRef<HTMLFormElement>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormErrors([]);
		const { name, value } = e.target;
		setFormData((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setFormErrors([]);
		try {
			if (!formData.password) {
				setFormErrors(['Must provide a password.']);
				return;
			}
			const uploadData = new FormData();
			for (const [key, value] of Object.entries(formData)) {
				uploadData.append(key, value);
			}
			setSending(true);
			const res = await axios.post('/api/forms/dashboard', uploadData, {
				timeout: 15000,
			});
			setSending(false);
			handleSignIn(res.data);
		} catch (error) {
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
		<Form
			ref={formRef}
			className='my-5 text-center d-flex flex-column justify-content-center align-items-center'
		>
			<h2 className='my-5'>Dashboard Access</h2>
			<Form.Group>
				<Form.Label htmlFor=''>Dashboard Password</Form.Label>
				<Form.Control
					className={`${
						formErrors.length > 0 ||
						formData.password.length < 8 ||
						formData.password.length > 64
							? 'outline-error'
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
					aria-describedby='dashboardPasswordInputHelpText'
				/>
				<Form.Text muted id='dashboardPasswordInputHelpText'>
					Password 8-64 characters long
				</Form.Text>
				{formErrors.length > 0 && (
					<div className='m-0 mt-4 alert alert-danger alert-dismissible'>
						{formErrors.map((message, index) => (
							<div key={index}>{message}</div>
						))}
						<button
							type='button'
							className='btn btn-close'
							onClick={() => setFormErrors([])}
						></button>
					</div>
				)}
			</Form.Group>
			<Button
				variant='dark'
				className='fw-bolder my-3'
				disabled={sending}
				onClick={handleSubmit}
			>
				Submit
			</Button>
		</Form>
	);
};

export default DashboardForm;
