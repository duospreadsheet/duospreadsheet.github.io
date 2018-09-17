const GroupCreatorHelpers = {
	getAttributeNameListHTML: function(attributeNameList) {
		let attributeNameListHTML = '';

		for (let i = 0; i < attributeNameList.length; i++)
			attributeNameListHTML += '<div class="attribute-name" attribute-name="' + attributeNameList[i] + '">' + attributeNameList[i] + '</div>';

		return attributeNameListHTML;
	},
	seperateAttrNameFromNonAttrName: function(lowerCaseRule) {
		let attributeNameInRule = lowerCaseRule; // if things went wrong, return original
		let ruleWithoutAttrName = lowerCaseRule; // if things went wrong, return original
		let seperatedAttrFromValue = false;

		let indexOfLessThanOrEqualTo = lowerCaseRule.indexOf('<=');
		let indexOfGreaterThanOrEqualTo = lowerCaseRule.indexOf('>=');
		let firstIndexOfLessThan = lowerCaseRule.indexOf('<');
		let lastIndexOfLessThan = lowerCaseRule.lastIndexOf('<');
		let firstIndexOfGreaterThan = lowerCaseRule.indexOf('>');
		let lastIndexOfGreaterThan = lowerCaseRule.lastIndexOf('>');
		let indexOfEqual = lowerCaseRule.indexOf('=');

		let indexOfIs = lowerCaseRule.indexOf(' is '); // add space to prevent bugs
		let indexOfFrom = lowerCaseRule.indexOf(' from ');
		let indexOfBetween = lowerCaseRule.indexOf(' between ');
		let indexOfLess = lowerCaseRule.indexOf(' less');
		let indexOfFew = lowerCaseRule.indexOf(' few');
		let indexOfLow = lowerCaseRule.indexOf(' low');
		let indexOfMore = lowerCaseRule.indexOf(' more');
		let indexOfGreat = lowerCaseRule.indexOf(' great');
		let indexOfHigh = lowerCaseRule.indexOf(' high');

		// check from higher priority to lower priority
		if (firstIndexOfLessThan != lastIndexOfLessThan && indexOfLessThanOrEqualTo == -1) { // < <
			attributeNameInRule = lowerCaseRule.substring(firstIndexOfLessThan + 1, lastIndexOfLessThan).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(0, firstIndexOfLessThan + 1) + ' ' + lowerCaseRule.substring(lastIndexOfLessThan);
			seperatedAttrFromValue = true;
		}
		else if (firstIndexOfLessThan != lastIndexOfLessThan && indexOfLessThanOrEqualTo == firstIndexOfLessThan) { // <= <
			attributeNameInRule = lowerCaseRule.substring(firstIndexOfLessThan + 2, lastIndexOfLessThan).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(0, firstIndexOfLessThan + 2) + ' ' + lowerCaseRule.substring(lastIndexOfLessThan);
			seperatedAttrFromValue = true;
		}
		else if (firstIndexOfLessThan != lastIndexOfLessThan && indexOfLessThanOrEqualTo == lastIndexOfLessThan) { // < <=
			attributeNameInRule = lowerCaseRule.substring(firstIndexOfLessThan + 1, lastIndexOfLessThan).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(0, firstIndexOfLessThan + 1) + ' ' + lowerCaseRule.substring(lastIndexOfLessThan);
			seperatedAttrFromValue = true;
		}
		else if (firstIndexOfGreaterThan != lastIndexOfGreaterThan && indexOfGreaterThanOrEqualTo == -1) { // > >
			attributeNameInRule = lowerCaseRule.substring(firstIndexOfGreaterThan + 1, lastIndexOfGreaterThan).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(0, firstIndexOfGreaterThan + 1) + ' ' + lowerCaseRule.substring(lastIndexOfGreaterThan);
			seperatedAttrFromValue = true;
		}
		else if (firstIndexOfGreaterThan != lastIndexOfGreaterThan && indexOfGreaterThanOrEqualTo == firstIndexOfGreaterThan) { // >= >
			attributeNameInRule = lowerCaseRule.substring(firstIndexOfGreaterThan + 2, lastIndexOfGreaterThan).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(0, firstIndexOfGreaterThan + 2) + ' ' + lowerCaseRule.substring(lastIndexOfGreaterThan);
			seperatedAttrFromValue = true;
		}
		else if (firstIndexOfGreaterThan != lastIndexOfGreaterThan && indexOfGreaterThanOrEqualTo == lastIndexOfGreaterThan) { // > >=
			attributeNameInRule = lowerCaseRule.substring(firstIndexOfGreaterThan + 1, lastIndexOfGreaterThan).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(0, firstIndexOfGreaterThan + 1) + ' ' + lowerCaseRule.substring(lastIndexOfGreaterThan);
			seperatedAttrFromValue = true;
		}
		else if (firstIndexOfLessThan != -1) { // < or <=
			attributeNameInRule = lowerCaseRule.substring(0, firstIndexOfLessThan).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(firstIndexOfLessThan);
			seperatedAttrFromValue = true;
		}
		else if (firstIndexOfGreaterThan != -1) { // > or >=
			attributeNameInRule = lowerCaseRule.substring(0, firstIndexOfGreaterThan).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(firstIndexOfGreaterThan);
			seperatedAttrFromValue = true;
		}
		else if (indexOfIs != -1) { // is
			attributeNameInRule = lowerCaseRule.substring(0, indexOfIs).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(indexOfIs);
			seperatedAttrFromValue = true;
		}
		else if (indexOfEqual != -1) { // =
			attributeNameInRule = lowerCaseRule.substring(0, indexOfEqual).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(indexOfEqual);
			seperatedAttrFromValue = true;
		}
		else if (indexOfFrom != -1) { // between
			attributeNameInRule = lowerCaseRule.substring(0, indexOfFrom).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(indexOfFrom);
			seperatedAttrFromValue = true;
		}
		else if (indexOfBetween != -1) { // from
			attributeNameInRule = lowerCaseRule.substring(0, indexOfBetween).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(indexOfBetween);
			seperatedAttrFromValue = true;
		}
		else if (indexOfLow != -1) { // low
			attributeNameInRule = lowerCaseRule.substring(0, indexOfLow).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(indexOfLow);
			seperatedAttrFromValue = true;
		}
		else if (indexOfLess != -1) { // less
			attributeNameInRule = lowerCaseRule.substring(0, indexOfLess).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(indexOfLess);
			seperatedAttrFromValue = true;
		}
		else if (indexOfFew != -1) { // few
			attributeNameInRule = lowerCaseRule.substring(0, indexOfFew).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(indexOfFew);
			seperatedAttrFromValue = true;
		}
		else if (indexOfHigh != -1) { // high
			attributeNameInRule = lowerCaseRule.substring(0, indexOfHigh).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(indexOfHigh);
			seperatedAttrFromValue = true;
		}
		else if (indexOfGreat != -1) { // great
			attributeNameInRule = lowerCaseRule.substring(0, indexOfGreat).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(indexOfGreat);
			seperatedAttrFromValue = true;
		}
		else if (indexOfMore != -1) { // more
			attributeNameInRule = lowerCaseRule.substring(0, indexOfMore).trim();
			ruleWithoutAttrName = lowerCaseRule.substring(indexOfMore);
			seperatedAttrFromValue = true;
		}
		else { // fail to find keywords
			let splittedRule = lowerCaseRule.trim().split(' ');
			let currentToken = '';
			let attributeNameList = Object.keys(Database.metadata);

			for (let i = 0; i < splittedRule.length; i++) {
				currentToken += (i == 0) ? splittedRule[i] : ' ' + splittedRule[i];

				for (let j = 0; j < attributeNameList.length; j++) {
					let lowerCaseCurrentAttribute = attributeNameList[j].toLowerCase();
					let currentTokenIsPartOfAnAttr = (lowerCaseCurrentAttribute.indexOf(currentToken) != -1);

					if (currentTokenIsPartOfAnAttr) {
						let ruleWithoutMatchedToken = '';

						for (let k = i + 1; k < splittedRule.length; k++)
							ruleWithoutMatchedToken += (k != splittedRule.length - 1) ? (splittedRule[k] + ' ') : splittedRule[k];

						attributeNameInRule = currentToken;
						ruleWithoutAttrName = ruleWithoutMatchedToken;
						seperatedAttrFromValue = true;
						break;
					}
				}
			}
		}

		return [ attributeNameInRule, ruleWithoutAttrName, seperatedAttrFromValue ];
	},
	computeSimilarAttributeList: function(attributeNameInRule) {
		const self = this;
		let attributeNameList = Object.keys(Database.metadata);
		let sortedAttributeNameObjects = [];
		let sortedAttributeNames = [];

		// compute edit distance
		for (let i = 0; i < attributeNameList.length; i++) {
			let currentAttributeName = attributeNameList[i];
			let lowerCaseCurrentAttributeName = attributeNameList[i].toLowerCase();
			let wordDistance = self.computeWordDistance(lowerCaseCurrentAttributeName, attributeNameInRule);

			sortedAttributeNameObjects.push({
				attributeName: currentAttributeName,
				distanceFromRule: wordDistance
			});
		}

		// sort attribute names to find the most similar
		sortedAttributeNameObjects.sort(compare);
		for (let i = 0; i < sortedAttributeNameObjects.length; i++)
			sortedAttributeNames.push(sortedAttributeNameObjects[i].attributeName);

		return sortedAttributeNames;

		function compare(a, b) {
			if (a.distanceFromRule < b.distanceFromRule)
		    	return -1;
		  	if (a.distanceFromRule > b.distanceFromRule)
		    	return 1;
		  	return 0;
		}
	},
	extractAttributeValueObject: function(ruleWithoutAttrName, mostSimilarAttribute) {
		const self = this;
		let isMostSimilarAttributeNumerical = Database.isCategoricalOrNumerical[mostSimilarAttribute] == 'numerical';
		let ruleWithoutAttrNameLength = ruleWithoutAttrName.length;
		let attributeValueObject = isMostSimilarAttributeNumerical ? { lowerValue: null, upperValue: null } : { sortedCategories: null, mostSimilarCategory: null };

		if (!isMostSimilarAttributeNumerical) {
			let attributeValueList = Database.metadata[mostSimilarAttribute].uniqueValues;
			let attributeValueInRule = '';
			let sortedAttributeValueObjects = [];
			let sortedAttributeValues = [];

			// extract attribute value in rule
			if (ruleWithoutAttrName.indexOf('=') != -1) {
				let indexOfToken = ruleWithoutAttrName.indexOf('=');
				attributeValueInRule = ruleWithoutAttrName.substring(indexOfToken + 1, ruleWithoutAttrNameLength).trim();
			}
			else if (ruleWithoutAttrName.indexOf('is') != -1) {
				let indexOfToken = ruleWithoutAttrName.indexOf('is');
				attributeValueInRule = ruleWithoutAttrName.substring(indexOfToken + 2, ruleWithoutAttrNameLength).trim();
			}
			else {
				attributeValueInRule = ruleWithoutAttrName;
			}

			// handle different cases of extractions
			if (attributeValueInRule == '') {
				attributeValueObject.sortedCategories = attributeValueList;
				attributeValueObject.mostSimilarCategory = null;
			}

			if (attributeValueInRule != '') {
				// compute edit distance
				for (let i = 0; i < attributeValueList.length; i++) {
					let currentAttributeValue = attributeValueList[i];
					let lowerCaseCurrentAttributeValue = attributeValueList[i].toLowerCase();
					let wordDistance = self.computeWordDistance(lowerCaseCurrentAttributeValue, attributeValueInRule);

					sortedAttributeValueObjects.push({
						attributeValue: currentAttributeValue,
						distanceFromRule: wordDistance
					});
				}

				// sort attribute values to find the most similar
				sortedAttributeValueObjects.sort(compare);
				for (let i = 0; i < sortedAttributeValueObjects.length; i++)
					sortedAttributeValues.push(sortedAttributeValueObjects[i].attributeValue);

				// store results
				attributeValueObject.sortedCategories = sortedAttributeValues;
				attributeValueObject.mostSimilarCategory = sortedAttributeValues[0];
			}			
		}

		if (isMostSimilarAttributeNumerical) {
			let numbersInRule = [];
			let ruleWithoutComma = ruleWithoutAttrName.replace(/,/g, '');
			let ruleWithNumbersOnly = ruleWithoutComma.replace(/[^0-9.]/g, ' ');
			let tokensInRule = ruleWithNumbersOnly.split(' ');
			let minValue = Database.metadata[mostSimilarAttribute].minValue;
			let maxValue = Database.metadata[mostSimilarAttribute].maxValue;

			// find numbers
			for (let i = 0; i < tokensInRule.length; i++) {
				let currentToken = tokensInRule[i];
				let isCurrentTokenANumber = !isNaN(currentToken);
				let isCurrentTokenNull = (currentToken == '')

				if (isCurrentTokenANumber && !isCurrentTokenNull)
					numbersInRule.push(parseFloat(currentToken));
			}

			// get upper and lower values
			if (numbersInRule.length >= 2) { // between
				attributeValueObject.lowerValue = d3.min(numbersInRule);
				attributeValueObject.upperValue = d3.max(numbersInRule);
			}
			else if (numbersInRule.length == 1 &&
					(ruleWithoutAttrName.indexOf('low') != -1 || ruleWithoutAttrName.indexOf('less') != -1 ||
					 ruleWithoutAttrName.indexOf('few') != -1 || ruleWithoutAttrName.indexOf('<') != -1)) {
				attributeValueObject.lowerValue = minValue;
				attributeValueObject.upperValue = numbersInRule[0];
			}
			else if (numbersInRule.length == 1 &&
				    (ruleWithoutAttrName.indexOf('high') != -1 || ruleWithoutAttrName.indexOf('great') != -1 ||
				     ruleWithoutAttrName.indexOf('more') != -1 || ruleWithoutAttrName.indexOf('>') != -1)) {
				attributeValueObject.lowerValue = numbersInRule[0];
				attributeValueObject.upperValue = maxValue;
			}
			else if (numbersInRule.length == 1) {
				attributeValueObject.lowerValue = numbersInRule[0];
				attributeValueObject.upperValue = numbersInRule[0];
			}
		}

		return attributeValueObject;

		function compare(a, b) {
			if (a.distanceFromRule < b.distanceFromRule)
		    	return -1;
		  	if (a.distanceFromRule > b.distanceFromRule)
		    	return 1;
		  	return 0;
		}
	},
	computeSimilarAttrNamesAndValues: function(lowerCaseRule) {
		const self = this;
		let lowerCaseRuleWithoutNumbers = GroupCreatorHelpers.removeNumbers(lowerCaseRule);
		let attributeNameList = Object.keys(Database.metadata);
		let sortedAttributeNameObjects = [], sortedAttributeValueObjectLists = {};
		let overallMinWordDistance = Infinity, attributeValueMinWordDistance = Infinity;
		let typeOfStringWithMinWordDistance = null;
		let mostSimilarMatchIsAttrName = false, sortedAttributeNames = [], sortedMostSimilarValueList = [], mostSimilarValueCorrAttr = null;

		// compute edit distance for attribute names
		for (let i = 0; i < attributeNameList.length; i++) {
			let currentAttributeName = attributeNameList[i];
			let lowerCaseCurrentAttributeName = attributeNameList[i].toLowerCase();
			let wordDistance = self.computeWordDistance(lowerCaseCurrentAttributeName, lowerCaseRuleWithoutNumbers);

			sortedAttributeNameObjects.push({
				attributeName: currentAttributeName,
				distanceFromRule: wordDistance
			});
			if (wordDistance < overallMinWordDistance) {
				typeOfStringWithMinWordDistance = 'attributeName';
				overallMinWordDistance = wordDistance;
			}
		}

		// compute edit distance for attribute values
		for (let attributeName in Database.metadata) {
			sortedAttributeValueObjectLists[attributeName] = [];

			if ('uniqueValues' in Database.metadata[attributeName]) {
				let currentAttributeValueList = Database.metadata[attributeName].uniqueValues;

				for (let i = 0; i < currentAttributeValueList.length; i++) {
					let currentAttributeValue = currentAttributeValueList[i];
					let lowerCaseCurrentAttributeValue = currentAttributeValueList[i].toLowerCase();
					let wordDistance = self.computeWordDistance(lowerCaseCurrentAttributeValue, lowerCaseRuleWithoutNumbers);

					sortedAttributeValueObjectLists[attributeName].push({
						attributeValue: currentAttributeValue,
						distanceFromRule: wordDistance
					});
					if (wordDistance < overallMinWordDistance) {
						typeOfStringWithMinWordDistance = 'attributeValue';
						overallMinWordDistance = wordDistance;
					}
					if (wordDistance < attributeValueMinWordDistance) {
						mostSimilarValueCorrAttr = attributeName;
						attributeValueMinWordDistance = wordDistance;
					}
				}
			}
		}

		// compute return information
		if (typeOfStringWithMinWordDistance == 'attributeName')
			mostSimilarMatchIsAttrName = true;

		if (mostSimilarMatchIsAttrName) {
			sortedAttributeNameObjects.sort(compare);
			for (let i = 0; i < sortedAttributeNameObjects.length; i++)
				sortedAttributeNames.push(sortedAttributeNameObjects[i].attributeName);
		}
		if (!mostSimilarMatchIsAttrName) {
			sortedAttributeValueObjectLists[mostSimilarValueCorrAttr].sort(compare);
			for (let i = 0; i < sortedAttributeValueObjectLists[mostSimilarValueCorrAttr].length; i++)
				sortedMostSimilarValueList.push(sortedAttributeValueObjectLists[mostSimilarValueCorrAttr][i].attributeValue);
		}

		return [ mostSimilarMatchIsAttrName, sortedAttributeNames, sortedMostSimilarValueList, mostSimilarValueCorrAttr ];

		function compare(a, b) {
			if (a.distanceFromRule < b.distanceFromRule)
		    	return -1;
		  	if (a.distanceFromRule > b.distanceFromRule)
		    	return 1;
		  	return 0;
		}
	},

	// helpers

	computeWordDistance: function(attributeNameOrValue, input) {
		let attributeNameOrValueLength = attributeNameOrValue.length;
		let inputLength = input.length;
		let userInputIsStart = attributeNameOrValue.indexOf(input) == 0;
		let wordDistance = null;

		if (attributeNameOrValueLength > inputLength) {
			if (userInputIsStart)
				wordDistance = editDistance(attributeNameOrValue, input) / attributeNameOrValueLength - 1;
			else if (!userInputIsStart)
				wordDistance = editDistance(attributeNameOrValue, input) / attributeNameOrValueLength;
		}
		else if (attributeNameOrValueLength <= inputLength) {
			if (userInputIsStart)
				wordDistance = editDistance(attributeNameOrValue, input) / inputLength - 1;
			else if (!userInputIsStart)
				wordDistance = editDistance(attributeNameOrValue, input) / inputLength;
		}

		return wordDistance;
	},
	removeNumbers: function(lowerCaseRule) {
		let ruleWithoutComma = lowerCaseRule.replace(/,/g, '');
		let splittedRule = ruleWithoutComma.split(' ');
		let tokensWithoutNumbers = [];
		let ruleWithoutNumbers = '';

		for (let i = 0; i < splittedRule.length; i++) {
			let currentToken = splittedRule[i];
			let currentTokenIsNotANumber = isNaN(currentToken);

			if (currentTokenIsNotANumber)
				tokensWithoutNumbers.push(currentToken.trim());
		}

		for (let i = 0; i < tokensWithoutNumbers.length; i++)
			ruleWithoutNumbers += (i != tokensWithoutNumbers.length - 1)
								? tokensWithoutNumbers[i] + ' '
								: tokensWithoutNumbers[i];

		return ruleWithoutNumbers;
	},
	extractNumbers: function(lowerCaseRule, mostSimilarAttribute) {
		let ruleWithoutComma = lowerCaseRule.replace(/,/g, '');
		let ruleWithNumbersOnly = ruleWithoutComma.replace(/[^0-9.]/g, ' ');
		let tokensInRule = ruleWithNumbersOnly.split(' ');
		let numbersInRule = [];
		let minValue = Database.metadata[mostSimilarAttribute].minValue;
		let maxValue = Database.metadata[mostSimilarAttribute].maxValue;
		let lowerValue = null, upperValue = null;

		// find numbers
		for (let i = 0; i < tokensInRule.length; i++) {
			let currentToken = tokensInRule[i];
			let isCurrentTokenANumber = !isNaN(currentToken);
			let isCurrentTokenNull = (currentToken == '')

			if (isCurrentTokenANumber && !isCurrentTokenNull)
				numbersInRule.push(parseFloat(currentToken));
		}

		// get upper and lower values
		if (numbersInRule.length >= 2) { // between
			lowerValue = d3.min(numbersInRule);
			upperValue = d3.max(numbersInRule);
		}
		else if (numbersInRule.length == 1 &&
				(lowerCaseRule.indexOf('low') != -1 || lowerCaseRule.indexOf('less') != -1 ||
				 lowerCaseRule.indexOf('few') != -1 || lowerCaseRule.indexOf('<') != -1)) {
			lowerValue = minValue;
			upperValue = numbersInRule[0];
		}
		else if (numbersInRule.length == 1 &&
			    (lowerCaseRule.indexOf('high') != -1 || lowerCaseRule.indexOf('great') != -1 ||
			     lowerCaseRule.indexOf('more') != -1 || lowerCaseRule.indexOf('>') != -1)) {
			lowerValue = numbersInRule[0];
			upperValue = maxValue;
		}
		else if (numbersInRule.length == 1) {
			lowerValue = numbersInRule[0];
			upperValue = numbersInRule[0];
		}

		return { lowerValue: lowerValue, upperValue: upperValue };
	}
}