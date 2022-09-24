import multiparty from 'multiparty';
import { NextApiRequest } from 'next';

export const parseFields = (
	req: NextApiRequest
): Promise<{ [key: string]: string }> => {
	return new Promise((resolve, reject) => {
		const form = new multiparty.Form();
		// Errors may be emitted
		// Note that if you are listening to 'part' events, the same error may be
		// emitted from the `form` and the `part`.
		form.on('error', (error: any) => {
			console.log('Error parsing form: ' + error.stack);
			reject(new Error('Error parsing form'));
		});
		const fieldsArray: { [key: string]: string } = {};
		form.on('field', async (name, value) => {
			if (!name && !value) {
				console.log('no field values:' + name + ' - ' + value);
				reject(new Error('No field values found'));
			}
			fieldsArray[name] = value;
		});

		// Close emitted after form parsed
		form.on('close', () => {
			resolve(fieldsArray);
		});

		// Parse req
		form.parse(req);
	});
};
