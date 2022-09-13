export const transformPDFData = (pagesArray) => {
	const stringsArrayList: string[][] = pagesArray.Pages.map((p) => {
		const textList: string[] = p.Texts.map((t) => {
			const string = t.R[0].T.replace(/%C2%A0/gi, ' ').trim();
			return decodeURIComponent(string).trim();
		});
		// Needs major refactoring
		const skipIndexes: number[] = [];
		const modifiedTextList = textList
			.map((text, index) => {
				if (skipIndexes.indexOf(index) !== -1) {
					return;
				}
				// Needs checking/fixing
				if (text.length === 11 && text.includes('Driver')) {
					return 'Driver';
				}
				if (text.length === 1) {
					return;
				}
				if (textList[index - 1] === 'Fact') {
					const arr: string[] = [];
					let i = index;
					while (textList[i] !== 'Offence') {
						if (textList[i].length < 6) {
							break;
						}
						if (textList[i + 1].length < 6) {
							arr.push(textList[i] + ' ' + textList[i + 1]);
							skipIndexes.push(i, i + 1);
						} else {
							arr.push(textList[i]);
							skipIndexes.push(i);
						}
						i++;
					}
					return arr;
				}
				if (textList[index - 1] === 'Decision') {
					const arr: string[] = [];
					let i = index;
					while (textList[i] !== 'Reason') {
						if (textList[i].length < 6) {
							break;
						}
						if (textList[i + 1].length < 6) {
							arr.push(textList[i] + ' ' + textList[i + 1]);
							skipIndexes.push(i, i + 1);
						} else {
							arr.push(textList[i]);
							skipIndexes.push(i);
						}
						i++;
					}
					return arr;
				}
				if (text.charAt(text.length - 1) === ',') {
					skipIndexes.push(index + 1);
					return text + ' ' + textList[index + 1];
				}
				if (text.length > 64 && text.charAt(text.length - 1) !== '.') {
					skipIndexes.push(index + 1);
					return text + ' ' + textList[index + 1];
				}
				return text;
			})
			.filter((u) => u !== undefined);
		modifiedTextList.splice(10, 1);
		modifiedTextList.splice(11, 1);
		return modifiedTextList;
	});
	// Needs major refactoring
	const stringsArray = [].concat.apply([], stringsArrayList);
	const documentInfoStrings = stringsArray.slice(0, 10);
	const documentInfoData = {};
	for (let i = 0; i < documentInfoStrings.length; i += 2) {
		documentInfoData[documentInfoStrings[i]] = documentInfoStrings[i + 1] || '';
	}
	const incidentInfoStrings = stringsArray.slice(12, 26);
	const incidentInfoData = {};
	for (let i = 0; i < incidentInfoStrings.length; i += 2) {
		incidentInfoData[incidentInfoStrings[i]] = incidentInfoStrings[i + 1] || '';
	}
	incidentInfoData.Headline = stringsArray[11];
	incidentInfoData.Reason = stringsArray
		.slice(27, stringsArray.length - 4)
		.join(' ');
	const stewardsData = stringsArray.slice(stringsArray.length - 4);
	const data = {
		weekend: stringsArray[10],
		document_info: documentInfoData,
		incident_info: incidentInfoData,
		stewards: stewardsData,
	};
	return data;
};
