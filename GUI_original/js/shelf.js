const Shelf = {
	bottomShelfClusterizeObject: null,
	shelfEl: { top: null, bottom: null, attribute: null },
	colour: { top: '#b5a59b', bottom: '#b9b0c4', attribute: '#afafaf' },
	data: { top: [], bottom: [], attribute: [] }, // { name, ruleBasedName, baseRules, inclusionRules, exclusionRules, includedObjects, excludedObjects } for top and bottom
	changedGroupObjects: [], // need to update the objects

	init: function() {
		const self = this;

		self.shelfEl['top'] = $('#sidebar .shelves .top-group.shelf')[0];
		self.shelfEl['bottom'] = $('#sidebar .shelves .bottom-group.shelf')[0];
		self.shelfEl['attribute'] = $('#sidebar .shelves .attributes.shelf')[0];
		self.bottomShelfClusterizeObject = new Clusterize({
			rows: [],
			scrollId: 'bottom-shelf-scroll-area',
			contentId: 'bottom-shelf-content-area',
			no_data_text: '',
			callbacks: { clusterChanged: self.bindDataToBottomShelfTag }
		});
	},
	show: function(shelfType) {
		const self = this;

		$(self.shelfEl[shelfType])
			.css('opacity', 1);
	},
	hide: function(shelfType) {
		const self = this;

		$(self.shelfEl[shelfType])
			.css('opacity', 0);
	},
	update: function() { // on enter, on click add button, on click anywhere else
		const self = this;
		
		self.retrieveObjects();
		self.refreshUI();
		self.installEnterNewNameBehaviour();
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
			GroupViewer.lastOperation.numberOfRecordsAdded = changeInNumberOfIncludedObjects;
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
	addRulesFromInputBox: function() {
		const self = this;
		const allRules = RuleInputBoxInputInputBox.Rule.getAllRulesFromInputBox();
		let currentShelfType = $('#rule-input-box').attr('shelf-type');

		if (currentShelfType == 'base' || currentShelfType == 'inclusion' || currentShelfType == 'exclusion') {
			let ruleType = currentShelfType + 'Rules';
			let filteredRuleArray = self.filterRedundantRules(allRules, returnOneLevelArray = true);
			let groupObject = GroupEditor.currentGroupObject;
			let currentBaseRules = null, currentInclusionRules = null, currentExclusionRules = null;
			let newRuleBasedName = null, oldRuleBasedName = null;

			// change rules
			for (let i = 0; i < filteredRuleArray.length; i++) {
				let currentRule = filteredRuleArray[i];
				if (groupObject[ruleType].indexOf(currentRule) == -1)
					groupObject[ruleType].push(currentRule);
			}

			// change ruleBasedName
			currentBaseRules = groupObject['baseRules'];
			currentInclusionRules = groupObject['inclusionRules'];
			currentExclusionRules = groupObject['exclusionRules'];
			newRuleBasedName = Shelf.generateGroupName(currentBaseRules, currentInclusionRules, currentExclusionRules);
			oldRuleBasedName = groupObject.ruleBasedName;
			groupObject.ruleBasedName = newRuleBasedName;
			if (groupObject.name == oldRuleBasedName)
				groupObject.name = newRuleBasedName;
			
			// prepare for changing objects
			if (currentShelfType == 'base') {
				GroupViewer.lastOperation.addToViewer = 'excluded';
				GroupViewer.lastOperation.operation = 'adding the base rule';
				self.changedGroupObjects.push({ groupObject: groupObject, updateMode: 'removeFromIncluded' });
			}
			if (currentShelfType == 'inclusion') {
				GroupViewer.lastOperation.addToViewer = 'included';
				GroupViewer.lastOperation.operation = 'adding the inclusion rule';
				self.changedGroupObjects.push({ groupObject: groupObject, updateMode: 'addFromExcluded' });
			}
			if (currentShelfType == 'exclusion') {
				GroupViewer.lastOperation.addToViewer = 'excluded';
				GroupViewer.lastOperation.operation = 'adding the exclusion rule';
				self.changedGroupObjects.push({ groupObject: groupObject, updateMode: 'removeFromIncluded' });
			}
		}

		if (currentShelfType == 'top') { // replace
			let filteredRuleArray = self.filterRedundantRules(allRules);

			for (let i = 0; i < filteredRuleArray.length; i++) {
				let currentBaseRules = filteredRuleArray[i];
				let currentGroupName = self.generateGroupName(currentBaseRules);
				let groupObject = {
					name: currentGroupName,
					ruleBasedName: currentGroupName,
					baseRules: currentBaseRules,
					inclusionRules: [],
					exclusionRules: [],
					includedObjects: [],
					excludedObjects: []
				};

				self.data[currentShelfType] = [ groupObject ];
				self.changedGroupObjects.push({
					groupObject: groupObject,
					updateMode: 'searchThroughAll'
				});
			}	
		}

		if (currentShelfType == 'bottom') {
			let filteredRuleArray = self.filterRedundantRules(allRules);
			let groupObjectsToBeStored = []; // temporary store

			for (let i = 0; i < filteredRuleArray.length; i++) {
				let currentBaseRules = filteredRuleArray[i];
				let currentGroupName = self.generateGroupName(currentBaseRules);
				let groupObject = {
					name: currentGroupName,
					ruleBasedName: currentGroupName,
					baseRules: currentBaseRules,
					inclusionRules: [],
					exclusionRules: [],
					includedObjects: [],
					excludedObjects: []
				};

				if (!isAlreadyExistInBottomShelf(groupObject))
					groupObjectsToBeStored.push(groupObject);
			}

			for (let i = 0; i < groupObjectsToBeStored.length; i++) {
				self.data[currentShelfType].push(groupObjectsToBeStored[i]);
				self.changedGroupObjects.push({
					groupObject: groupObjectsToBeStored[i],
					updateMode: 'searchThroughAll'
				});
			}
		}

		if (currentShelfType == 'attribute') { // to ensure no redundancy
			for (let i = 0; i < allRules.length; i++) {
				let currentAttribute = allRules[i];

				if (self.data.attribute.indexOf(currentAttribute) == -1)
					self.data.attribute.push(currentAttribute);
			}
		}

		function isAlreadyExistInBottomShelf(groupObject) {
			let allBottomShelfGroupObjects = self.data['bottom'];

			for (let i = 0; i < allBottomShelfGroupObjects.length; i++) {
				let currentGroupObject = allBottomShelfGroupObjects[i];
				let currentGroupObjectBaseRules = allBottomShelfGroupObjects[i].baseRules;
				let currentGroupObjectInclusionRules = allBottomShelfGroupObjects[i].inclusionRules;
				let currentGroupObjectExclusionRules = allBottomShelfGroupObjects[i].exclusionRules;
				let notHaveInclusionExclusionRules = currentGroupObjectInclusionRules.length == 0 && currentGroupObjectExclusionRules == 0;
				let haveOnlyOneBaseRule = currentGroupObjectBaseRules.length == 1;

				if (notHaveInclusionExclusionRules && haveOnlyOneBaseRule)
					if (groupObject.baseRules[0] === currentGroupObjectBaseRules[0])
						return true;
			}

			return false;
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
	refreshUI: function() {
		const self = this;
		
		self.updateTopShelf();
		self.updateBottomShelf();
		self.updateAttributeShelf();
	},
	updateTopShelf: function() {
		const self = this;
		let topShelfGroups = d3.select(self.shelfEl['top']).select('.container').selectAll('.group')
			.data(self.data['top']);

		topShelfGroups.enter() // add new
			.append('div')
			.attr('class', 'group');

		topShelfGroups.exit() // remove old
			.remove();

		$(self.shelfEl['top']).find('.container .group').each(function() { // update all
			let data = d3.select(this).datum();
			let numberOfObjects = data.includedObjects.length;
			let longGroupName = data.name;
			let shortGroupName = Helpers.generateShortName(longGroupName, 23);
			let tagHTML = '<span class="content">' + 
								'<span class="name" contenteditable="true">' + shortGroupName + '</span>' +
								'<span class="count">(' + numberOfObjects + ')</span>' + 
								'<span class="fas fa-edit"></span>' + 
								'<span class="fas fa-times"></span>' + 
						  '</span>';

			$(this).html(tagHTML);
		});
	},
	updateBottomShelf: function() {
		const self = this;
		let tagHTMLArray = [];

		// generate tagHTMLArray
		for (let i = 0; i < self.data['bottom'].length; i++) {
			let data = self.data['bottom'][i];
			let longGroupName = data.name;
			let shortGroupName = Helpers.generateShortName(longGroupName, 17);
			let numberOfObjects = data.includedObjects.length;
			let tagHTML = '<div class="group" index="' + i + '">' +
							'<span class="content">' + 
								'<span class="name" contenteditable="true">' + shortGroupName + '</span>' +
								'<span class="count">(' + numberOfObjects + ')</span>' + 
								'<span class="fas fa-edit"></span>' + 
								'<span class="fas fa-times"></span>' + 
							'</span>' + 
						  '</div>';

			tagHTMLArray.push(tagHTML);
		}

		// update
		self.bottomShelfClusterizeObject.clear();
		self.bottomShelfClusterizeObject.update(tagHTMLArray);
	},
	bindDataToBottomShelfTag: function() {
		const self = Shelf;

		$('#bottom-shelf-content-area .group').each(function() {
			let currentIndex = $(this).attr('index');
			let currentGroupObject = self.data['bottom'][currentIndex];

			if (currentGroupObject === GroupEditor.currentGroupObject)
				$(this).addClass('selected');

			d3.select(this).datum(currentGroupObject);
		});
	},
	updateAttributeShelf: function() {
		const self = this;
		let attributeShelfGroups = d3.select(self.shelfEl['attribute']).select('.container').selectAll('.attribute')
			.data(self.data['attribute']);

		attributeShelfGroups.enter() // add new
			.append('div')
			.attr('class', 'attribute');

		attributeShelfGroups.exit() // remove old
			.remove();

		$(self.shelfEl['attribute']).find('.container .attribute').each(function() { // update all
			let longAttributeName = d3.select(this).datum();
			let shortAttributeName = Helpers.generateShortName(longAttributeName, 25);

			let tagHTML = '<span class="content">' + 
								shortAttributeName + 
								'<span class="fas fa-times"></span>' + 
						  '</span>';

			$(this).html(tagHTML);
		});
	},
	installEnterNewNameBehaviour: function() {
		$('#sidebar .shelves .shelf .group .name')
			.on('keydown', keydownNameInput)
			.on('keyup', keyupNameInput)
			.on('focus', focusNameInput)
			.on('blur', notFocusNameInput);

		function keydownNameInput(event) {
			var keyCode = window.event ? event.which : event.keyCode;

			if (keyCode === 13) {
				$(this).blur();
				event.preventDefault();
			}
		}

		function keyupNameInput(event) {
			let isCurrentGroupSelected = $(this).closest('.group.selected').length != 0;
			let newName = $(this).text();
			let currentGroupObject = d3.select(this.parentNode.parentNode).datum();

			currentGroupObject.name = newName;
			ChangeNameHandler.changeTextNode(currentGroupObject);
			ResultPanel.resizeAnswer(); // question might be resized
			if (isCurrentGroupSelected) GroupEditor.update();
		}

		function focusNameInput() {
			let currentGroupObject = d3.select(this.parentNode.parentNode).datum();
			let longGroupName = currentGroupObject.name;

			$(this).text(longGroupName);
		}

		function notFocusNameInput() {
			let currentGroupObject = d3.select(this.parentNode.parentNode).datum();
			let isOnTopShelf = $(this).closest('.top-group').length != 0;
			let shortNameLength = isOnTopShelf ? 23 : 18;
			let longGroupName = null, shortGroupName = null;

			let isCurrentGroupSelected = $(this).closest('.group.selected').length != 0;
			let currentName = $(this).text();
			let currentRuleBasedName = currentGroupObject.ruleBasedName;

			// avoid empty name
			if (currentName === '') {
				currentGroupObject.name = currentRuleBasedName;
				ChangeNameHandler.changeTextNode(currentGroupObject);
				ResultPanel.resizeAnswer(); // question might be resized
				if (isCurrentGroupSelected) GroupEditor.update();
			}

			// restore short name
			longGroupName = currentGroupObject.name;
			shortGroupName = Helpers.generateShortName(longGroupName, shortNameLength);
			$(this).text(shortGroupName);

			// remove active selection
			if (window.getSelection)
			    window.getSelection().removeAllRanges();
			else if (document.selection)
			    document.selection.empty();
		}
	},
	removeAllTagHighlights: function() {
		$('#sidebar .shelves .shelf .group.selected')
			.removeClass('selected');
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