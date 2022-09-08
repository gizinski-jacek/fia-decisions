export const transformPDFData = (pagesArray) => {
	const stringsArray = pagesArray.Pages.map((p) => {
		const textList = p.Texts.map((t) =>
			t.R[0].T.replace(/%C2%A0/gi, ' ')
				.replace(/%2C/gi, ',')
				.replace(/%2F/gi, '/')
				.replace(/%3A/gi, ':')
				.replace(/%20/gi, '')
				.trim()
		);
		// Needs major refactoring
		let skip = false;
		const modifiedTextList = textList
			.map((x, index) => {
				if (!x) {
					return;
				}
				if (skip) {
					skip = false;
					return;
				}
				if (x === 'No / Driver') {
					skip = false;
					return 'Driver';
				}
				if (x.length === 1) {
					skip = false;
					return;
				}
				if (x.charAt(x.length - 1) === ',') {
					skip = true;
					return x + ' ' + textList[index + 1];
				}
				if (x.length > 64 && x.charAt(x.length - 1) !== '.') {
					skip = true;
					return x + ' ' + textList[index + 1];
				}
				skip = false;
				return x;
			})
			.filter((u) => u !== undefined);
		modifiedTextList.splice(10, 1);
		modifiedTextList.splice(11, 1);
		return modifiedTextList;
	});
	// Needs major refactoring
	const headingString = stringsArray[0].slice(0, 10);
	const headingData = {};
	for (let i = 0; i < headingString.length; i += 2) {
		headingData[headingString[i]] = headingString[i + 1] || '';
	}
	const contentString = stringsArray[0].slice(12, 26);
	const contentData = {};
	for (let i = 0; i < contentString.length; i += 2) {
		contentData[contentString[i]] = contentString[i + 1] || '';
	}
	contentData.Headline = stringsArray[0][11];
	contentData.Reason = stringsArray[0]
		.slice(27, stringsArray.length - 5)
		.join(' ');
	const stewardsData = stringsArray[0].slice(stringsArray.length - 5);
	const data = {
		// doc_type: 'decision', // Temporary
		// grand_prix: gpName,
		weekend: stringsArray[0][10],
		heading: headingData,
		content: contentData,
		stewards: stewardsData,
	};
	return data;
};
