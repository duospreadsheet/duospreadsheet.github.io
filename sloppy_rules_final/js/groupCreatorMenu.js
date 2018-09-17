const GroupCreatorMenu = {
	showMinimizedCategorical: function(fadeIn = true) {
		GroupCreatorCategoricalMenu.show(fadeIn);
		GroupCreatorCategoricalMenu.AttributeNameList.display(scrollTop = 0);
		GroupCreatorCategoricalMenu.AttributeNameList.installClick();
		GroupCreatorCategoricalMenu.AttributeValueList.hide();
	},
	showCategorical: function(attributeList, selectedAttribute, categoryList, selectedCategory) {
		GroupCreatorCategoricalMenu.show(fadeIn = false);
		GroupCreatorCategoricalMenu.AttributeNameList.display(scrollTop = 0, attributeList);
		GroupCreatorCategoricalMenu.AttributeNameList.installClick();
		GroupCreatorCategoricalMenu.AttributeNameList.highlight(selectedAttribute);
		GroupCreatorCategoricalMenu.AttributeNameList.scrollTo(selectedAttribute);

		GroupCreatorCategoricalMenu.AttributeValueList.display(scrollTop = 0, categoryList, fadeIn = false);
		GroupCreatorCategoricalMenu.AttributeValueList.installClick();
		GroupCreatorCategoricalMenu.AttributeValueList.changeTitle(selectedAttribute);
		if (selectedCategory != null) {
			GroupCreatorCategoricalMenu.AttributeValueList.highlight(selectedCategory);
			GroupCreatorCategoricalMenu.AttributeValueList.scrollTo(selectedCategory);
		}
	},
	showNumerical: function(attributeList, selectedAttribute, lowerValue, upperValue) {
		let minValue = Database.metadata[selectedAttribute].minValue;
		let maxValue = Database.metadata[selectedAttribute].maxValue;
		let numberOfDecimals = Helpers.getNumberOfDecimals(selectedAttribute);
		let step = 1 / Math.pow(10, numberOfDecimals);
		let lowerHandleValue = minValue;
		let upperHandleValue = maxValue;
		let rangeSpecified = !((lowerValue === null) && (upperValue === null));

		if (lowerValue !== null && upperValue !== null) {
			lowerHandleValue = lowerValue;
			upperHandleValue = upperValue;
		}

		GroupCreatorNumericalMenu.show(fadeIn = false);
		GroupCreatorNumericalMenu.AttributeNameList.display(scrollTop = 0, attributeList);
		GroupCreatorNumericalMenu.AttributeNameList.installClick();
		GroupCreatorNumericalMenu.AttributeNameList.highlight(selectedAttribute);
		GroupCreatorNumericalMenu.AttributeNameList.scrollTo(selectedAttribute);

		GroupCreatorNumericalMenu.Slider.show(fadeIn = false);
		GroupCreatorNumericalMenu.Slider.updateMinMax(minValue, maxValue);
		GroupCreatorNumericalMenu.Slider.updateStep(step);
		GroupCreatorNumericalMenu.Slider.updateValues([ lowerHandleValue, upperHandleValue ]);
		GroupCreatorNumericalMenu.Slider.updateHandles(rangeSpecified);
		GroupCreatorNumericalMenu.Slider.updateMinMaxText();
		GroupCreatorNumericalMenu.Slider.changeTitle(selectedAttribute);

		GroupCreatorNumericalMenu.Slider.clearDensityPlot();
		GroupCreatorNumericalMenu.Slider.generateDensityPlotData(selectedAttribute);
		GroupCreatorNumericalMenu.Slider.drawDensityPlot(selectedAttribute);
	},
	showAttribute: function(fadeIn = true, attributeList = null, selectedAttribute = null) {
		GroupCreatorAttributeMenu.show(fadeIn);
		GroupCreatorAttributeMenu.AttributeNameList.display(scrollTop = 0, attributeList);
		GroupCreatorAttributeMenu.AttributeNameList.installClick();

		if (selectedAttribute != null) {
			GroupCreatorAttributeMenu.AttributeNameList.highlight(selectedAttribute);
			GroupCreatorAttributeMenu.AttributeNameList.scrollTo(selectedAttribute);
		}
	},
	showMenuBasedOnRule: function(selectedRule) {
		const self = this;
		let shelfType = $('#group-creator').attr('shelf-type');
		let isSelectedRuleEmpty = (selectedRule == '');
		let sortedAttributeNames = null, mostSimilarAttribute = null, attributeValueObject = null;
		let isMostSimilarAttributeNumerical = null;

		if (shelfType == 'top' || shelfType == 'bottom' || shelfType == 'base' || shelfType == 'inclusion' || shelfType == 'exclusion') {
			[ sortedAttributeNames, mostSimilarAttribute, attributeValueObject ] = GroupCreatorInputBox.extractInformationFromRule(selectedRule);
			isMostSimilarAttributeNumerical = Database.isCategoricalOrNumerical[mostSimilarAttribute] == 'numerical';

			if (!isSelectedRuleEmpty && isMostSimilarAttributeNumerical) {
				let attributeList = sortedAttributeNames;
				let selectedAttribute = mostSimilarAttribute;
				let lowerValue = attributeValueObject.lowerValue;
				let upperValue = attributeValueObject.upperValue;
				self.showNumerical(attributeList, selectedAttribute, lowerValue, upperValue);
			}
			if (!isSelectedRuleEmpty && !isMostSimilarAttributeNumerical) {
				let attributeList = sortedAttributeNames;
				let selectedAttribute = mostSimilarAttribute;
				let categoryList = attributeValueObject.sortedCategories;
				let selectedCategory = attributeValueObject.mostSimilarCategory;
				self.showCategorical(attributeList, selectedAttribute, categoryList, selectedCategory);
			}
			if (isSelectedRuleEmpty)
				self.showMinimizedCategorical(fadeIn = false);
		}

		if (shelfType == 'attribute') {
			[ sortedAttributeNames, mostSimilarAttribute ] = GroupCreatorInputBox.extractInformationFromRule(selectedRule, isGroupShelf = false);
			isMostSimilarAttributeNumerical = Database.isCategoricalOrNumerical[mostSimilarAttribute] == 'numerical';

			if (!isSelectedRuleEmpty) {
				let attributeList = sortedAttributeNames;
				let selectedAttribute = mostSimilarAttribute;
				self.showAttribute(fadeIn = false, attributeList, selectedAttribute);
			}
			if (isSelectedRuleEmpty) // e.g., entering a new rule
				self.showMinimizedCategorical(fadeIn = false);
		}
	}
}