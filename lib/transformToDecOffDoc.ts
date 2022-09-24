//@ts-nocheck

import {
	DocumentInfo,
	IncidentInfo,
	TransformedPDFData,
} from '../types/myTypes';

export const transformToDecOffDoc = (
	// Value from anchor href property to decompose into file name, doc type and grand prix name.
	string: string,
	// Array of strings parsed from FIA Decision or Offence, but not Reprimand, documents parsed with pdfReader.
	pdfDataArray: string[],
	// Info to determine number of strings to slice off, F1 has 4 stewards, F2 and F3 has 3 stewards.
	series: 'formula1' | 'formula2' | 'formula3'
): TransformedPDFData => {
	let fileName: string;
	// Checking if string value comes from file name or from anchors href.
	if (string.lastIndexOf('/') === -1) {
		// Removing just file extension.
		fileName = string.slice(0, -4);
	} else {
		// Extracting file name from href, removing extension.
		fileName = string.slice(string.lastIndexOf('/') + 1).slice(0, -4);
	}
	// Extracting end part of filename, matching against common duplicate file suffixes.
	// Removing suffix if present.
	const regexMatch = fileName.slice(-5).match(/(_|-| )?\(?[0-9]{1,2}\)?/);
	if (regexMatch) {
		fileName = fileName.slice(0, -regexMatch[0].length);
	}
	fileName.trim();

	// Extracting grand prix name.
	const gpName = fileName.slice(0, fileName.indexOf('-')).trim();
	// Checking if document file name is title offence or decision.
	const docType = (() => {
		const str = fileName.replace(gpName, '').slice(0, 10).toLowerCase();
		return str.includes('offence')
			? 'Offence'
			: str.includes('decision')
			? 'Decision'
			: 'Wrong Doc Type';
	})();

	const incidentTitle = [fileName].map((string) => {
		// Removing grand prix name from filename string.
		let str = string.replace(gpName, '').trim();
		// Checking for a dash, removing it and trimming whitespaces.
		if (str.charAt(0) === '-') {
			str = str.slice(1).trim();
		}
		// Checking for "offence" word, removing it and trimming whitespaces.
		if (str.slice(0, 7).toLowerCase().trim() === 'offence') {
			str = str.slice(7).trim();
		}
		if (str.slice(0, 8).toLowerCase().trim() === 'decision') {
			// Checking for "decision" word, removing it and trimming whitespaces.
			str = str.slice(8).trim();
		}
		// Checking for a dash, removing it and trimming whitespaces.
		if (str.charAt(0) === '-') {
			str = str.slice(1).trim();
		}
		return str;
	})[0];

	const trimmedStringsArray = pdfDataArray.map((str) => str.trim());
	const documentInfoStrings = trimmedStringsArray.slice(
		0,
		trimmedStringsArray.indexOf('Time') + 2
	);

	const documentSkipIndexes: number[] = [];
	const documentInfoFormatted = documentInfoStrings
		.map((str, i) => {
			if (documentSkipIndexes.indexOf(i) !== -1) {
				return;
			}

			if (str.charAt(str.length - 1) === ',') {
				documentSkipIndexes.push(i + 1);
				return str + ' ' + documentInfoStrings[i + 1];
			} else {
				return str;
			}
		})
		.filter((u) => u !== undefined) as string[];

	const documentInfo = {} as DocumentInfo;
	for (let i = 0; i < documentInfoFormatted.length; i += 2) {
		documentInfo[documentInfoFormatted[i] as keyof DocumentInfo] =
			documentInfoFormatted[i + 1] || '';
	}

	const incidentInfoStrings = trimmedStringsArray
		.slice(
			trimmedStringsArray.indexOf('Time') + 2,
			trimmedStringsArray.lastIndexOf('Reason')
		)
		.map((str, i, arr) => {
			if (i !== 0 && str.length > 3) {
				if (
					str.toLowerCase().includes('no') &&
					str.toLowerCase().includes('driver')
				) {
					return 'Driver';
				} else if (
					i + 1 !== arr.length &&
					str.toLowerCase().trim() === 'team' &&
					arr[i + 1].toLowerCase().trim() === 'manager'
				) {
					throw new Error('Not a driver penalty. Skipping.');
				} else if (str === 'The Stewards') {
					return;
				} else {
					return str;
				}
			}
		})
		.filter((u) => u !== undefined);

	const weekend = incidentInfoStrings[0] as string;
	const incidentInfoStringsWithoutWeekend = incidentInfoStrings.slice(1);

	const incidentInfo = {} as IncidentInfo;
	incidentInfo.Headline = incidentInfoStringsWithoutWeekend
		.slice(0, incidentInfoStringsWithoutWeekend.indexOf('Driver'))
		.join(' ');

	const incidentSkipIndexes: number[] = [];
	const incidentInfoStringsWithoutHeadline =
		incidentInfoStringsWithoutWeekend.slice(
			incidentInfoStringsWithoutWeekend.indexOf('Competitor') - 2
		);

	const incidentInfoFormatted = incidentInfoStringsWithoutHeadline
		.map((str, index) => {
			if (incidentSkipIndexes.indexOf(index) !== -1) {
				return;
			}

			if (incidentInfoStringsWithoutHeadline[index - 1] === 'Fact') {
				const arr: string[] = [];
				let i = index;
				if (
					i === index &&
					incidentInfoStringsWithoutHeadline[i]?.charAt(
						(incidentInfoStringsWithoutHeadline[i]?.length as number) - 1
					) !== ':'
				) {
					while (incidentInfoStringsWithoutHeadline[i] !== 'Offence') {
						arr.push(incidentInfoStringsWithoutHeadline[i] as string);
						incidentSkipIndexes.push(i);
						i++;
					}
					return arr.join(' ');
				} else {
					while (incidentInfoStringsWithoutHeadline[i] !== 'Offence') {
						if (
							(incidentInfoStringsWithoutHeadline[i + 1] as string).length < 6
						) {
							arr.push(
								incidentInfoStringsWithoutHeadline[i] +
									' ' +
									incidentInfoStringsWithoutHeadline[i + 1]
							);
							incidentSkipIndexes.push(i, i + 1);
						} else {
							arr.push(incidentInfoStringsWithoutHeadline[i] as string);
							incidentSkipIndexes.push(i);
						}
						i++;
					}
					return arr;
				}
			}

			if (incidentInfoStringsWithoutHeadline[index - 1] === 'Offence') {
				const arr: string[] = [];
				let i = index;
				while (incidentInfoStringsWithoutHeadline[i] !== 'Decision') {
					arr.push(incidentInfoStringsWithoutHeadline[i] as string);
					incidentSkipIndexes.push(i);
					i++;
				}
				return arr.join(' ');
			}

			if (incidentInfoStringsWithoutHeadline[index - 1] === 'Decision') {
				const arr: string[] = [];
				let i = index;
				if (
					incidentInfoStringsWithoutHeadline[i]?.charAt(
						(incidentInfoStringsWithoutHeadline[i]?.length as number) - 1
					) === ':'
				) {
					while (incidentInfoStringsWithoutHeadline[i]) {
						arr.push(incidentInfoStringsWithoutHeadline[i] as string);
						incidentSkipIndexes.push(i);
						i++;
					}
					return arr;
				} else {
					while (incidentInfoStringsWithoutHeadline[i]) {
						arr.push(incidentInfoStringsWithoutHeadline[i] as string);
						incidentSkipIndexes.push(i);
						i++;
					}
					return [arr.join(' ')];
				}
			}

			return str;
		})
		.filter((u) => u !== undefined);

	for (let i = 0; i < incidentInfoFormatted.length; i += 2) {
		// Reminder to fix type error here
		const key = incidentInfoFormatted[i];
		const value = incidentInfoFormatted[i + 1] || '';
		incidentInfo[key] = value;
	}

	const stewardCount = series === 'formula1' ? 4 : 3;
	const stewards = trimmedStringsArray
		.filter((str) => str !== 'The Stewards')
		.slice(stewardCount - stewardCount * 2);

	const reasonStrings = trimmedStringsArray
		.slice(trimmedStringsArray.lastIndexOf('Reason') + 1)
		.filter((str) => str !== 'The Stewards')
		.slice(0, stewardCount - stewardCount * 2);

	const reasonSkipIndexes: number[] = [];
	const reasonText = reasonStrings
		.map((str, i) => {
			if (reasonSkipIndexes.indexOf(i) !== -1) {
				return;
			} else if (str.charAt(str.length - 1) === ',') {
				reasonSkipIndexes.push(i + 1);
				return str + ' ' + reasonStrings[i + 1];
			} else if (str.length > 64 && str.charAt(str.length - 1) !== '.') {
				reasonSkipIndexes.push(i + 1);
				return str + ' ' + reasonStrings[i + 1];
			} else {
				return str;
			}
		})
		.filter((u) => u !== undefined)
		.join(' ');

	const penaltiesArray = [
		'Time',
		'Grid',
		'Fine',
		'Disqualified',
		'Warning',
		'Drive Through',
		'Drive-Through',
		'Pit Lane',
		'Pit-Lane',
		'Reprimand',
	];
	let penaltyType = 'none';
	penaltiesArray.forEach((value) => {
		if (incidentInfo.Decision[0].toLowerCase().includes(value.toLowerCase())) {
			penaltyType = value;
			return;
		}
	});

	const dateString = documentInfo.Date + ' ' + documentInfo.Time;
	const timeOffset = new Date().getTimezoneOffset() * 60000;
	const dateUTC = new Date(dateString).getTime() - timeOffset;
	const docDate = new Date(dateUTC);

	const data = {
		series: series,
		doc_type: docType,
		doc_name: fileName,
		doc_date: docDate,
		grand_prix: gpName,
		penalty_type: penaltyType,
		weekend: weekend,
		incident_title: incidentTitle,
		document_info: documentInfo,
		incident_info: { ...incidentInfo, Reason: reasonText },
		stewards: stewards,
	};

	return data;
};
