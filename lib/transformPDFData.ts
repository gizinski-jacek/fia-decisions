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
	const headingStrings = stringsArray.slice(0, 10);
	const headingData = {};
	for (let i = 0; i < headingStrings.length; i += 2) {
		headingData[headingStrings[i]] = headingStrings[i + 1] || '';
	}
	const contentStrings = stringsArray.slice(12, 26);
	const contentData = {};
	for (let i = 0; i < contentStrings.length; i += 2) {
		contentData[contentStrings[i]] = contentStrings[i + 1] || '';
	}
	contentData.Headline = stringsArray[11];
	contentData.Reason = stringsArray
		.slice(27, stringsArray.length - 4)
		.join(' ');
	const stewardsData = stringsArray.slice(stringsArray.length - 4);
	const data = {
		weekend: stringsArray[10],
		heading: headingData,
		content: contentData,
		stewards: stewardsData,
	};
	return data;
};
