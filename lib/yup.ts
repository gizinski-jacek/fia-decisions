import * as Yup from 'yup';
import {
	ContactFormValues,
	LoginFormValues,
	InformationFormValues,
	SeriesDataFormValues,
} from '../types/myTypes';
import { fiaDomain, supportedSeries } from './myData';

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

export const informationFormValidationSchema: Yup.SchemaOf<InformationFormValues> =
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
			.min(16, 'Email min 16 characters.')
			.max(64, 'Email max 64 characters.')
			.email('Email is invalid.'),
		message: Yup.string()
			.required('Message is required.')
			.min(16, 'Message min 16 characters.')
			.max(512, 'Message max 512 characters.'),
	});

export const seriesDataFormValidationSchema: Yup.SchemaOf<
	Omit<SeriesDataFormValues, 'year'> & { year: number }
> = Yup.object().shape({
	series: Yup.string()
		.required('Series is required.')
		.test('is-supported-series', 'Series is not supported.', (val) => {
			if (!val) return false;
			return supportedSeries.find((s) => s.toLowerCase() === val.toLowerCase())
				? true
				: false;
		}),
	year: Yup.number()
		.test('number-only', 'Year has to be a number.', (val: any) => {
			return /^\d+$/.test(val);
		})
		.min(1950, 'Year min value is 1950.')
		.max(new Date().getFullYear(), 'Year max value is 9999.')
		.required('Year is required.'),
	documents_url: Yup.string()
		.required('Series documents page url is required.')
		.min(64, 'URL min 64 characters.')
		.max(512, 'URL max 512 characters.')
		.url('URL is invalid.')
		.test(
			'url-points-to-fia-domain',
			'URL does not seem to point to https://www.fia.com domain.',
			(val) => {
				if (!val) return false;
				return val.includes(fiaDomain) ? true : false;
			}
		),
});

export const loginFormValidationSchema: Yup.SchemaOf<LoginFormValues> =
	Yup.object().shape({
		password: Yup.string()
			.required('Password is required.')
			.min(16, 'Password min 16 characters.')
			.max(64, 'Password max 64 characters.'),
	});
