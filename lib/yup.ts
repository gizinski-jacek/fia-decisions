import * as Yup from 'yup';
import {
	ContactFormValues,
	DashboardFormValues,
	DataFormValues,
} from '../types/myTypes';
import { supportedSeries } from './myData';

export default async function yupValidation<T = Record<string, any>>(
	scheme: Yup.SchemaOf<T>,
	data: Record<string, any> | null
) {
	try {
		await scheme.validate(data, { abortEarly: false });
		return { isValid: true, errors: null };
	} catch (error: any) {
		const { errors } = error;
		return { isValid: false, errors };
	}
}

export const dataFormValidationSchema: Yup.SchemaOf<DataFormValues> =
	Yup.object().shape({
		series: Yup.string()
			.required('Series is required.')
			.test('is-supported-series', 'Series is not supported.', (val) => {
				if (!val) return false;
				return supportedSeries.find(
					(s) => s.toLowerCase() === val.toLowerCase()
				)
					? true
					: false;
			}),
		year: Yup.string().required('Year is required.'),
		description: Yup.string()
			.required('Description is required.')
			.min(16, 'Description min 16 characters.')
			.max(512, 'Description max 512 characters.'),
	});

export const contactFormValidationSchema: Yup.SchemaOf<ContactFormValues> =
	Yup.object().shape({
		email: Yup.string()
			.required('Email is required.')
			.min(8, 'Email min 8 characters.')
			.max(64, 'Email max 64 characters.')
			.email('Email is invalid.'),
		message: Yup.string()
			.required('Message is required.')
			.min(4, 'Message min 4 characters.')
			.max(512, 'Message max 512 characters.'),
	});

export const dashboardFormValidationSchema: Yup.SchemaOf<DashboardFormValues> =
	Yup.object().shape({
		password: Yup.string()
			.required('Password is required.')
			.min(8, 'Password min 8 characters.')
			.max(64, 'Password max 64 characters.'),
	});
