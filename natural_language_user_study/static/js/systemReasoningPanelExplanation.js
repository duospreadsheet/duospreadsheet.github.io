const SystemReasoningPanelExplanation = {
	explanationHTML: '',

	generateForAttr: function(attributeName) {
		const self = this;
		let isNumerical = Database.isCategoricalOrNumerical[attributeName] == 'numerical';
		let isCategorical = Database.isCategoricalOrNumerical[attributeName] != 'numerical';
		let currentAttributeClass = OperatorMediator.getAttributeClass(attributeName);

		let bothAreGroups = OperatorMediator.numberOfObjects.top > 1 && OperatorMediator.numberOfObjects.bottom > 1;
		let topIsObjectBottomIsGroup = OperatorMediator.numberOfObjects.top == 1 && OperatorMediator.numberOfObjects.bottom > 1;
		let bottomIsObjectTopIsGroup = OperatorMediator.numberOfObjects.top > 1 && OperatorMediator.numberOfObjects.bottom == 1;
		let bothAreObjects = OperatorMediator.numberOfObjects.top == 1 && OperatorMediator.numberOfObjects.bottom == 1;

		let topShelfGroup = OperatorMediator.topShelfGroup;
		let bottomShelfGroup = OperatorMediator.bottomShelfGroup;
		let topGroupProbDist = OperatorMediator.probDistPairForEachAttribute[attributeName].top;
		let bottomGroupProbDist = OperatorMediator.probDistPairForEachAttribute[attributeName].bottom;
		let classByBhOnly = OperatorMediator.metadataForEachAttribute[attributeName].classByBhOnly;
		let classByMeanDiffOnly = OperatorMediator.metadataForEachAttribute[attributeName].classByMeanDiffOnly;

		let normalTopGroupNameHTML = '<span class="top-group-name">' + TextGenerator.generateGroupNameHTML(topShelfGroup) + '</span>';
		let capitalizedTopGroupNameHTML = '<span class="top-group-name">' + TextGenerator.generateGroupNameHTML(topShelfGroup, true) + '</span>';
		let normalBottomGroupNameHTML = '<span class="bottom-group-name">' + TextGenerator.generateGroupNameHTML(bottomShelfGroup) + '</span>';
		let capitalizedBottomGroupNameHTML = '<span class="bottom-group-name">' + TextGenerator.generateGroupNameHTML(bottomShelfGroup, true) + '</span>';
		
		if (currentAttributeClass == 'S') {
			if (isCategorical && bothAreObjects) {
				let theUniqueCategory = OperatorMediator.metadataForEachAttribute[attributeName].topGroupUniqueValues[0];
				self.explanationHTML = TextGenerator.generateSameCategoryExp(capitalizedTopGroupNameHTML, normalBottomGroupNameHTML, theUniqueCategory);
			}
			if (isCategorical && (bothAreGroups || topIsObjectBottomIsGroup || bottomIsObjectTopIsGroup))
				self.explanationHTML = TextGenerator.generateSimilarDistExp(capitalizedTopGroupNameHTML, normalBottomGroupNameHTML);
			if (isNumerical && bothAreObjects)
				self.explanationHTML = TextGenerator.generateSimilarValuesExp(capitalizedTopGroupNameHTML, normalBottomGroupNameHTML);
			if (isNumerical && topIsObjectBottomIsGroup)
				self.explanationHTML = TextGenerator.generateValueIsCloseToAvgExp(capitalizedTopGroupNameHTML, normalBottomGroupNameHTML);
			if (isNumerical && bottomIsObjectTopIsGroup)
				self.explanationHTML = TextGenerator.generateValueIsCloseToAvgExp(capitalizedBottomGroupNameHTML, normalTopGroupNameHTML);
			if (isNumerical && bothAreGroups)
				self.explanationHTML = TextGenerator.generateSimilarAvgAndDistExp(capitalizedTopGroupNameHTML, normalBottomGroupNameHTML, classByBhOnly, classByMeanDiffOnly);
		}

		if (currentAttributeClass == 'D') {
			if (isCategorical && bothAreObjects) {
				let topObjectCategory = OperatorMediator.metadataForEachAttribute[attributeName].topGroupUniqueValues[0];
				let bottomObjectCategory = OperatorMediator.metadataForEachAttribute[attributeName].bottomGroupUniqueValues[0];
				self.explanationHTML = TextGenerator.generateDiffCategoriesExp(capitalizedTopGroupNameHTML, normalBottomGroupNameHTML, topObjectCategory, bottomObjectCategory);
			}
			if (isCategorical && topIsObjectBottomIsGroup) {
				let allUniqueValues = OperatorMediator.metadataForEachAttribute[attributeName].uniqueValues;
				let topObjectCategory = OperatorMediator.metadataForEachAttribute[attributeName].topGroupUniqueValues[0];
				let bottomGroupHighProbCategory = self.findHighProbCategory(bottomGroupProbDist, allUniqueValues);
				self.explanationHTML = TextGenerator.generateValueIsDiffFromDistExp(capitalizedTopGroupNameHTML, normalBottomGroupNameHTML, topObjectCategory, bottomGroupHighProbCategory);
			}
			if (isCategorical && bottomIsObjectTopIsGroup) {
				let allUniqueValues = OperatorMediator.metadataForEachAttribute[attributeName].uniqueValues;
				let topGroupHighProbCategory = self.findHighProbCategory(topGroupProbDist, allUniqueValues);
				let bottomObjectCategory = OperatorMediator.metadataForEachAttribute[attributeName].bottomGroupUniqueValues[0];
				self.explanationHTML = TextGenerator.generateValueIsDiffFromDistExp(capitalizedBottomGroupNameHTML, normalTopGroupNameHTML, bottomObjectCategory, topGroupHighProbCategory);
			}
			if (isCategorical && bothAreGroups) {
				let allUniqueValues = OperatorMediator.metadataForEachAttribute[attributeName].uniqueValues;
				let topGroupHighProbCategory = self.findHighProbCategory(topGroupProbDist, allUniqueValues);
				let bottomGroupHighProbCategory = self.findHighProbCategory(bottomGroupProbDist, allUniqueValues);
				self.explanationHTML = TextGenerator.generateDifferentDistributionExp(normalTopGroupNameHTML, normalBottomGroupNameHTML, topGroupHighProbCategory, bottomGroupHighProbCategory);
			}
			if (isNumerical && bothAreObjects) {
				let topGroupValue = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].topGroupMean;
				let bottomGroupValue = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].bottomGroupMean;
				let whichIsHigher = (topGroupValue > bottomGroupValue) ? 'group1' : 'group2';
				self.explanationHTML = TextGenerator.generateDiffValuesExp(capitalizedTopGroupNameHTML, normalBottomGroupNameHTML, whichIsHigher);
			}
			if (isNumerical && topIsObjectBottomIsGroup) {
				let topGroupValue = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].topGroupMean;
				let bottomGroupMean = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].bottomGroupMean;
				let whichIsHigher = (topGroupValue > bottomGroupMean) ? 'group1' : 'group2';
				self.explanationHTML = TextGenerator.generateValueIsDiffFromAvgExp(normalTopGroupNameHTML, normalBottomGroupNameHTML, whichIsHigher);
			}
			if (isNumerical && bottomIsObjectTopIsGroup) {
				let topGroupMean = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].topGroupMean;
				let bottomGroupValue = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].bottomGroupMean;
				let whichIsHigher = (bottomGroupValue > topGroupMean) ? 'group1' : 'group2';
				self.explanationHTML = TextGenerator.generateValueIsDiffFromAvgExp(normalBottomGroupNameHTML, normalTopGroupNameHTML, whichIsHigher);
			}
			if (isNumerical && bothAreGroups) {
				let topGroupMean = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].topGroupMean;
				let bottomGroupMean = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].bottomGroupMean;
				let whichIsHigher = (topGroupMean > bottomGroupMean) ? 'group1' : 'group2';
				self.explanationHTML = TextGenerator.generateDiffAvgAndDistExp(capitalizedTopGroupNameHTML, normalBottomGroupNameHTML, classByMeanDiffOnly, whichIsHigher);
			}
		}
		
		if (currentAttributeClass == 'N')
			self.explanationHTML = '';
	},
	generateForGroup: function(type) { // type = similar or different
		const self = this;
		let topShelfGroup = OperatorMediator.topShelfGroup;
		let bottomShelfGroup = OperatorMediator.bottomShelfGroup;
		let numberOfSimilarOrDiffAttr = OperatorMediator.similarAndDifferentAttributes[type].length;

		let capitalizedTopGroupNameHTML = '<span class="top-group-name">' + TextGenerator.generateGroupNameHTML(topShelfGroup, true) + '</span>';
		let normalBottomGroupNameHTML = '<span class="bottom-group-name">' + TextGenerator.generateGroupNameHTML(bottomShelfGroup) + '</span>';
		
		if (type == 'similar')
			self.explanationHTML = TextGenerator.generateNumberOfSimilarAttrExp(capitalizedTopGroupNameHTML, normalBottomGroupNameHTML, numberOfSimilarOrDiffAttr);
		if (type == 'different')
			self.explanationHTML = TextGenerator.generateNumberOfDiffAttrExp(capitalizedTopGroupNameHTML, normalBottomGroupNameHTML, numberOfSimilarOrDiffAttr);
	},
	show: function() {
		const self = this;

		$('#system-reasoning-panel .text')
			.html(self.explanationHTML);
	},
	findHighProbCategory: function(probabilityDistribution, uniqueValues) {
		for (let i = 0; i < probabilityDistribution.length; i++)
			if (probabilityDistribution[i] > 0.8)
				return { category: uniqueValues[i], probability: probabilityDistribution[i] };

		return null;
	}
}