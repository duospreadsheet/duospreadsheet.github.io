const Database = {
	data: null,
	vocabList: null,
	isCategoricalOrNumerical: {},
	metadata: {}, // range for numerical and values for categorical and many uniques

	// temp date
	numberOfUniqueValues: {},

	storeData: function(data) {
		const self = this;

		self.data = data;
	},
	processData: function() {
		const self = this;

		self.detectIsCategoricalOrNumerical();
		self.getMetadataAndTransformNumericalData();
		self.createVocabList();
	},
	forEachNonMissingValue: function(attributeName, callback) { // loop except missing values
		const self = this;

		for (let i = 0; i < self.data.length; i++) {
			let currentValue = self.data[i][attributeName];

			if (currentValue !== '')
				callback(currentValue, i);
		}
	},
	detectIsCategoricalOrNumerical: function() { // check 10% of data if more than 1000 rows
		const self = this;
		const attributeList = self.data.columns;
		const indicesForChecking = [];
		let numberOfRowsChecked = null;

		// determine number of rows checked
		if (self.data.length <= 1000)
			numberOfRowsChecked = self.data.length;
		if (self.data.length > 1000 && self.data.length * 0.05 <= 1000)
			numberOfRowsChecked = 1000;
		if (self.data.length > 1000 && self.data.length * 0.05 > 1000)
			numberOfRowsChecked = self.data.length * 0.05;

		// directly get ordered Indices
		if (self.data.length <= numberOfRowsChecked) { 
			for (let i = 0; i < numberOfRowsChecked; i++)
				indicesForChecking.push(i);
		}

		// generate indices for checking
		if (self.data.length > numberOfRowsChecked) { 
			const randomIndices = [];

			// get ordered indices
			for (let i = 0; i < self.data.length; i++)
				randomIndices.push(i);

			// shuffle
			Helpers.shuffle(randomIndices);

			// get required number
			for (let i = 0; i < numberOfRowsChecked; i++)
				indicesForChecking.push(randomIndices[i]);
		}
		
		// check for each attribute
		for (let i = 0; i < attributeList.length; i++) {
			let currentAttribute = attributeList[i];
			let isCurrentAttrNumerical = true;
			let hasTooManyUniqueValues = false;
			let numberOfUniqueValues = null;
			const allValues = {}; // use objects to make it more efficient

			for (let j = 0; j < indicesForChecking.length; j++) {
				let currentIndex = indicesForChecking[j];
				let currentValue = self.data[currentIndex][currentAttribute];

				// check if is numerical
				if (isNaN(currentValue))
					isCurrentAttrNumerical = false;

				// store all unique values
				allValues[currentValue] = null;
			}

			// check if is too many unique values
			numberOfUniqueValues = Object.keys(allValues).length;

			if (numberOfUniqueValues > numberOfRowsChecked * 0.9)
				hasTooManyUniqueValues = true;

			// store results
			if (isCurrentAttrNumerical)
				self.isCategoricalOrNumerical[currentAttribute] = 'numerical';
			if (!isCurrentAttrNumerical && !hasTooManyUniqueValues)
				self.isCategoricalOrNumerical[currentAttribute] = 'categorical';
			if (!isCurrentAttrNumerical && hasTooManyUniqueValues)
				self.isCategoricalOrNumerical[currentAttribute] = 'manyUniques';

			self.numberOfUniqueValues[currentAttribute] = numberOfUniqueValues;
		}
	},
	getMetadataAndTransformNumericalData: function() {
		const self = this;
		const attributeList = self.data.columns;
		let metadata = {};

		for (let i = 0; i < attributeList.length; i++) {
			let currentAttribute = attributeList[i];
			let isCurrentAttrNumerical = self.isCategoricalOrNumerical[currentAttribute] == 'numerical';
			
			// get range and transform for numerical
			if (isCurrentAttrNumerical) {
				let allNumericalValues = [];
				let minValue = null, maxValue = null;
				let approxBinNumber = (self.numberOfUniqueValues[currentAttribute] > 10) ? 10 : self.numberOfUniqueValues[currentAttribute];
				let middleIndex = null;
				let approxMedian = null;

				// loop
				self.forEachNonMissingValue(currentAttribute, function(currentValue, rowIndex) {
					currentValue = +currentValue;
					self.data[rowIndex][currentAttribute] = currentValue;
					allNumericalValues.push(currentValue);
				});

				// determine min, max and median
				Helpers.sortNumbers(allNumericalValues);
				minValue = allNumericalValues[0];
				maxValue = allNumericalValues[allNumericalValues.length - 1];
				middleIndex = Math.floor(allNumericalValues.length / 2);
				approxMedian = allNumericalValues[middleIndex];

				// store
				metadata[currentAttribute] = { 
					minValue: minValue,
					maxValue: maxValue,
					approxMedian: approxMedian,
					approxBinNumber: approxBinNumber // for drawing density map
				};
			}

			// get unique values for categorical
			if (!isCurrentAttrNumerical) {
				let allUniqueValues = {}; // use objects to make it more efficient

				// loop
				self.forEachNonMissingValue(currentAttribute, function(currentValue) {
					allUniqueValues[currentValue] = null;
				});

				// store
				metadata[currentAttribute] = { 
					uniqueValues: Object.keys(allUniqueValues)
				};
			}
		}

		self.metadata = metadata;
	},
	createVocabList: function() {
		const self = this;
		const attributeList = self.data.columns;
		const vocabList = [];

		// add attribute names
		for (let i = 0; i < attributeList.length; i++) {
			let currentAttribute = attributeList[i];
			let processedAttributeName = trimWhiteSpace(currentAttribute);
				
			processedAttributeName = removeNonAlphaNumeric(processedAttributeName);
			processedAttributeName = processedAttributeName.toLowerCase();
			vocabList.push({
				lowerCase: processedAttributeName,
				original: currentAttribute
			});
		}

		// add categories
		for (let i = 0; i < attributeList.length; i++) {
			let currentAttribute = attributeList[i];
			let isCurrentAttrNumerical = self.isCategoricalOrNumerical[currentAttribute] == 'numerical';

			if (!isCurrentAttrNumerical) {
				let allUniqueValues = self.metadata[currentAttribute].uniqueValues;

				for (let j = 0; j < allUniqueValues.length; j++) {
					let processedCategoryName = trimWhiteSpace(allUniqueValues[j]);
					
					processedCategoryName = removeNonAlphaNumeric(processedCategoryName);
					processedCategoryName = processedCategoryName.toLowerCase();
					vocabList.push({
						lowerCase: processedCategoryName,
						original: allUniqueValues[j]
					});
				}
			}
		}

		self.vocabList = vocabList;

		function trimWhiteSpace(x) {
		    return x.replace(/^\s+|\s+$/gm,'');
		}

		function removeNonAlphaNumeric(x) {
			return x.replace(/[^0-9a-z\s]/gi, ' ');
		}
	}
}