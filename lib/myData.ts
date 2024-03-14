import {
	ContactFormValues,
	InformationFormValues,
	FileFormValues,
	LoginFormValues,
	SeriesDataFormValues,
	UpdatePenaltiesFormValues as UpdatePenaltiesFormValues,
} from '../types/myTypes';

// Main FIA domain.
export const fiaDomain: string = 'https://www.fia.com';

// List of supported Formula Series.
export const supportedSeries: string[] = ['f1', 'f2', 'f3'];

// Default form data state used in ContactForm component.
export const defaultContactFormValues: ContactFormValues = {
	email: '',
	message: '',
};

// Default form data state used in FileForm component.
export const defaultFileFormValues: FileFormValues = {
	series: '',
	file: null,
};

// Default form data state used in InformationForm component.
export const defaultInformationFormValues: InformationFormValues = {
	series: '',
	year: '',
	description: '',
};

// Default form data state used in SeriesDataForm component.
export const defaultSeriesDataFormValues: SeriesDataFormValues = {
	series: '',
	year: '',
	documents_url: '',
};

// Default form data state used in SignInForm component.
export const defaultSignInFormValues: LoginFormValues = {
	password: '',
};

// Default form data state used in UpdatePenaltiesForm component.
export const defaultUpdatePenaltiesFormValues: UpdatePenaltiesFormValues = {
	series: '',
	year: '',
};
