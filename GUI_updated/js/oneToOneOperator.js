const OneToOneOperator = {
	meanInfoForEachNumericalAttribute: {}, // { topGroupMean, bottomGroupMean, normalizedMeanDiff }
	probDistPairForEachAttribute: {},
	similarAndDifferentAttributes: {},
	metadataForEachAttribute: {}, // { minValue, maxValue, binSize, classByBhOnly, classByMeanDiffOnly, classByBhAndMeanDiff } / { uniqueValues, topGroupUniqueValues, bottomGroupUniqueValues classByBhOnly, classByMeanDiffOnly, classByBhAndMeanDiff }
	numberOfObjects: {}, // top, bottom

	clear: function() {
		const self = this;

		self.meanInfoForEachNumericalAttribute = {};
		self.probDistPairForEachAttribute = {};
		self.similarAndDifferentAttributes = {};
		self.metadataForEachAttribute = {};
		self.numberOfObjects = {};
	},
	compute: function(topShelfObjects, bottomShelfObjects, attributeList) {
		const self = this;
		let numberOfBins = self.computeNumberOfBins(topShelfObjects, bottomShelfObjects);
		let metadataForEachAttribute = self.computeMetadataForEachAttribute(topShelfObjects, bottomShelfObjects, attributeList, numberOfBins);
		let binCountForEachAttribute = self.computeBinCountForEachAttribute(topShelfObjects, bottomShelfObjects, attributeList, metadataForEachAttribute, numberOfBins);
		let probDistPairForEachAttribute = self.computeProbDistPairForEachAttribute(topShelfObjects, bottomShelfObjects, binCountForEachAttribute, metadataForEachAttribute, numberOfBins);
		let meanInfoForEachNumericalAttribute = self.computeMeanInfoForEachNumericalAttribute(topShelfObjects, bottomShelfObjects, metadataForEachAttribute, attributeList, probDistPairForEachAttribute);
		[ probDistPairForEachAttribute, metadataForEachAttribute ] = self.sortProbForCategoricalAttributes(probDistPairForEachAttribute, metadataForEachAttribute);

		self.numberOfObjects = { top: topShelfObjects.length, bottom: bottomShelfObjects.length }
		self.probDistPairForEachAttribute = probDistPairForEachAttribute;
		self.meanInfoForEachNumericalAttribute = meanInfoForEachNumericalAttribute;
		self.metadataForEachAttribute = metadataForEachAttribute;
	},
	computeNumberOfBins: function(topShelfObjects, bottomShelfObjects) {
		let numberOfBins = Math.ceil(Math.sqrt((topShelfObjects.length + bottomShelfObjects.length) / 2));

		if (numberOfBins > 20)
			numberOfBins = 20;

		return numberOfBins;
	},
	computeMetadataForEachAttribute: function(topShelfObjects, bottomShelfObjects, attributeList, numberOfBins) {
		const metadataForEachAttribute = {};

		for (let i = 0; i < attributeList.length; i++) {
			let currentAttribute = attributeList[i];
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[currentAttribute] == 'numerical';
			let minValue = Infinity, maxValue = -Infinity;
			let uniqueValues = {};
			let topGroupUniqueValues = {}; // for generating explanation
			let bottomGroupUniqueValues = {}; // for generating explanation

			if (isCurrentAttributeNumerical) {
				for (let j = 0; j < topShelfObjects.length; j++) {
					let currentObject = topShelfObjects[j].data;
					let currentValue = currentObject[currentAttribute];
					let currentValueIsMissing = (currentValue === '');

					if (!currentValueIsMissing && currentValue < minValue)
						minValue = currentValue;
					if (!currentValueIsMissing && currentValue > maxValue)
						maxValue = currentValue;
				}

				for (let j = 0; j < bottomShelfObjects.length; j++) {
					let currentObject = bottomShelfObjects[j].data;
					let currentValue = currentObject[currentAttribute];
					let currentValueIsMissing = (currentValue === '');

					if (!currentValueIsMissing && currentValue < minValue)
						minValue = currentValue;
					if (!currentValueIsMissing && currentValue > maxValue)
						maxValue = currentValue;
				}

				metadataForEachAttribute[currentAttribute] = {
					minValue: minValue,
					maxValue: maxValue,
					binSize: (maxValue - minValue) / numberOfBins
				};
			}
			
			if (!isCurrentAttributeNumerical){
				for (let j = 0; j < topShelfObjects.length; j++) {
					let currentObject = topShelfObjects[j].data;
					let currentValue = currentObject[currentAttribute];
					let currentValueIsMissing = (currentValue === '');

					if (!currentValueIsMissing) {
						uniqueValues[currentValue] = {};
						topGroupUniqueValues[currentValue] = {};
					}
				}

				for (let j = 0; j < bottomShelfObjects.length; j++) {
					let currentObject = bottomShelfObjects[j].data;
					let currentValue = currentObject[currentAttribute];
					let currentValueIsMissing = (currentValue === '');

					if (!currentValueIsMissing) {
						uniqueValues[currentValue] = {};
						bottomGroupUniqueValues[currentValue] = {};
					}
				}

				metadataForEachAttribute[currentAttribute] = {
					uniqueValues: Object.keys(uniqueValues),
					topGroupUniqueValues: Object.keys(topGroupUniqueValues),
					bottomGroupUniqueValues: Object.keys(bottomGroupUniqueValues)
				};
			}
		}

		return metadataForEachAttribute;
	},
	computeBinCountForEachAttribute: function(topShelfObjects, bottomShelfObjects, attributeList, metadataForEachAttribute, numberOfBins) {
		const binCountForEachAttribute = {};

		for (let i = 0; i < attributeList.length; i++) {
			let currentAttribute = attributeList[i];
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[currentAttribute] == 'numerical';

			// init
			binCountForEachAttribute[currentAttribute] = {};
			binCountForEachAttribute[currentAttribute].top = {}; // { binIndex, count }
			binCountForEachAttribute[currentAttribute].bottom = {} // { binIndex, count }

			// count for numerical
			if (isCurrentAttributeNumerical) {
				let minValue = metadataForEachAttribute[currentAttribute].minValue;
				let maxValue = metadataForEachAttribute[currentAttribute].maxValue;
				let binSize = metadataForEachAttribute[currentAttribute].binSize;

				for (let j = 0; j < numberOfBins; j++) {
					binCountForEachAttribute[currentAttribute].top[j] = 0;
					binCountForEachAttribute[currentAttribute].bottom[j] = 0;
				}
				for (let j = 0; j < topShelfObjects.length; j++) {
					let currentObject = topShelfObjects[j].data;
					let currentValue = currentObject[currentAttribute];
					let currentBinIndex = Math.floor((currentValue - minValue) / binSize);
					let currentValueIsMissing = (currentValue === '');

					if (currentBinIndex >= numberOfBins)
						currentBinIndex = numberOfBins - 1;
					if (!currentValueIsMissing)
						binCountForEachAttribute[currentAttribute].top[currentBinIndex]++;
				}
				for (let j = 0; j < bottomShelfObjects.length; j++) {
					let currentObject = bottomShelfObjects[j].data;
					let currentValue = currentObject[currentAttribute];
					let currentBinIndex = Math.floor((currentValue - minValue) / binSize);
					let currentValueIsMissing = (currentValue === '');

					if (currentBinIndex >= numberOfBins)
						currentBinIndex = numberOfBins - 1;
					if (!currentValueIsMissing)
						binCountForEachAttribute[currentAttribute].bottom[currentBinIndex]++;
				}
			}

			// count for categorical
			if (!isCurrentAttributeNumerical) {
				let uniqueValues = metadataForEachAttribute[currentAttribute].uniqueValues;

				for (let j = 0; j < uniqueValues.length; j++) {
					let currentValue = uniqueValues[j];
					binCountForEachAttribute[currentAttribute].top[currentValue] = 0;
					binCountForEachAttribute[currentAttribute].bottom[currentValue] = 0;
				}
				for (let j = 0; j < topShelfObjects.length; j++) {
					let currentObject = topShelfObjects[j].data;
					let currentValue = currentObject[currentAttribute];
					let currentValueIsMissing = (currentValue === '');

					if (!currentValueIsMissing)
						binCountForEachAttribute[currentAttribute].top[currentValue]++;
				}
				for (let j = 0; j < bottomShelfObjects.length; j++) {
					let currentObject = bottomShelfObjects[j].data;
					let currentValue = currentObject[currentAttribute];
					let currentValueIsMissing = (currentValue === '');

					if (!currentValueIsMissing)
						binCountForEachAttribute[currentAttribute].bottom[currentValue]++;
				}
			}
		}

		// return
		return binCountForEachAttribute;
	},
	computeProbDistPairForEachAttribute: function(topShelfObjects, bottomShelfObjects, binCountForEachAttribute, metadataForEachAttribute, numberOfBins) {
		const probDistPairForEachAttribute = {};

		for (let currentAttribute in binCountForEachAttribute) {
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[currentAttribute] == 'numerical';
			let binIndexList = [];

			// init
			probDistPairForEachAttribute[currentAttribute] =  {};
			probDistPairForEachAttribute[currentAttribute].top = [];
			probDistPairForEachAttribute[currentAttribute].bottom = [];

			if (isCurrentAttributeNumerical) 
				for (let i = 0; i < numberOfBins; i++)
					binIndexList.push(i)

			if (!isCurrentAttributeNumerical)
				binIndexList = metadataForEachAttribute[currentAttribute].uniqueValues;

			// convert to probDistPairForEachAttribute
			for (let i = 0; i < binIndexList.length; i++) {
				let currentBinIndex = binIndexList[i];
				let allTopCountsForCurrentAttr = binCountForEachAttribute[currentAttribute].top;
				let allBottomCountsForCurrentAttr = binCountForEachAttribute[currentAttribute].bottom;
				let topCountForCurrentAttrValue = binCountForEachAttribute[currentAttribute].top[currentBinIndex];
				let bottomCountForCurrentAttrValue = binCountForEachAttribute[currentAttribute].bottom[currentBinIndex];

				// store probability for top group
				if (currentBinIndex in allTopCountsForCurrentAttr)
					probDistPairForEachAttribute[currentAttribute].top.push(topCountForCurrentAttrValue / topShelfObjects.length);
				else
					probDistPairForEachAttribute[currentAttribute].top.push(0);

				// store probability for bottom group
				if (currentBinIndex in allBottomCountsForCurrentAttr)
					probDistPairForEachAttribute[currentAttribute].bottom.push(bottomCountForCurrentAttrValue / bottomShelfObjects.length);
				else
					probDistPairForEachAttribute[currentAttribute].bottom.push(0);
			}
		}

		return probDistPairForEachAttribute;
	},
	computeMeanInfoForEachNumericalAttribute: function(topShelfObjects, bottomShelfObjects, metadataForEachAttribute, attributeList, probDistPairForEachAttribute) {
		const self = this;
		const meanInfoForEachNumericalAttribute = {};

		for (let i = 0; i < attributeList.length; i++) {
			let currentAttribute = attributeList[i];
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[currentAttribute] == 'numerical';
			let currentProbDistPair = probDistPairForEachAttribute[currentAttribute];
			let bothGroupsHaveOneObject = (topShelfObjects.length == 1 && bottomShelfObjects.length == 1);
			let minValue = null, maxValue = null;

			let topGroupSum = 0;
			let bottomGroupSum = 0;
			let topGroupNormalizedSum = 0;
			let bottomGroupNormalizedSum = 0;
			let topGroupCountExcludingMissing = 0;
			let bottomGroupCountExcludingMissing = 0;

			if (isCurrentAttributeNumerical) {
				minValue = bothGroupsHaveOneObject ? Database.metadata[currentAttribute].minValue : metadataForEachAttribute[currentAttribute].minValue;
				maxValue = bothGroupsHaveOneObject ? Database.metadata[currentAttribute].maxValue : metadataForEachAttribute[currentAttribute].maxValue;
				meanInfoForEachNumericalAttribute[currentAttribute] = { topGroupMean: null, bottomGroupMean: null, normalizedMeanDiff: null };

				// compute topGroupSum, topGroupNormalizedSum and topGroupCountExcludingMissing
				for (let j = 0; j < topShelfObjects.length; j++) {
					let currentObject = topShelfObjects[j].data;
					let currentValue = currentObject[currentAttribute];
					let currentValueIsMissing = (currentValue === '');

					if (!currentValueIsMissing) {
						topGroupSum += currentValue;
						topGroupNormalizedSum += (maxValue == minValue) ? 0 : (currentValue - minValue) / (maxValue - minValue);
						topGroupCountExcludingMissing++;
					}
				}

				// compute bottomGroupSum, bottomGroupNormalizedSum and bottomGroupCountExcludingMissing
				for (let j = 0; j < bottomShelfObjects.length; j++) {
					let currentObject = bottomShelfObjects[j].data;
					let currentValue = currentObject[currentAttribute];
					let currentValueIsMissing = (currentValue === '');

					if (!currentValueIsMissing) {
						bottomGroupSum += currentValue;
						bottomGroupNormalizedSum += (maxValue == minValue) ? 0 : (currentValue - minValue) / (maxValue - minValue);
						bottomGroupCountExcludingMissing++;
					}
				}

				// save
				meanInfoForEachNumericalAttribute[currentAttribute].topGroupMean = topGroupSum / topGroupCountExcludingMissing;
				meanInfoForEachNumericalAttribute[currentAttribute].bottomGroupMean = bottomGroupSum / bottomGroupCountExcludingMissing;
				meanInfoForEachNumericalAttribute[currentAttribute].normalizedMeanDiff = Math.abs(topGroupNormalizedSum / topGroupCountExcludingMissing - bottomGroupNormalizedSum / bottomGroupCountExcludingMissing);
			}
		}

		return meanInfoForEachNumericalAttribute;
	},
	sortProbForCategoricalAttributes: function(probDistPairForEachAttribute, metadataForEachAttribute) {
		const sortedProbDistPairForEachAttribute = {};
		const updatedMetadataForEachAttribute = {};

		for (let currentAttribute in probDistPairForEachAttribute) {
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[currentAttribute] == 'numerical';

			// init
			sortedProbDistPairForEachAttribute[currentAttribute] =  {};
			sortedProbDistPairForEachAttribute[currentAttribute].top = [];
			sortedProbDistPairForEachAttribute[currentAttribute].bottom = [];
			updatedMetadataForEachAttribute[currentAttribute] = {};

			// copy for numerical
			if (isCurrentAttributeNumerical) {
				sortedProbDistPairForEachAttribute[currentAttribute].top = probDistPairForEachAttribute[currentAttribute].top;
				sortedProbDistPairForEachAttribute[currentAttribute].bottom = probDistPairForEachAttribute[currentAttribute].bottom;
				updatedMetadataForEachAttribute[currentAttribute] = metadataForEachAttribute[currentAttribute];
			}

			// sort for categorical
			if (!isCurrentAttributeNumerical) {
				let allCategories = metadataForEachAttribute[currentAttribute].uniqueValues;
				let sortedCategories = [];
				let topProbabilityObjects = [];
				let bottomProbabilityObjects = [];
				let probabilityDifferences = [];

				// compute probability difference
				for (let i = 0; i < allCategories.length; i++) {
					let currentTopProb = probDistPairForEachAttribute[currentAttribute].top[i];
					let currentBottomProb = probDistPairForEachAttribute[currentAttribute].bottom[i];

					topProbabilityObjects.push({ probability: currentTopProb, binIndex: i });
					bottomProbabilityObjects.push({ probability: currentBottomProb, binIndex: i });
					probabilityDifferences.push(currentTopProb - currentBottomProb);
				}

				// sort based on probability differences
				topProbabilityObjects.sort(function(a, b) { return probabilityDifferences[a.binIndex] - probabilityDifferences[b.binIndex]; });
				bottomProbabilityObjects.sort(function(a, b) { return probabilityDifferences[a.binIndex] - probabilityDifferences[b.binIndex]; });

				// save new probability
				for (let i = 0; i < topProbabilityObjects.length; i++)
					sortedProbDistPairForEachAttribute[currentAttribute].top.push(topProbabilityObjects[i].probability);
				for (let i = 0; i < bottomProbabilityObjects.length; i++)
					sortedProbDistPairForEachAttribute[currentAttribute].bottom.push(bottomProbabilityObjects[i].probability);

				// save metadata
				for (let i = 0; i < topProbabilityObjects.length; i++) {
					let currentBinIndex = topProbabilityObjects[i].binIndex;
					let currentCategory = allCategories[currentBinIndex];
					sortedCategories.push(currentCategory);
				}
				updatedMetadataForEachAttribute[currentAttribute] = metadataForEachAttribute[currentAttribute];
				updatedMetadataForEachAttribute[currentAttribute].uniqueValues = sortedCategories;
			}
		}

		return [ sortedProbDistPairForEachAttribute, updatedMetadataForEachAttribute ];
	},
	classify: function() {
		const self = this;
		let probDistPairForEachAttribute = self.probDistPairForEachAttribute;
		let meanInfoForEachNumericalAttribute = self.meanInfoForEachNumericalAttribute;
		let scoresForEachAttribute = self.computeScoresForEachAttribute(probDistPairForEachAttribute, meanInfoForEachNumericalAttribute);
		let [ similarAndDifferentAttributes, classificationsForEachAttr ] = self.classifySimilarAndDifferentAttributes(scoresForEachAttribute, self.numberOfObjects);
		let metadataForEachAttribute = self.addClassificationToMetaData(classificationsForEachAttr, self.metadataForEachAttribute);

		self.similarAndDifferentAttributes = similarAndDifferentAttributes;
		self.metadataForEachAttribute = metadataForEachAttribute;
	},
	computeScoresForEachAttribute: function(probDistPairForEachAttribute, meanInfoForEachNumericalAttribute) {
		const self = this;
		const scoresForEachAttribute = {};

		for (let currentAttribute in probDistPairForEachAttribute) {
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[currentAttribute] == 'numerical';
			let bhCoefficient = self.computeBhCoefficient(probDistPairForEachAttribute[currentAttribute]);
			let meanDifference = (isCurrentAttributeNumerical) ? meanInfoForEachNumericalAttribute[currentAttribute].normalizedMeanDiff : null;

			if (isCurrentAttributeNumerical)
				scoresForEachAttribute[currentAttribute] = { bhCoefficient: bhCoefficient, meanDifference: meanDifference };
			if (!isCurrentAttributeNumerical)
				scoresForEachAttribute[currentAttribute] = { bhCoefficient: bhCoefficient };
		}

		return scoresForEachAttribute;
	},
	computeBhCoefficient: function(probDistPair) {
		let bhCoefficient = 0;
		let allEqual = true;

		for (let i = 0; i < probDistPair.top.length; i++) {
			let topProbability = probDistPair.top[i];
			let bottomProbability = probDistPair.bottom[i];

			bhCoefficient += Math.sqrt(topProbability * bottomProbability);

			// hacky workaround for precision bug
			if (topProbability != bottomProbability)
				allEqual = false;
		}

		return (allEqual ? 1 : bhCoefficient);
	},
	classifySimilarAndDifferentAttributes: function(scoresForEachAttribute, numberOfObjects) {
		let numOfObjInTopGroup = numberOfObjects.top;
		let numOfObjInBottomGroup = numberOfObjects.bottom;
		let atLeastOneGroupHasOneObject = numOfObjInTopGroup == 1 || numOfObjInBottomGroup == 1;
		const similarAndDifferentAttributes = { 'similar': [], 'different': [], 'neither': [] };
		const classificationsForEachAttr = {};

		// classify
		for (let currentAttribute in scoresForEachAttribute) {
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[currentAttribute] == 'numerical';
			let classDProbability = { bhAndMeanDiff: null, bhOnly: null, meanDiffOnly: null };
			let classNProbability = { bhAndMeanDiff: null, bhOnly: null, meanDiffOnly: null };
			let classSProbability = { bhAndMeanDiff: null, bhOnly: null, meanDiffOnly: null };

			// categorical (compute using bhOnly model)
			if (!isCurrentAttributeNumerical) {
				let bhCoefficient = scoresForEachAttribute[currentAttribute].bhCoefficient;
				let classDWeightedSum = bhCoefficient * -52.0298 + 46.2363;
				let classDExp = Math.exp(classDWeightedSum);
				let classNWeightedSum = bhCoefficient * -33.6953 + 31.0733;
				let classNExp = Math.exp(classNWeightedSum);

				classDProbability.bhOnly = classDExp / (1 + classDExp + classNExp);
				classNProbability.bhOnly = classNExp / (1 + classDExp + classNExp);
				classSProbability.bhOnly = 1 - classDProbability.bhOnly - classNProbability.bhOnly;

				if (classSProbability.bhOnly >= classNProbability.bhOnly && classSProbability.bhOnly >= classDProbability.bhOnly)
					similarAndDifferentAttributes.similar.push({ attributeName: currentAttribute, probability: classSProbability.bhOnly });
				else if (classDProbability.bhOnly >= classNProbability.bhOnly && classDProbability.bhOnly >= classSProbability.bhOnly)
					similarAndDifferentAttributes.different.push({ attributeName: currentAttribute, probability: classDProbability.bhOnly });
				else if (classNProbability.bhOnly >= classSProbability.bhOnly && classNProbability.bhOnly >= classDProbability.bhOnly)
					similarAndDifferentAttributes.neither.push({ attributeName: currentAttribute, probability: classNProbability.bhOnly });
			}

			// numerical + at least only group has one object (compute using meanDiffOnly model)
			if (isCurrentAttributeNumerical && atLeastOneGroupHasOneObject) {
				let meanDifference = scoresForEachAttribute[currentAttribute].meanDifference;
				let classDWeightedSum = meanDifference * 45.6985 - 5.4464;
				let classDExp = Math.exp(classDWeightedSum);
				let classNWeightedSum = meanDifference * 23.9107 - 1.9907;
				let classNExp = Math.exp(classNWeightedSum);

				classDProbability.meanDiffOnly = classDExp / (1 + classDExp + classNExp);
				classNProbability.meanDiffOnly = classNExp / (1 + classDExp + classNExp);
				classSProbability.meanDiffOnly = 1 - classDProbability.meanDiffOnly - classNProbability.meanDiffOnly;

				if (classSProbability.meanDiffOnly >= classNProbability.meanDiffOnly && classSProbability.meanDiffOnly >= classDProbability.meanDiffOnly)
					similarAndDifferentAttributes.similar.push({ attributeName: currentAttribute, probability: classSProbability.meanDiffOnly });
				else if (classDProbability.meanDiffOnly >= classNProbability.meanDiffOnly && classDProbability.meanDiffOnly >= classSProbability.meanDiffOnly)
					similarAndDifferentAttributes.different.push({ attributeName: currentAttribute, probability: classDProbability.meanDiffOnly });
				else if (classNProbability.meanDiffOnly >= classSProbability.meanDiffOnly && classNProbability.meanDiffOnly >= classDProbability.meanDiffOnly) 
					similarAndDifferentAttributes.neither.push({ attributeName: currentAttribute, probability: classNProbability.meanDiffOnly });
			}

			// numerical + both are groups (compute using all models)
			if (isCurrentAttributeNumerical && !atLeastOneGroupHasOneObject) {
				let bhCoefficient = scoresForEachAttribute[currentAttribute].bhCoefficient;
				let meanDifference = scoresForEachAttribute[currentAttribute].meanDifference;
				let classDWeightedSum = { bhAndMeanDiff: null, bhOnly: null, meanDiffOnly: null };
				let classDExp = { bhAndMeanDiff: null, bhOnly: null, meanDiffOnly: null };
				let classNWeightedSum = { bhAndMeanDiff: null, bhOnly: null, meanDiffOnly: null };
				let classNExp = { bhAndMeanDiff: null, bhOnly: null, meanDiffOnly: null };

				classDWeightedSum.bhAndMeanDiff = bhCoefficient * -50.6583 + meanDifference * 36.204 + 40.0443;
				classDExp.bhAndMeanDiff = Math.exp(classDWeightedSum.bhAndMeanDiff);
				classNWeightedSum.bhAndMeanDiff = bhCoefficient * -30.0439 + meanDifference * 17.9018 + 26.2568;
				classNExp.bhAndMeanDiff = Math.exp(classNWeightedSum.bhAndMeanDiff);
				classDProbability.bhAndMeanDiff = classDExp.bhAndMeanDiff / (1 + classDExp.bhAndMeanDiff + classNExp.bhAndMeanDiff);
				classNProbability.bhAndMeanDiff = classNExp.bhAndMeanDiff / (1 + classDExp.bhAndMeanDiff + classNExp.bhAndMeanDiff);
				classSProbability.bhAndMeanDiff = 1 - classDProbability.bhAndMeanDiff - classNProbability.bhAndMeanDiff;

				classDWeightedSum.bhOnly = bhCoefficient * -52.0298 + 46.2363;
				classDExp.bhOnly = Math.exp(classDWeightedSum.bhOnly);
				classNWeightedSum.bhOnly = bhCoefficient * -33.6953 + 31.0733;
				classNExp.bhOnly = Math.exp(classNWeightedSum.bhOnly);
				classDProbability.bhOnly = classDExp.bhOnly / (1 + classDExp.bhOnly + classNExp.bhOnly);
				classNProbability.bhOnly = classNExp.bhOnly / (1 + classDExp.bhOnly + classNExp.bhOnly);
				classSProbability.bhOnly = 1 - classDProbability.bhOnly - classNProbability.bhOnly;

				classDWeightedSum.meanDiffOnly = meanDifference * 45.6985 - 5.4464;
				classDExp.meanDiffOnly = Math.exp(classDWeightedSum.meanDiffOnly);
				classNWeightedSum.meanDiffOnly = meanDifference * 23.9107 - 1.9907;
				classNExp.meanDiffOnly = Math.exp(classNWeightedSum.meanDiffOnly);
				classDProbability.meanDiffOnly = classDExp.meanDiffOnly / (1 + classDExp.meanDiffOnly + classNExp.meanDiffOnly);
				classNProbability.meanDiffOnly = classNExp.meanDiffOnly / (1 + classDExp.meanDiffOnly + classNExp.meanDiffOnly);
				classSProbability.meanDiffOnly = 1 - classDProbability.meanDiffOnly - classNProbability.meanDiffOnly;

				if (classSProbability.bhAndMeanDiff >= classNProbability.bhAndMeanDiff && classSProbability.bhAndMeanDiff >= classDProbability.bhAndMeanDiff)
					similarAndDifferentAttributes.similar.push({ attributeName: currentAttribute, probability: classSProbability.bhAndMeanDiff });
				else if (classDProbability.bhAndMeanDiff >= classNProbability.bhAndMeanDiff && classDProbability.bhAndMeanDiff >= classSProbability.bhAndMeanDiff)
					similarAndDifferentAttributes.different.push({ attributeName: currentAttribute, probability: classDProbability.bhAndMeanDiff });
				else if (classNProbability.bhAndMeanDiff >= classSProbability.bhAndMeanDiff && classNProbability.bhAndMeanDiff >= classDProbability.bhAndMeanDiff)
					similarAndDifferentAttributes.neither.push({ attributeName: currentAttribute, probability: classNProbability.bhAndMeanDiff });
			}

			classificationsForEachAttr[currentAttribute] = { bhAndMeanDiff: null, bhOnly: null, meanDiffOnly: null };

			if (classSProbability.bhOnly !== null && classSProbability.bhOnly >= classNProbability.bhOnly && classSProbability.bhOnly >= classDProbability.bhOnly)
				classificationsForEachAttr[currentAttribute].bhOnly = 'S';
			else if (classDProbability.bhOnly !== null && classDProbability.bhOnly >= classNProbability.bhOnly && classDProbability.bhOnly >= classSProbability.bhOnly) 
				classificationsForEachAttr[currentAttribute].bhOnly = 'D';
			else if (classNProbability.bhOnly !== null && classNProbability.bhOnly >= classSProbability.bhOnly && classNProbability.bhOnly >= classDProbability.bhOnly) 
				classificationsForEachAttr[currentAttribute].bhOnly = 'N';

			if (classSProbability.meanDiffOnly !== null && classSProbability.meanDiffOnly >= classNProbability.meanDiffOnly && classSProbability.meanDiffOnly >= classDProbability.meanDiffOnly) 
				classificationsForEachAttr[currentAttribute].meanDiffOnly = 'S';
			else if (classDProbability.meanDiffOnly !== null && classDProbability.meanDiffOnly >= classNProbability.meanDiffOnly && classDProbability.meanDiffOnly >= classSProbability.meanDiffOnly)
				classificationsForEachAttr[currentAttribute].meanDiffOnly = 'D';
			else if (classNProbability.meanDiffOnly !== null && classNProbability.meanDiffOnly >= classSProbability.meanDiffOnly && classNProbability.meanDiffOnly >= classDProbability.meanDiffOnly)
				classificationsForEachAttr[currentAttribute].meanDiffOnly = 'N';

			if (classSProbability.bhAndMeanDiff !== null && classSProbability.bhAndMeanDiff >= classNProbability.bhAndMeanDiff && classSProbability.bhAndMeanDiff >= classDProbability.bhAndMeanDiff)
				classificationsForEachAttr[currentAttribute].bhAndMeanDiff = 'S';
			else if (classDProbability.bhAndMeanDiff !== null && classDProbability.bhAndMeanDiff >= classNProbability.bhAndMeanDiff && classDProbability.bhAndMeanDiff >= classSProbability.bhAndMeanDiff)
				classificationsForEachAttr[currentAttribute].bhAndMeanDiff = 'D';
			else if (classNProbability.bhAndMeanDiff !== null && classNProbability.bhAndMeanDiff >= classSProbability.bhAndMeanDiff && classNProbability.bhAndMeanDiff >= classDProbability.bhAndMeanDiff)
				classificationsForEachAttr[currentAttribute].bhAndMeanDiff = 'N';
		}

		// sort
		similarAndDifferentAttributes.similar.sort(compare);
		similarAndDifferentAttributes.different.sort(compare);
		similarAndDifferentAttributes.neither.sort(compare);

		return [ similarAndDifferentAttributes, classificationsForEachAttr ];

		function compare(a, b) {
			if (a.probability < b.probability)
		    	return 1;
		  	if (a.probability > b.probability)
		    	return -1;
		  	return 0;
		}
	},
	addClassificationToMetaData: function(classificationsForEachAttr, metadataForEachAttribute) {
		const updatedMetadataForEachAttribute = {}

		for (let currentAttribute in metadataForEachAttribute) {
			updatedMetadataForEachAttribute[currentAttribute] = metadataForEachAttribute[currentAttribute];
			updatedMetadataForEachAttribute[currentAttribute].classByBhOnly = classificationsForEachAttr[currentAttribute].bhOnly;
			updatedMetadataForEachAttribute[currentAttribute].classByMeanDiffOnly = classificationsForEachAttr[currentAttribute].meanDiffOnly;
			updatedMetadataForEachAttribute[currentAttribute].classByBhAndMeanDiff = classificationsForEachAttr[currentAttribute].bhAndMeanDiff;
		}

		return updatedMetadataForEachAttribute;
	},
	pushDataToMediator: function() {
		const self = this;

		OperatorMediator.meanInfoForEachNumericalAttribute = self.meanInfoForEachNumericalAttribute;
		OperatorMediator.probDistPairForEachAttribute = self.probDistPairForEachAttribute;
		OperatorMediator.similarAndDifferentAttributes = self.similarAndDifferentAttributes;
		OperatorMediator.metadataForEachAttribute = self.metadataForEachAttribute;
		OperatorMediator.numberOfObjects = self.numberOfObjects;
		OperatorMediator.topShelfGroup = Shelf.data.top[0];
		OperatorMediator.bottomShelfGroup = Shelf.data.bottom[0];
	},
	pushDataToOneToManyOperator: function() {
		const self = this;

		OneToManyOperator.meanInfoForEachNumericalAttrForEachPair.push(self.meanInfoForEachNumericalAttribute);
		OneToManyOperator.probDistPairForEachAttrForEachPair.push(self.probDistPairForEachAttribute);
		OneToManyOperator.similarAndDifferentAttrForEachPair.push(self.similarAndDifferentAttributes);
		OneToManyOperator.metadataForEachAttrForEachPair.push(self.metadataForEachAttribute);
		OneToManyOperator.numberOfObjectsForEachPair.push(self.numberOfObjects);
	}
}