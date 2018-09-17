const Shelf = {
	colour: { top: '#b5a59b', bottom: '#b9b0c4', attribute: '#afafaf' },
	data: { top: [], bottom: [], attribute: [] }, // { name, ruleBasedName, baseRules, inclusionRules, exclusionRules, includedObjects, excludedObjects } for top and bottom
	changedGroupObjects: [], // need to update the objects

	update: function() { // on enter, on click add button, on click anywhere else
		const self = this;
		
		self.retrieveObjects();
	},
	retrieveObjects: function() {
		const self = this;

		for (let i = 0; i < self.changedGroupObjects.length; i++) {
			let currentGroupObject = self.changedGroupObjects[i].groupObject;
			let currentUpdateMode = self.changedGroupObjects[i].updateMode;
			let baseRulesStrings = currentGroupObject.baseRules;
			let inclusionRuleStrings = currentGroupObject.inclusionRules;
			let exclusionRuleStrings = currentGroupObject.exclusionRules;
			let baseRulesObjects = self.generateRuleObjectArray(baseRulesStrings);
			let inclusionRuleObjects = self.generateRuleObjectArray(inclusionRuleStrings);
			let exclusionRuleObjects = self.generateRuleObjectArray(exclusionRuleStrings);
			let originalNumberOfIncludedObjects = currentGroupObject.includedObjects.length;
			let finalNumberOfIncludedObjects = null;
			let changeInNumberOfIncludedObjects = null;
			
			if (currentUpdateMode == 'searchThroughAll')
				[ currentGroupObject.includedObjects, 
				  currentGroupObject.excludedObjects ] = self.retrieveObjectsBySearchingThroughAll({ 
				  	baseRulesObjects: baseRulesObjects,
				  	inclusionRuleObjects: inclusionRuleObjects,
				  	exclusionRuleObjects: exclusionRuleObjects
				});

			if (currentUpdateMode == 'addFromExcluded')
				[ currentGroupObject.includedObjects, 
				  currentGroupObject.excludedObjects ] = self.retrieveObjectsByAddingFromExcluded({ 
				  	baseRulesObjects: baseRulesObjects,
				  	inclusionRuleObjects: inclusionRuleObjects,
				  	exclusionRuleObjects: exclusionRuleObjects,
				  	includedObjects: currentGroupObject.includedObjects,
				  	excludedObjects: currentGroupObject.excludedObjects
				});

			if (currentUpdateMode == 'removeFromIncluded')
				[ currentGroupObject.includedObjects, 
				  currentGroupObject.excludedObjects ] = self.retrieveObjectsByRemovingFromIncluded({ 
				  	baseRulesObjects: baseRulesObjects,
				  	inclusionRuleObjects: inclusionRuleObjects,
				  	exclusionRuleObjects: exclusionRuleObjects,
				  	includedObjects: currentGroupObject.includedObjects,
				  	excludedObjects: currentGroupObject.excludedObjects
				});

			// making unnecessary updates at times
			finalNumberOfIncludedObjects = currentGroupObject.includedObjects.length;
			changeInNumberOfIncludedObjects = Math.abs(finalNumberOfIncludedObjects - originalNumberOfIncludedObjects);
		}

		self.changedGroupObjects = [];
	},
	retrieveObjectsBySearchingThroughAll: function(ruleObjects) {
		let objectsSatisfyingAllConditions = [];
		let objectsFailedToSatisfyAllConditions = [];
		let baseRulesObjects = ruleObjects.baseRulesObjects;
		let inclusionRuleObjects = ruleObjects.inclusionRuleObjects;
		let exclusionRuleObjects = ruleObjects.exclusionRuleObjects;

		// retrieve objects
		for (let i = 0; i < Database.data.length; i++) {
			let currentObject = Database.data[i];
			let currentObjectRowIndex = i + 1;
			let currentRowSatisifiesAllConditions = true;

			// check base rule
			for (let j = 0; j < baseRulesObjects.length; j++) {
				let currentRule = baseRulesObjects[j];
				let currentAttributeName = currentRule.attributeName;
				let currentRowValue = currentObject[currentAttributeName];
				let isCurrentAttributeNumerical = 'lowerValue' in currentRule;
				
				if (isCurrentAttributeNumerical) {
					let currentLowerValue = currentRule.lowerValue;
					let currentUpperValue = currentRule.upperValue;

					if (currentRowValue < currentLowerValue || currentRowValue > currentUpperValue) {
						currentRowSatisifiesAllConditions = false;
						break;
					}
				}

				if (!isCurrentAttributeNumerical) {
					let currentCategory = currentRule.category;

					if (currentRowValue !== currentCategory) {
						currentRowSatisifiesAllConditions = false;
						break;
					}
				}
			}

			if (baseRulesObjects.length == 0)
				currentRowSatisifiesAllConditions = false;

			// check inclusion rule
			if (!currentRowSatisifiesAllConditions) {
				for (let j = 0; j < inclusionRuleObjects.length; j++) {
					let currentRule = inclusionRuleObjects[j];
					let currentAttributeName = currentRule.attributeName;
					let currentRowValue = currentObject[currentAttributeName];
					let isCurrentAttributeNumerical = 'lowerValue' in currentRule;

					if (isCurrentAttributeNumerical) {
						let currentLowerValue = currentRule.lowerValue;
						let currentUpperValue = currentRule.upperValue;

						if (currentRowValue >= currentLowerValue && currentRowValue <= currentUpperValue) {
							currentRowSatisifiesAllConditions = true;
							break;
						}
					}

					if (!isCurrentAttributeNumerical) {
						let currentCategory = currentRule.category;

						if (currentRowValue === currentCategory) {
							currentRowSatisifiesAllConditions = true;
							break;
						}
					}
				}
			}
			
			// check exclusion rule
			if (currentRowSatisifiesAllConditions) {
				for (let j = 0; j < exclusionRuleObjects.length; j++) {
					let currentRule = exclusionRuleObjects[j];
					let currentAttributeName = currentRule.attributeName;
					let currentRowValue = currentObject[currentAttributeName];
					let isCurrentAttributeNumerical = 'lowerValue' in currentRule;

					if (isCurrentAttributeNumerical) {
						let currentLowerValue = currentRule.lowerValue;
						let currentUpperValue = currentRule.upperValue;

						if (currentRowValue >= currentLowerValue && currentRowValue <= currentUpperValue) {
							currentRowSatisifiesAllConditions = false;
							break;
						}
					}

					if (!isCurrentAttributeNumerical) {
						let currentCategory = currentRule.category;

						if (currentRowValue === currentCategory) {
							currentRowSatisifiesAllConditions = false;
							break;
						}
					}
				}
			}

			// store
			if (currentRowSatisifiesAllConditions)
				objectsSatisfyingAllConditions.push({
					index: currentObjectRowIndex,
					added: false,
					removed: false,
					data: currentObject
				});
			
			if (!currentRowSatisifiesAllConditions)
				objectsFailedToSatisfyAllConditions.push({
					index: currentObjectRowIndex,
					added: false,
					removed: false,
					data: currentObject
				});
		}

		return [ objectsSatisfyingAllConditions, objectsFailedToSatisfyAllConditions ];
	},
	retrieveObjectsByAddingFromExcluded: function(rulesAndObjects) {
		let objectsSatisfyingAllConditions = [];
		let objectsFailedToSatisfyAllConditions = [];
		let baseRulesObjects = rulesAndObjects.baseRulesObjects;
		let inclusionRuleObjects = rulesAndObjects.inclusionRuleObjects;
		let exclusionRuleObjects = rulesAndObjects.exclusionRuleObjects;
		let includedObjects = rulesAndObjects.includedObjects;
		let excludedObjects = rulesAndObjects.excludedObjects;

		// add from exluded objects
		for (let i = 0; i < excludedObjects.length; i++) {
			let currentObject = excludedObjects[i].data;
			let currentRowSatisifiesAllConditions = true;

			// check base rule
			for (let j = 0; j < baseRulesObjects.length; j++) {
				let currentRule = baseRulesObjects[j];
				let currentAttributeName = currentRule.attributeName;
				let currentRowValue = currentObject[currentAttributeName];
				let isCurrentAttributeNumerical = 'lowerValue' in currentRule;
				
				if (isCurrentAttributeNumerical) {
					let currentLowerValue = currentRule.lowerValue;
					let currentUpperValue = currentRule.upperValue;

					if (currentRowValue < currentLowerValue || currentRowValue > currentUpperValue) {
						currentRowSatisifiesAllConditions = false;
						break;
					}
				}

				if (!isCurrentAttributeNumerical) {
					let currentCategory = currentRule.category;

					if (currentRowValue !== currentCategory) {
						currentRowSatisifiesAllConditions = false;
						break;
					}
				}
			}

			if (baseRulesObjects.length == 0)
				currentRowSatisifiesAllConditions = false;

			// check inclusion rule
			if (!currentRowSatisifiesAllConditions) {
				for (let j = 0; j < inclusionRuleObjects.length; j++) {
					let currentRule = inclusionRuleObjects[j];
					let currentAttributeName = currentRule.attributeName;
					let currentRowValue = currentObject[currentAttributeName];
					let isCurrentAttributeNumerical = 'lowerValue' in currentRule;

					if (isCurrentAttributeNumerical) {
						let currentLowerValue = currentRule.lowerValue;
						let currentUpperValue = currentRule.upperValue;

						if (currentRowValue >= currentLowerValue && currentRowValue <= currentUpperValue) {
							currentRowSatisifiesAllConditions = true;
							break;
						}
					}

					if (!isCurrentAttributeNumerical) {
						let currentCategory = currentRule.category;

						if (currentRowValue === currentCategory) {
							currentRowSatisifiesAllConditions = true;
							break;
						}
					}
				}
			}

			// check exclusion rule
			if (currentRowSatisifiesAllConditions) {
				for (let j = 0; j < exclusionRuleObjects.length; j++) {
					let currentRule = exclusionRuleObjects[j];
					let currentAttributeName = currentRule.attributeName;
					let currentRowValue = currentObject[currentAttributeName];
					let isCurrentAttributeNumerical = 'lowerValue' in currentRule;

					if (isCurrentAttributeNumerical) {
						let currentLowerValue = currentRule.lowerValue;
						let currentUpperValue = currentRule.upperValue;

						if (currentRowValue >= currentLowerValue && currentRowValue <= currentUpperValue) {
							currentRowSatisifiesAllConditions = false;
							break;
						}
					}

					if (!isCurrentAttributeNumerical) {
						let currentCategory = currentRule.category;

						if (currentRowValue === currentCategory) {
							currentRowSatisifiesAllConditions = false;
							break;
						}
					}
				}
			}

			// store
			if (currentRowSatisifiesAllConditions) {
				excludedObjects[i].added = true;
				excludedObjects[i].removed = false;
				objectsSatisfyingAllConditions.push(excludedObjects[i]);
			}
			if (!currentRowSatisifiesAllConditions) {
				excludedObjects[i].added = false;
				excludedObjects[i].removed = false;
				objectsFailedToSatisfyAllConditions.push(excludedObjects[i]);
			}
		}

		// included objects are not touched
		for (let i = 0; i < includedObjects.length; i++) {
			includedObjects[i].added = false;
			includedObjects[i].removed = false;
			objectsSatisfyingAllConditions.push(includedObjects[i]);
		}

		return [ objectsSatisfyingAllConditions, objectsFailedToSatisfyAllConditions ];
	},
	retrieveObjectsByRemovingFromIncluded: function(rulesAndObjects) {
		let objectsSatisfyingAllConditions = [];
		let objectsFailedToSatisfyAllConditions = [];
		let baseRulesObjects = rulesAndObjects.baseRulesObjects;
		let inclusionRuleObjects = rulesAndObjects.inclusionRuleObjects;
		let exclusionRuleObjects = rulesAndObjects.exclusionRuleObjects;
		let includedObjects = rulesAndObjects.includedObjects;
		let excludedObjects = rulesAndObjects.excludedObjects;

		// remove from included objects
		for (let i = 0; i < includedObjects.length; i++) {
			let currentObject = includedObjects[i].data;
			let currentRowSatisifiesAllConditions = true;

			// check base rule
			for (let j = 0; j < baseRulesObjects.length; j++) {
				let currentRule = baseRulesObjects[j];
				let currentAttributeName = currentRule.attributeName;
				let currentRowValue = currentObject[currentAttributeName];
				let isCurrentAttributeNumerical = 'lowerValue' in currentRule;
				
				if (isCurrentAttributeNumerical) {
					let currentLowerValue = currentRule.lowerValue;
					let currentUpperValue = currentRule.upperValue;

					if (currentRowValue < currentLowerValue || currentRowValue > currentUpperValue) {
						currentRowSatisifiesAllConditions = false;
						break;
					}
				}

				if (!isCurrentAttributeNumerical) {
					let currentCategory = currentRule.category;

					if (currentRowValue !== currentCategory) {
						currentRowSatisifiesAllConditions = false;
						break;
					}
				}
			}

			if (baseRulesObjects.length == 0)
				currentRowSatisifiesAllConditions = false;

			// check inclusion rule
			if (!currentRowSatisifiesAllConditions) {
				for (let j = 0; j < inclusionRuleObjects.length; j++) {
					let currentRule = inclusionRuleObjects[j];
					let currentAttributeName = currentRule.attributeName;
					let currentRowValue = currentObject[currentAttributeName];
					let isCurrentAttributeNumerical = 'lowerValue' in currentRule;

					if (isCurrentAttributeNumerical) {
						let currentLowerValue = currentRule.lowerValue;
						let currentUpperValue = currentRule.upperValue;

						if (currentRowValue >= currentLowerValue && currentRowValue <= currentUpperValue) {
							currentRowSatisifiesAllConditions = true;
							break;
						}
					}

					if (!isCurrentAttributeNumerical) {
						let currentCategory = currentRule.category;

						if (currentRowValue === currentCategory) {
							currentRowSatisifiesAllConditions = true;
							break;
						}
					}
				}
			}

			// check exclusion rule
			if (currentRowSatisifiesAllConditions) {
				for (let j = 0; j < exclusionRuleObjects.length; j++) {
					let currentRule = exclusionRuleObjects[j];
					let currentAttributeName = currentRule.attributeName;
					let currentRowValue = currentObject[currentAttributeName];
					let isCurrentAttributeNumerical = 'lowerValue' in currentRule;

					if (isCurrentAttributeNumerical) {
						let currentLowerValue = currentRule.lowerValue;
						let currentUpperValue = currentRule.upperValue;

						if (currentRowValue >= currentLowerValue && currentRowValue <= currentUpperValue) {
							currentRowSatisifiesAllConditions = false;
							break;
						}
					}

					if (!isCurrentAttributeNumerical) {
						let currentCategory = currentRule.category;

						if (currentRowValue === currentCategory) {
							currentRowSatisifiesAllConditions = false;
							break;
						}
					}
				}
			}

			// store
			if (currentRowSatisifiesAllConditions) {
				includedObjects[i].added = false;
				includedObjects[i].removed = false;
				objectsSatisfyingAllConditions.push(includedObjects[i]);
			}
			if (!currentRowSatisifiesAllConditions) {
				includedObjects[i].added = false;
				includedObjects[i].removed = true;
				objectsFailedToSatisfyAllConditions.push(includedObjects[i]);
			}
		}

		// excluded objects are not touched
		for (let i = 0; i < excludedObjects.length; i++) {
			excludedObjects[i].added = false;
			excludedObjects[i].removed = false;
			objectsFailedToSatisfyAllConditions.push(excludedObjects[i]);
		}

		return [ objectsSatisfyingAllConditions, objectsFailedToSatisfyAllConditions ];
	},
	filterRules: function(rulesInDatabase, missingRules = []) {
		let filteredRules = [];

		for (let i = 0; i < rulesInDatabase.length; i++)
			if (missingRules.indexOf(rulesInDatabase[i]) == -1) // current rule not missing
				filteredRules.push(rulesInDatabase[i])

		return filteredRules;
	},
	load: function(questionSet, questionNumber, missingRules = []) {
		const self = this;
		let isOneToOne = questionSet.indexOf('oneToOne') != -1;
		let isOneToMany = questionSet.indexOf('oneToMany') != -1;

		if (isOneToOne) {
			let topGroupObject = {
				name: null, ruleBasedName: null,
				baseRules: [], inclusionRules: [], exclusionRules: [],
				includedObjects: [], excludedObjects: []
			};
			let bottomGroupObject = {
				name: null, ruleBasedName: null,
				baseRules: null, inclusionRules: [], exclusionRules: [],
				includedObjects: [], excludedObjects: []
			};

			// handle top group shelf
			topGroupObject.baseRules = self.filterRules(RuleDatabase[questionSet][questionNumber].top.baseRules, missingRules);
			topGroupObject.inclusionRules = self.filterRules(RuleDatabase[questionSet][questionNumber].top.inclusionRules, missingRules);
			topGroupObject.exclusionRules = self.filterRules(RuleDatabase[questionSet][questionNumber].top.exclusionRules, missingRules);
			topGroupObject.name = Shelf.generateGroupName(topGroupObject.baseRules, topGroupObject.inclusionRules, topGroupObject.exclusionRules);
			topGroupObject.ruleBasedName = Shelf.generateGroupName(topGroupObject.baseRules, topGroupObject.inclusionRules, topGroupObject.exclusionRules);
			self.changedGroupObjects.push({ groupObject: topGroupObject, updateMode: 'searchThroughAll' });
			self.data.top = [ topGroupObject ];

			// handle bottom group shelf
			bottomGroupObject.baseRules = self.filterRules(RuleDatabase[questionSet][questionNumber].bottom.baseRules, missingRules);
			bottomGroupObject.inclusionRules = self.filterRules(RuleDatabase[questionSet][questionNumber].bottom.inclusionRules, missingRules);
			bottomGroupObject.exclusionRules = self.filterRules(RuleDatabase[questionSet][questionNumber].bottom.exclusionRules, missingRules);
			bottomGroupObject.name = Shelf.generateGroupName(bottomGroupObject.baseRules, bottomGroupObject.inclusionRules, bottomGroupObject.exclusionRules);
			bottomGroupObject.ruleBasedName = Shelf.generateGroupName(bottomGroupObject.baseRules, bottomGroupObject.inclusionRules, bottomGroupObject.exclusionRules);
			self.changedGroupObjects.push({ groupObject: bottomGroupObject, updateMode: 'searchThroughAll' });
			self.data.bottom = [ bottomGroupObject ];

			// handle attribute shelf
			self.data.attribute = self.filterRules(RuleDatabase[questionSet][questionNumber].attribute, missingRules);
		}

		if (isOneToMany) {
			let topGroupObject = {
				name: null, ruleBasedName: null,
				baseRules: [], inclusionRules: [], exclusionRules: [],
				includedObjects: [], excludedObjects: []
			};
			let firstBottomGroupObject = {
				name: null, ruleBasedName: null,
				baseRules: null, inclusionRules: [], exclusionRules: [],
				includedObjects: [], excludedObjects: []
			};
			let secondBottomGroupObject = {
				name: null, ruleBasedName: null,
				baseRules: null, inclusionRules: [], exclusionRules: [],
				includedObjects: [], excludedObjects: []
			};

			// handle top group shelf
			topGroupObject.baseRules = self.filterRules(RuleDatabase[questionSet][questionNumber].top.baseRules, missingRules);
			topGroupObject.inclusionRules = self.filterRules(RuleDatabase[questionSet][questionNumber].top.inclusionRules, missingRules);
			topGroupObject.exclusionRules = self.filterRules(RuleDatabase[questionSet][questionNumber].top.exclusionRules, missingRules);
			topGroupObject.name = Shelf.generateGroupName(topGroupObject.baseRules, topGroupObject.inclusionRules, topGroupObject.exclusionRules);
			topGroupObject.ruleBasedName = Shelf.generateGroupName(topGroupObject.baseRules, topGroupObject.inclusionRules, topGroupObject.exclusionRules);
			self.changedGroupObjects.push({ groupObject: topGroupObject, updateMode: 'searchThroughAll' });
			self.data.top = [ topGroupObject ];

			// handle bottom group shelf
			firstBottomGroupObject.baseRules = self.filterRules(RuleDatabase[questionSet][questionNumber].bottom[0].baseRules, missingRules);
			firstBottomGroupObject.inclusionRules = self.filterRules(RuleDatabase[questionSet][questionNumber].bottom[0].inclusionRules, missingRules);
			firstBottomGroupObject.exclusionRules = self.filterRules(RuleDatabase[questionSet][questionNumber].bottom[0].exclusionRules, missingRules);
			firstBottomGroupObject.name = Shelf.generateGroupName(firstBottomGroupObject.baseRules, firstBottomGroupObject.inclusionRules, firstBottomGroupObject.exclusionRules);
			firstBottomGroupObject.ruleBasedName = Shelf.generateGroupName(firstBottomGroupObject.baseRules, firstBottomGroupObject.inclusionRules, firstBottomGroupObject.exclusionRules);
			
			secondBottomGroupObject.baseRules = self.filterRules(RuleDatabase[questionSet][questionNumber].bottom[1].baseRules, missingRules);
			secondBottomGroupObject.inclusionRules = self.filterRules(RuleDatabase[questionSet][questionNumber].bottom[1].inclusionRules, missingRules);
			secondBottomGroupObject.exclusionRules = self.filterRules(RuleDatabase[questionSet][questionNumber].bottom[1].exclusionRules, missingRules);
			secondBottomGroupObject.name = Shelf.generateGroupName(secondBottomGroupObject.baseRules, secondBottomGroupObject.inclusionRules, secondBottomGroupObject.exclusionRules);
			secondBottomGroupObject.ruleBasedName = Shelf.generateGroupName(secondBottomGroupObject.baseRules, secondBottomGroupObject.inclusionRules, secondBottomGroupObject.exclusionRules);

			self.changedGroupObjects.push({ groupObject: firstBottomGroupObject, updateMode: 'searchThroughAll' });
			self.changedGroupObjects.push({ groupObject: secondBottomGroupObject, updateMode: 'searchThroughAll' });
			self.data.bottom = [ firstBottomGroupObject, secondBottomGroupObject ];

			// handle attribute shelf
			self.data.attribute = self.filterRules(RuleDatabase[questionSet][questionNumber].attribute, missingRules);
		}
	},
	clearShelfData: function(shelfType) {
		const self = this;
		
		self.data[shelfType] = [];
	},
	removeShelfDataItem: function(shelfType, dataItem) {
		const self = this;
		let itemIndex = self.data[shelfType].indexOf(dataItem);

		self.data[shelfType].splice(itemIndex, 1);
	},

	//-- Helpers --//

	sortObjectsInGroupByIndex: function(groupObject) {
		let includedObjects = groupObject.includedObjects;
		let excludedObjects = groupObject.excludedObjects;

		includedObjects.sort(compare);
		excludedObjects.sort(compare);

		function compare(a, b) {
			if (a.index < b.index)
				return -1;
			if (a.index > b.index)
				return 1;
			return 0;
		}
	},
	resetAddedAndRemoved: function(groupObject) {
		let includedObjects = groupObject.includedObjects;
		let excludedObjects = groupObject.excludedObjects;

		for (let i = 0; i < includedObjects.length; i++) {
			includedObjects[i].added = false;
			includedObjects[i].removed = false;
		}
		for (let i = 0; i < excludedObjects.length; i++) {
			excludedObjects[i].added = false;
			excludedObjects[i].removed = false;
		}
	},
	filterRedundantRules: function(allRules, returnOneLevelArray = false) {
		const filteredRuleArray = []; // each element is a set of rules for a group
		const isPartialSpecification = (allRules.length == 1 && allRules[0].indexOf('=??') != -1);

		if (isPartialSpecification) {
			let theOnlyRule = allRules[0];
			let attributeName = Helpers.parseAttributeName(theOnlyRule);
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[attributeName] == 'numerical';
			let minValue, maxValue, approxMedian, uniqueValues;

			if (isCurrentAttributeNumerical && !returnOneLevelArray) {
				minValue = Database.metadata[attributeName].minValue;
				maxValue = Database.metadata[attributeName].maxValue;
				approxMedian = Database.metadata[attributeName].approxMedian;

				filteredRuleArray.push([ minValue + '<=' + attributeName + '<=' + approxMedian ]);
				filteredRuleArray.push([ approxMedian + '<=' + attributeName + '<=' + maxValue ]);
			}

			if (isCurrentAttributeNumerical && returnOneLevelArray) {
				minValue = Database.metadata[attributeName].minValue;
				maxValue = Database.metadata[attributeName].maxValue;
				approxMedian = Database.metadata[attributeName].approxMedian;

				filteredRuleArray.push(minValue + '<=' + attributeName + '<=' + approxMedian);
				filteredRuleArray.push(approxMedian + '<=' + attributeName + '<=' + maxValue);
			}

			if (!isCurrentAttributeNumerical && !returnOneLevelArray) {
				uniqueValues = Database.metadata[attributeName].uniqueValues;

				for (let i = 0; i < uniqueValues.length; i++)
					filteredRuleArray.push([ attributeName + '=' + uniqueValues[i] ]);
			}

			if (!isCurrentAttributeNumerical && returnOneLevelArray) {
				uniqueValues = Database.metadata[attributeName].uniqueValues;

				for (let i = 0; i < uniqueValues.length; i++)
					filteredRuleArray.push(attributeName + '=' + uniqueValues[i]);
			}
		}

		if (!isPartialSpecification) { // remove partial specification rules

			if (!returnOneLevelArray) {
				const filteredRuleForAGroup = [];

				for (let i = 0; i < allRules.length; i++) {
					let currentRule = allRules[i];
					let isCurrentRulePartialSpecification = currentRule.indexOf('=??') != -1; // remove partial

					if (!isCurrentRulePartialSpecification)
						filteredRuleForAGroup.push(currentRule);
				}

				filteredRuleArray.push(filteredRuleForAGroup);
			}

			if (returnOneLevelArray) {
				for (let i = 0; i < allRules.length; i++) {
					let currentRule = allRules[i];
					let isCurrentRulePartialSpecification = currentRule.indexOf('=??') != -1; // remove partial

					if (!isCurrentRulePartialSpecification)
						filteredRuleArray.push(currentRule);
				}
			}
		}

		return filteredRuleArray;
	},
	generateGroupName: function(baseRules, inclusionRules = [], exclusionRules = []) {
		let groupName = '';

		for (let i = 0; i < baseRules.length; i++) 
			groupName += (i != baseRules.length - 1) ? baseRules[i] + ' & ' : baseRules[i];
		for (let i = 0; i < inclusionRules.length; i++)
			groupName += ' + ' + inclusionRules[i];
		for (let i = 0; i < exclusionRules.length; i++)
			groupName += ' - ' + exclusionRules[i];
		if (baseRules.length == 0 && inclusionRules.length == 0 && exclusionRules.length == 0)
			groupName = 'No Rules';

		return groupName;
	},
	generateRuleObjectArray: function(ruleStringArray) {
		let ruleObjectArray = [];

		for (let j = 0; j < ruleStringArray.length; j++) {
			let currentRule = ruleStringArray[j];
			let attributeName = Helpers.parseAttributeName(currentRule);
			let attributeValueObject = Helpers.parseAttributeValue(currentRule);
			let newRuleObject = { attributeName: attributeName };

			if ('category' in attributeValueObject)
				newRuleObject.category = attributeValueObject.category;
			if ('lowerValue' in attributeValueObject)
				newRuleObject.lowerValue = attributeValueObject.lowerValue;
			if ('upperValue' in attributeValueObject)
				newRuleObject.upperValue = attributeValueObject.upperValue;

			ruleObjectArray.push(newRuleObject);
		}

		return ruleObjectArray;
	}
}