import multiparty from 'multiparty';
import { NextApiRequest } from 'next';

export const parseFile = (req: NextApiRequest) => {
	// Currently not working when imported, looking for fix...
	//
	const form = new multiparty.Form();
	return new Promise((resolve, reject) => {
		// Errors may be emitted
		// Note that if you are listening to 'part' events, the same error may be
		// emitted from the `form` and the `part`.
		form.on('error', (error: any) => {
			console.log('Error parsing form: ' + error.stack);
			reject(new Error('Error parsing form'));
		});
		// Parts are emitted when parsing the form
		form.on('part', async (part) => {
			// You *must* act on the part by reading it
			// NOTE: if you want to ignore it, just call "part.resume()"
			if (part.filename === undefined) {
				// filename is not defined when this is a field and not a file
				// console.log('got field named ' + part.name);
				// ignore field's content
				part.resume();
			}
			if (part.filename !== undefined) {
				// filename is defined when this is a file
				// console.log('got file named ' + part.name);
				// ignore file's content here
				part.resume();
			}
			part.on('error', (error: any) => {
				// decide what to do
				console.log('got error on part ' + error);
				reject(new Error('File error'));
			});
			resolve(part);
		});

		// Close emitted after form parsed
		form.on('close', () => {
			console.log('Upload completed!');
		});

		// Parse req
		form.parse(req);
	});
};

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
