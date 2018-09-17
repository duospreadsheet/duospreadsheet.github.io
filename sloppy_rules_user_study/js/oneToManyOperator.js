const OneToManyOperator = {
	meanInfoForEachNumericalAttrForEachPair: [],
	probDistPairForEachAttrForEachPair: [],
	similarAndDifferentAttrForEachPair: [],
	metadataForEachAttrForEachPair: [],
	numberOfObjectsForEachPair: [],

	groupsRankedByNumberOfSimilarAttr: [], // { bottomShelfGroup, similarAttributes }
	groupsRankedByNumberOfDiffAttr: [], // { bottomShelfGroup, differentAttributes }

	clear: function() {
		const self = this;

		self.meanInfoForEachNumericalAttrForEachPair = [];
		self.probDistPairForEachAttrForEachPair = [];
		self.similarAndDifferentAttrForEachPair = [];
		self.metadataForEachAttrForEachPair = [];
		self.numberOfObjectsForEachPair = [];

		self.groupsRankedByNumberOfSimilarAttr = [];
		self.groupsRankedByNumberOfDiffAttr = [];
	},
	forEachBottomGroup: function(operationOnEachBottomGroup, topShelfGroup, bottomShelfGroups, specifiedAttributes) {
		let topShelfObjects = topShelfGroup.includedObjects;

		for (let i = 0; i < bottomShelfGroups.length; i++) {
			let bottomShelfObjects = bottomShelfGroups[i].includedObjects;
			let attributeList = ResultPanel.removeRedundantAttributes(specifiedAttributes, topShelfObjects, bottomShelfObjects);

			operationOnEachBottomGroup(topShelfObjects, bottomShelfObjects, attributeList);
		}
	},
	rankGroups: function() {
		const self = this;

		// push
		for (let i = 0; i < self.similarAndDifferentAttrForEachPair.length; i++) {
			let currentGroupIndex = i;
			let bottomShelfGroups = Shelf.data.bottom;
			let currentSimilarAttributes = self.similarAndDifferentAttrForEachPair[i].similar;
			let currentDifferentAttributes = self.similarAndDifferentAttrForEachPair[i].different;

			self.groupsRankedByNumberOfSimilarAttr.push({
				groupName: bottomShelfGroups[i].name,
				bottomShelfGroupIndex: i,
				numberOfAttributes: currentSimilarAttributes.length
			});
			self.groupsRankedByNumberOfDiffAttr.push({
				groupName: bottomShelfGroups[i].name,
				bottomShelfGroupIndex: i,
				numberOfAttributes: currentDifferentAttributes.length
			});
		}

		// sort
		self.groupsRankedByNumberOfSimilarAttr.sort(compare);
		self.groupsRankedByNumberOfDiffAttr.sort(compare);

		function compare(a, b) {
			if (a.numberOfAttributes < b.numberOfAttributes)
		    	return 1;
		  	if (a.numberOfAttributes > b.numberOfAttributes)
		    	return -1;
		  	return 0;
		}
	},
	pushDataToMediator: function(bottomShelfGroupIndex) {
		const self = this;

		OperatorMediator.meanInfoForEachNumericalAttribute = self.meanInfoForEachNumericalAttrForEachPair[bottomShelfGroupIndex];
		OperatorMediator.probDistPairForEachAttribute = self.probDistPairForEachAttrForEachPair[bottomShelfGroupIndex];
		OperatorMediator.similarAndDifferentAttributes = self.similarAndDifferentAttrForEachPair[bottomShelfGroupIndex];
		OperatorMediator.metadataForEachAttribute = self.metadataForEachAttrForEachPair[bottomShelfGroupIndex];
		OperatorMediator.numberOfObjects = self.numberOfObjectsForEachPair[bottomShelfGroupIndex];

		OperatorMediator.topShelfGroup = Shelf.data.top[0];
		OperatorMediator.bottomShelfGroup = Shelf.data.bottom[bottomShelfGroupIndex];
	}
}