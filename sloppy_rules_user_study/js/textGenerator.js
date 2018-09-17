const TextGenerator = {
	generateCompareOneAndOneQuestionHTML: function(topShelfGroup, bottomShelfGroup) {
		const self = this;
		let topGroupNameHTML = '<div class="top-group-name">' + self.generateGroupNameHTML(topShelfGroup) + '</div>';
		let bottomGroupNameHTML = '<div class="bottom-group-name">' + self.generateGroupNameHTML(bottomShelfGroup) + '</div>';

		return topGroupNameHTML + bottomGroupNameHTML;
	},
	generateCompareAttrOfOneAndOneQuestionHTML: function(topShelfGroup, bottomShelfGroup, attributeList) {
		const self = this;
		let topGroupNameHTML = '<div class="top-group-name">' + self.generateGroupNameHTML(topShelfGroup) + '</div>';
		let bottomGroupNameHTML = '<div class="bottom-group-name">' + self.generateGroupNameHTML(bottomShelfGroup) + '</div>';
		let attributeListHTML = '<div class="specified-attributes">' + self.generateAttributeListString(attributeList) + '</div>';

		return topGroupNameHTML + bottomGroupNameHTML + attributeListHTML;
	},
	generateCompareOneAndManyQuestionHTML: function(topShelfGroup, bottomShelfGroups) {
		const self = this;
		let topGroupNameHTML = '<div class="top-group-name">' + self.generateGroupNameHTML(topShelfGroup) + '</div>';
		let questionHTML = topGroupNameHTML;

		for (let i = 0; i < bottomShelfGroups.length; i++)
			questionHTML += '<div class="bottom-group-name">' + self.generateGroupNameHTML(bottomShelfGroups[i]) + '</div>';

		return questionHTML;
	},
	generateCompareAttrOfOneAndManyQuestionHTML: function(topShelfGroup, bottomShelfGroups, attributeList) {
		const self = this;
		let topGroupNameHTML = '<div class="top-group-name">' + self.generateGroupNameHTML(topShelfGroup) + '</div>';
		let attributeListHTML = '<div class="specified-attributes">' + self.generateAttributeListString(attributeList) + '</div>';
		let questionHTML = topGroupNameHTML;

		for (let i = 0; i < bottomShelfGroups.length; i++)
			questionHTML += '<div class="bottom-group-name">' + self.generateGroupNameHTML(bottomShelfGroups[i]) + '</div>';
		questionHTML += attributeListHTML;

		return questionHTML;
	},
	generateAttributeListString: function(attributeList) {
		let attributeListString = '';

		for (let i = 0; i < attributeList.length; i++) {
			let currentAttributeName = attributeList[i];
			let isLastName = (i == attributeList.length - 1);

			if (!isLastName)
				attributeListString += currentAttributeName + '<br/>';
			if (isLastName)
				attributeListString += currentAttributeName;
		}

		return attributeListString;
	},
	generateGroupNameHTML: function(shelfGroup, capitalizeFirstLetter = false) {
		const self = this;
		let groupNameHTML = '';
		let needSpecialName = (shelfGroup.name == shelfGroup.ruleBasedName);

		if (needSpecialName) {
			let baseRules = shelfGroup.baseRules;
			let inclusionRules = shelfGroup.inclusionRules;
			let exclusionRules = shelfGroup.exclusionRules;
			let specialName = '';

			for (let i = 0; i < baseRules.length; i++)  {
				let currentRule = baseRules[i];
				let currentRuleHTML = self.generateRuleHTML(currentRule);

				if (i != baseRules.length - 1)
					specialName += currentRuleHTML + '<br/><span class="operator-between-rule">AND</span>';
				if (i == baseRules.length - 1)
					specialName += currentRuleHTML;
			}
			for (let i = 0; i < inclusionRules.length; i++) {
				let currentRule = inclusionRules[i];
				let currentRuleHTML = self.generateRuleHTML(currentRule);

				specialName += '<br/><span class="operator-between-rule">+</span>' + currentRuleHTML;
			}
			for (let i = 0; i < exclusionRules.length; i++) {
				let currentRule = exclusionRules[i];
				let currentRuleHTML = self.generateRuleHTML(currentRule);

				specialName += '<br/><span class="operator-between-rule minus">-</span>' + currentRuleHTML;
			}
			if (baseRules.length == 0 && inclusionRules.length == 0 && exclusionRules.length == 0)
				specialName += '<span class="user-defined-name">No Rules</span>';
				
			groupNameHTML = specialName;
		}

		if (!needSpecialName) {
			let userDefinedName = '';

			if (capitalizeFirstLetter)
				userDefinedName = shelfGroup.name.charAt(0).toUpperCase() + shelfGroup.name.substr(1);
			if (!capitalizeFirstLetter)
				userDefinedName = shelfGroup.name;

			groupNameHTML += '<span class="user-defined-name">' + userDefinedName + '</span>';
		}

		return groupNameHTML;
	},
	generateRuleHTML: function(rule) {
		let attributeName = Helpers.parseAttributeName(rule);
		let attributeValueObject = Helpers.parseAttributeValue(rule);
		let ruleHTML = '';

		if ('category' in attributeValueObject) {
			ruleHTML += '<span class="attribute-name">' + attributeName + '</span>';
			ruleHTML += '<span class="operator-in-rule">=</span>';
			ruleHTML += '<span class="attribute-value">' + attributeValueObject.category + '</span>';
		}
		if ('lowerValue' in attributeValueObject) {
			let minValue = Database.metadata[attributeName].minValue;
			let maxValue = Database.metadata[attributeName].maxValue;
			let isLowerValueMinValue = (minValue == attributeValueObject.lowerValue);
			let isUpperValueMaxValue = (maxValue == attributeValueObject.upperValue);

			if (isLowerValueMinValue) {
				ruleHTML += '<span class="attribute-name">' + attributeName + '</span>';
				ruleHTML += '<span class="operator-in-rule"><=</span>';
				ruleHTML += '<span class="attribute-value">' + attributeValueObject.upperValue + '</span>';
			}
			if (isUpperValueMaxValue) {
				ruleHTML += '<span class="attribute-name">' + attributeName + '</span>';
				ruleHTML += '<span class="operator-in-rule">>=</span>';
				ruleHTML += '<span class="attribute-value">' + attributeValueObject.lowerValue + '</span>';
			}
			if (!isLowerValueMinValue && !isUpperValueMaxValue) {
				ruleHTML += '<span class="attribute-value">' + attributeValueObject.lowerValue + '</span>';
				ruleHTML += '<span class="operator-in-rule"><=</span>';
				ruleHTML += '<span class="attribute-name">' + attributeName + '</span>';
				ruleHTML += '<span class="operator-in-rule"><=</span>';
				ruleHTML += '<span class="attribute-value">' + attributeValueObject.upperValue + '</span>';
			}
		}

		return '<span class="rule">' + ruleHTML + '</span>';
	},
	generateSimilarDistExp: function(group1NameHTML, group2NameHTML) {
		return group1NameHTML + ' and ' + group2NameHTML + ' have <span class="cause">similar distributions</span>.';
	},
	generateSameCategoryExp: function(group1NameHTML, group2NameHTML, categoryName) {
		return group1NameHTML + ' and ' + group2NameHTML + ' <span class="cause"> both have the value ' + categoryName + '</span>.';
	},
	generateSimilarAvgAndDistExp: function(group1NameHTML, group2NameHTML, classByBhOnly, classByMeanDiffOnly) {
		if (classByBhOnly == 'S' && classByMeanDiffOnly != 'S')
			return group1NameHTML + ' and ' + group2NameHTML + ' have <span class="cause">similar distributions</span>.';
		if (classByBhOnly != 'S' && classByMeanDiffOnly == 'S')
			return group1NameHTML + ' and ' + group2NameHTML + ' have <span class="cause">similar averages</span>.';
		if (classByBhOnly == 'S' && classByMeanDiffOnly == 'S')
			return group1NameHTML + ' and ' + group2NameHTML + ' have <span class="cause">similar averages</span> and <span class="cause">similar distributions</span>.';
	},
	generateSimilarValuesExp: function(group1NameHTML, group2NameHTML) {
		return group1NameHTML + ' and ' + group2NameHTML + ' have <span class="cause">similar values</span>.';
	},
	generateValueIsCloseToAvgExp: function(group1NameHTML, group2NameHTML) {
		return 'The <span class="cause">value</span> of ' + group1NameHTML + ' is <span class="cause">close to the average</span> of ' + group2NameHTML + '.';
	},
	generateDiffCategoriesExp: function(group1NameHTML, group2NameHTML, group1CategoryName, group2CategoryName) {
		return group1NameHTML + ' <span class="cause">has the value ' + group1CategoryName + '</span> while ' + group2NameHTML + ' <span class="cause"> has the value ' + group2CategoryName + '</span>.';
	},
	generateValueIsDiffFromDistExp: function(group1NameHTML, group2NameHTML, group1CategoryName, group2HighProbCategory) {
		if (group2HighProbCategory !== null && group2HighProbCategory.probability == 1)
			return group1NameHTML + ' <span class="cause">has the value ' + group1CategoryName + '</span> while all ' + group2NameHTML + ' <span class="cause">have the value ' + group2HighProbCategory.category + '</span>.';
		if (group2HighProbCategory !== null && group2HighProbCategory.probability != 1)
			return group1NameHTML + ' <span class="cause">has the value ' + group1CategoryName + '</span> while most ' + group2NameHTML + ' <span class="cause">have the value ' + group2HighProbCategory.category + '</span>.';
		if (group2HighProbCategory === null)
			return group1NameHTML + ' <span class="cause">has the value ' + group1CategoryName + '</span> while ' + group2NameHTML + ' <span class="cause"> have values other than ' + group1CategoryName + '</span>.';
	},
	generateDifferentDistributionExp: function(group1NameHTML, group2NameHTML, group1HighProbCategory, group2HighProbCategory) {
		if (group1HighProbCategory !== null && group1HighProbCategory.probability == 1 && group2HighProbCategory !== null && group2HighProbCategory.probability == 1)
			return 'All ' + group1NameHTML + ' <span class="cause">have the value ' + group1HighProbCategory.category + '</span> while all ' + group2NameHTML + ' <span class="cause">have the value ' + group2HighProbCategory.category + '</span>.';
		if (group1HighProbCategory !== null && group1HighProbCategory.probability != 1 && group2HighProbCategory !== null && group2HighProbCategory.probability == 1)
			return 'Most ' + group1NameHTML + ' <span class="cause">have the value ' + group1HighProbCategory.category + '</span> while all ' + group2NameHTML + ' <span class="cause">have the value ' + group2HighProbCategory.category + '</span>.';
		if (group1HighProbCategory !== null && group1HighProbCategory.probability != 1 && group2HighProbCategory !== null && group2HighProbCategory.probability != 1)
			return 'Most ' + group1NameHTML + ' <span class="cause">have the value ' + group1HighProbCategory.category + '</span> while most ' + group2NameHTML + ' <span class="cause">have the value ' + group2HighProbCategory.category + '</span>.';
		if (group1HighProbCategory === null || group2HighProbCategory === null)
			return group1NameHTML + ' and ' + group2NameHTML + ' have <span class="cause">different distributions</span>.';
	},
	generateDiffValuesExp: function(group1NameHTML, group2NameHTML, whichAvgHigher) {
		if (whichAvgHigher == 'group1')
			return group1NameHTML + ' <span class="cause">has a higher value </span> than ' + group2NameHTML + '.';
		if (whichAvgHigher == 'group2')
			return group1NameHTML + ' <span class="cause">has a lower value </span> than ' + group2NameHTML + '.';
	},
	generateValueIsDiffFromAvgExp: function(group1NameHTML, group2NameHTML, whichAvgHigher) {
		if (whichAvgHigher == 'group1')
			return 'The <span class="cause">value</span> of ' + group1NameHTML + ' is <span class="cause">higher than the average</span> of ' + group2NameHTML + '.';
		if (whichAvgHigher == 'group2')
			return 'The <span class="cause">value</span> of ' + group1NameHTML + ' is <span class="cause">lower than the average</span> of ' + group2NameHTML + '.';
	},
	generateDiffAvgAndDistExp: function(group1NameHTML, group2NameHTML, classByMeanDiffOnly, whichAvgHigher) {
		if (classByMeanDiffOnly == 'D' && whichAvgHigher == 'group1')
			return group1NameHTML + ' <span class="cause">have a higher average</span> than ' + group2NameHTML;
		if (classByMeanDiffOnly == 'D' && whichAvgHigher == 'group2')
			return group1NameHTML + ' <span class="cause">have a lower average</span> than ' + group2NameHTML;
		if (classByMeanDiffOnly != 'D')
			return group1NameHTML + ' and ' + group2NameHTML + ' have <span class="cause">different distributions</span> despite similar averages.';
	},
	generateNumberOfSimilarAttrExp: function(group1NameHTML, group2NameHTML, numberOfAttributes) {
		let similarAttributeString = (numberOfAttributes <= 1) ? 'similar attribute' : 'similar attributes';

		return group1NameHTML + ' and ' + group2NameHTML + ' share <span class="similar cause">' + numberOfAttributes + ' ' + similarAttributeString +'</span>. Click to see what they are.';
	},
	generateNumberOfDiffAttrExp: function(group1NameHTML, group2NameHTML, numberOfAttributes) {
		let differentAttributeString = (numberOfAttributes <= 1) ? 'different attribute' : 'different attributes';

		return group1NameHTML + ' and ' + group2NameHTML + ' have <span class="different cause">' + numberOfAttributes + ' ' + differentAttributeString + '</span>. Click to see what they are.';
	}
}