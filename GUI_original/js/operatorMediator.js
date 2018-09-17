const OperatorMediator = { // used by systemReasoningPanel
	meanInfoForEachNumericalAttribute: {},
	probDistPairForEachAttribute: {},
	similarAndDifferentAttributes: {},
	metadataForEachAttribute: {},
	numberOfObjects: {},
	topShelfGroup: null,
	bottomShelfGroup: null,

	getAttributeClass: function(attributeName) {
		const self = this;

		for (let i = 0; i < self.similarAndDifferentAttributes.similar.length; i++)
			if (self.similarAndDifferentAttributes.similar[i].attributeName == attributeName)
				return 'S';

		for (let i = 0; i < self.similarAndDifferentAttributes.different.length; i++)
			if (self.similarAndDifferentAttributes.different[i].attributeName == attributeName)
				return 'D';

		for (let i = 0; i < self.similarAndDifferentAttributes.neither.length; i++)
			if (self.similarAndDifferentAttributes.neither[i].attributeName == attributeName)
				return 'N';

		return -1;
	}
}