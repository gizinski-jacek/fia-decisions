import {
	ContactFormValues,
	DataFormValues,
	FileFormValues,
	LoginFormValues,
	SeriesDataFormValues,
	UpdateDocsFormValues,
} from '../types/myTypes';

// Main FIA domain.
export const fiaDomain: string = 'https://www.fia.com';

// List of supported Formula Series.
export const supportedSeries: string[] = ['f1', 'f2', 'f3'];

// Default form data state used in FileForm component.
export const defaultFileFormValues: FileFormValues = {
	series: '',
	file: null,
};

// Default form data state used in DataForm component.
export const defaultDataFormValues: DataFormValues = {
	series: '',
	year: '',
	description: '',
};

// Default form data state used in UpdateDOcsForm component.
export const defaultUpdateDocsFormValues: UpdateDocsFormValues = {
	series: '',
	year: '',
};

// Default form data state used in ContactForm component.
export const defaultContactFormValues: ContactFormValues = {
	email: '',
	message: '',
};

// Default form data state used in SeriesDataForm component.
export const defaultSeriesDataFormValues: SeriesDataFormValues = {
	series: '',
	year: '',
	documents_url: '',
};

export const defaultDashboardFormValues: LoginFormValues = {
	password: '',
};
