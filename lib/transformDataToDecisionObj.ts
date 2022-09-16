//@ts-nocheck

import {
	DocumentInfo,
	IncidentInfo,
	TransformedPDFData,
} from '../types/myTypes';

export const transformDataToDecisionObj = (
	// Value from anchor href property to decompose into file name, doc type and grand prix name
	hrefString: string,
	// Array of strings parsed from FIA Decision or Offence, but not Reprimand, documents parsed with pdfReader
	pdfDataArray: string[],
	// Info to determine number of strings to slice off, F1 has 4 stewards, F2 and F3 has 3 stewards
	series: 'formula1' | 'formula2' | 'formula3'
): TransformedPDFData => {
	const stewardCount = series === 'formula1' ? 4 : 3;
	let fileName = hrefString.slice(hrefString.lastIndexOf('/') + 1).slice(0, -4);
	if (
		fileName.charAt(fileName.length - 3) === '_' &&
		fileName.charAt(fileName.length - 2) === '0'
	) {
		fileName = fileName.slice(fileName.length - 3);
	}
	const docType = fileName
		.slice(
			fileName.indexOf('-') + 1,
			fileName.indexOf('-', fileName.indexOf('-') + 1)
		)
		.trim();
	const gpName = fileName.slice(0, fileName.indexOf('-')).trim();

	const documentInfoStrings = pdfDataArray.slice(
		0,
		pdfDataArray.indexOf('Time') + 2
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

	const incidentInfoStrings = pdfDataArray
		.slice(pdfDataArray.indexOf('Time') + 2, pdfDataArray.lastIndexOf('Reason'))
		.map((str, i, arr) => {
			if (i !== 0 && str.length > 3) {
				if (str.includes('No') && str.includes('Driver')) {
					return 'Driver';
				} else if (
					i + 1 !== arr.length &&
					str.toLowerCase().includes('team') &&
					arr[i + 1].toLowerCase().includes('manager')
				) {
					return 'Team Manager';
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
						incidentInfoStringsWithoutHeadline[i]?.length - 1
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
			} else if (incidentInfoStringsWithoutHeadline[index - 1] === 'Offence') {
				const arr: string[] = [];
				let i = index;
				while (incidentInfoStringsWithoutHeadline[i] !== 'Decision') {
					arr.push(incidentInfoStringsWithoutHeadline[i] as string);
					incidentSkipIndexes.push(i);
					i++;
				}
				return arr.join(' ');
			} else if (incidentInfoStringsWithoutHeadline[index - 1] === 'Decision') {
				const arr: string[] = [];
				let i = index;
				while (incidentInfoStringsWithoutHeadline[i]) {
					arr.push(incidentInfoStringsWithoutHeadline[i] as string);
					incidentSkipIndexes.push(i);
					i++;
				}
				return arr;
			} else {
				return str;
			}
		})
		.filter((u) => u !== undefined);

	for (let i = 0; i < incidentInfoFormatted.length; i += 2) {
		// Reminder to fix type error here
		incidentInfo[incidentInfoFormatted[i]] = incidentInfoFormatted[i + 1] || '';
	}

	const stewards = pdfDataArray.slice(pdfDataArray.length - stewardCount);

	const reasonStrings = pdfDataArray
		.slice(pdfDataArray.lastIndexOf('Reason') + 1)
		.filter((str) => str !== 'The Stewards')
		.slice(0, pdfDataArray.length - (stewardCount + 1));
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
		'time',
		'grid',
		'fine',
		'disqualified',
		'warning',
		'drive through',
		'pit lane',
		'reprimand',
	];
	let penaltyType = 'none';
	penaltiesArray.forEach((value) => {
		if (incidentInfo.Decision[0].toLowerCase().includes(value)) {
			penaltyType = value;
			return;
		}
	});

	const dateString = documentInfo.Date + ' ' + documentInfo.Time;
	const timeOffset = new Date().getTimezoneOffset() * 60000;
	const dateUTC = new Date(dateString).getTime() - timeOffset;
	const docDate = new Date(dateUTC);

	const data = {
		doc_type: docType,
		doc_name: fileName,
		doc_date: docDate,
		grand_prix: gpName,
		penalty_type: penaltyType,
		weekend: weekend,
		document_info: documentInfo,
		incident_info: { ...incidentInfo, Reason: reasonText },
		stewards: stewards,
	};

	return data;
};
