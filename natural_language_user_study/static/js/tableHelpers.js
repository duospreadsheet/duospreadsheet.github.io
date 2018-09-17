const TableHelpers = {
	createIndexColumnHTML: function(rowData) { // rowData: { index, data } or rowData: { index, data, added, removed }
		const indexColumnHTML = [];

		for (let i = 0; i < rowData.length; i++) {
			let currentIndex = rowData[i].index;
			let currentIndexHTML = null;
			let isCurrentRowAddedToIncluded = ('added' in rowData[i] && rowData[i].added );
			let isCurrentRowRemovedFromIncluded = ('removed' in rowData[i] && rowData[i].removed );

			if (isCurrentRowAddedToIncluded)
				currentIndexHTML = '<div class="row-index added">' + currentIndex + '</div>';
			if (isCurrentRowRemovedFromIncluded)
				currentIndexHTML = '<div class="row-index removed">' + currentIndex + '</div>';
			if (!isCurrentRowAddedToIncluded && !isCurrentRowRemovedFromIncluded)
				currentIndexHTML = '<div class="row-index">' + currentIndex + '</div>';

			indexColumnHTML.push(currentIndexHTML);
		}

		return indexColumnHTML;
	},
	createHeaderHTML: function() {
		const self = this;
		let headerHTML = '<span class="column-index"></span>'; // dummy
		let numberOfColumns = Database.data.columns.length;

		// create html
		for (let i = 0; i < numberOfColumns; i++) {
			let currentColumnIndex = self.generateAlphabeticalIndex(i);
			let currentColumnName = Database.data.columns[i];
			let isCurrentAttrNumerical = (Database.isCategoricalOrNumerical[currentColumnName] == 'numerical');

			if (isCurrentAttrNumerical) {
				headerHTML += '<span class="column-index resizable" column-index="' + i + '" attribute-name="' + currentColumnName + '" lower-value="" upper-value="">' +
									'<span class="label">' + currentColumnIndex + ' (' + currentColumnName + ')' + '</span>' +
									'<span class="fas fa-caret-square-down"></span>' +
							  '</span>';
			}

			if (!isCurrentAttrNumerical) {
				headerHTML += '<span class="column-index resizable" column-index="' + i + '" attribute-name="' + currentColumnName + '" category="">' +
									'<span class="label">' + currentColumnIndex + ' (' + currentColumnName + ')' + '</span>' +
									'<span class="fas fa-caret-square-down"></span>' +
							  '</span>';
			}
		}

		return headerHTML;
	},
	createRowHTML: function(rowData) { // rowData: { index, data } or rowData: { index, data, added, removed }
		const rowHTML = [];
		const isNumerical = {};

		let rows = rowData;
		let columns = Database.data.columns;
		let numberOfRows = rowData.length;
		let numberOfColumns = Database.data.columns.length;

		// speed up by creating isNumerical
		for (let attributeName in Database.isCategoricalOrNumerical)
			isNumerical[attributeName] = (Database.isCategoricalOrNumerical[attributeName] == 'numerical');

		// create HTML for all rows
		for (let i = 0; i < numberOfRows; i++) {
			let currentRowHTML = null;
			let currentRowObject = rows[i].data;
			let isCurrentRowAddedToIncluded = ('added' in rows[i] && rows[i].added );
			let isCurrentRowRemovedFromIncluded = ('removed' in rows[i] && rows[i].removed );

			if (isCurrentRowAddedToIncluded)
				currentRowHTML = '<div class="row added">';
			if (isCurrentRowRemovedFromIncluded)
				currentRowHTML = '<div class="row removed">';
			if (!isCurrentRowAddedToIncluded && !isCurrentRowRemovedFromIncluded)
				currentRowHTML = '<div class="row">';

			// create HTML of a single row
			for (let j = 0; j < numberOfColumns; j++) {
				let currentAttributeName = columns[j];
				let currentAttributeValue = currentRowObject[currentAttributeName];
				let isCurrentAttrNumerical = isNumerical[currentAttributeName];

				if (isCurrentAttrNumerical)
					currentRowHTML += '<span class="cell" attribute-name="' + currentAttributeName + '" lower-value="' + currentAttributeValue + '" upper-value="' + currentAttributeValue + '">' + currentAttributeValue + '</span>';
				if (!isCurrentAttrNumerical)
					currentRowHTML += '<span class="cell" attribute-name="' + currentAttributeName + '" category="' + currentAttributeValue + '">' + currentAttributeValue + '</span>';
			}

			// store to array
			currentRowHTML += '</div>'
			rowHTML.push(currentRowHTML);
		}

		return rowHTML;
	},
	generateAlphabeticalIndex: function(columnIndex) {
		let numberOfDigitsRequired = 1;
		let adjustedColumnIndex = columnIndex;
		let currentDividend = null;
		let alphabeticalIndex = '';
		const base26Number = [];
		const alphabet = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 
						   'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 
						   'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ];

		// check number of digits required
		while (adjustedColumnIndex >= Math.pow(26, numberOfDigitsRequired)) {
			adjustedColumnIndex -= Math.pow(26, numberOfDigitsRequired);
			numberOfDigitsRequired++;
		}

		// generate base 26 number
		currentDividend = adjustedColumnIndex;

		while (currentDividend >= 26) {
			let quotient = Math.floor(currentDividend / 26);
			let remainder = currentDividend % 26;

			base26Number.unshift(remainder);
			currentDividend = quotient;
		}

		base26Number.unshift(currentDividend);

		// fill the base26Number by zero based on the required number of digits
		while (base26Number.length < numberOfDigitsRequired)
			base26Number.unshift(0);

		// generate alphabetical index
		for (let i = 0; i < base26Number.length; i++) {
			let currentDigit = base26Number[i];
			let currentAlphabet = alphabet[currentDigit];

			alphabeticalIndex += currentAlphabet;
		}

		return alphabeticalIndex;
	},
	generateWidthConstraintCSS: function(tableContentSelector, topBarScrollableAreaSelector, widthConstraintRules) {
		let widthConstraintCSS = '';

		for (let columnIndex in widthConstraintRules) {
			let widthConstraint = widthConstraintRules[columnIndex]
			let tableCellSelector = tableContentSelector + ' .row .cell:nth-child(' + columnIndex + ')';
			let headerCellSelector = topBarScrollableAreaSelector + ' .column-index:nth-child(' + (parseInt(columnIndex) + 1) + ')';
			
			widthConstraintCSS += tableCellSelector + ' { width: ' + widthConstraint + 'px; } ';
			widthConstraintCSS += headerCellSelector + ' { width: ' + widthConstraint + 'px; } ';
		}
		
		return widthConstraintCSS;
	}
}