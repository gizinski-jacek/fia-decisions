import {
	DatabaseNameList,
	FiaPageList,
	ContactFormValues,
	DataFormValues,
	FileFormValues,
	DashboardFormValues,
} from '../types/myTypes';

// Main FIA domain.
export const fiaDomain: string = 'https://www.fia.com';

// FIA page for supported racing series.
export const fiaPageList: FiaPageList = {
	f1_2022_page:
		'https://www.fia.com/documents/championships/fia-formula-one-world-championship-14/season/season-2022-2005',
	f2_2022_page:
		'https://www.fia.com/documents/championships/formula-2-championship-44/season/season-2022-2005',
	f3_2022_page:
		'https://www.fia.com/documents/championships/fia-formula-3-championship-1012/season/season-2022-2005',
};

export const supportedSeries: string[] = ['formula1', 'formula2', 'formula3'];

// Database names for each supported racing series.
export const dbNameList: DatabaseNameList = {
	f1_2022_db: '2022_F1_WC_Docs',
	f2_2022_db: '2022_F2_WC_Docs',
	f3_2022_db: '2022_F3_WC_Docs',
	other_documents_db: 'otherDocs',
};

// Default form data state used in FileForm component.
export const defaultFileValues: FileFormValues = {
	series: '',
	file: null,
};

// Default form data state used in DataForm component.
export const defaultDocValues: DataFormValues = {
	series: '',
	title: '',
	url: '',
};

// Default form data state used in ContactForm component.
export const defaultContactValues: ContactFormValues = {
	email: '',
	message: '',
};

export const defaultDashboardValues: DashboardFormValues = {
	password: '',
};
