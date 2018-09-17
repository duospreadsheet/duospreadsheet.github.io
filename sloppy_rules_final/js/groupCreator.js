const GroupCreator = {
	init: function() {
		const self = this;

		GroupCreatorTabs.init();
		GroupCreatorInputBox.init();
		GroupCreatorCategoricalMenu.init();
		GroupCreatorNumericalMenu.init();
		GroupCreatorRangeEditor.init();
		self.hide(); // rendering numerical menu require no hiding
	},
	changeColour: function(shelfType) {
		let borderColour = (shelfType == 'top' || shelfType == 'bottom' || shelfType == 'attribute') ? Shelf.colour[shelfType] : '#a0d1ff';
		let borderWidth = (shelfType == 'top' || shelfType == 'bottom' || shelfType == 'attribute') ? 3 : 2;

		$('#group-creator .rule-editor .input-box')
			.css('border-color', borderColour)
			.css('border-width', borderWidth);
		$('#group-creator .menu')
			.css('border-color', borderColour)
			.css('border-width', borderWidth);
		$('#group-creator .menu .attribute.content .container')
			.css('border-color', borderColour);
		$('#group-creator .menu .value.content .container')
			.css('border-color', borderColour);
	},
	displayBlock: function(shelfType, top, left) {
		$('#group-creator')
			.attr('shelf-type', shelfType) // register shelfType
			.css('display', 'block')
			.css('top', top)
			.css('left', left);
	},
	show: function(shelfType, top, left, inputObject = null, editing = false) {
		const self = this;		

		// display the correct menu
		if ((shelfType == 'top' || shelfType == 'bottom') && !editing) {
			self.displayBlock(shelfType, top, left);
			GroupCreatorMenu.showMinimizedCategorical();
			GroupCreatorTabs.clearRules();
			GroupCreatorTabs.show();
			GroupCreatorTabs.setActive('and');
			GroupCreatorInputBox.clear();
			GroupCreatorInputBox.Placeholder.change(shelfType);
		}

		if ((shelfType == 'top' || shelfType == 'bottom') && editing) {
			self.displayBlock(shelfType, top, left);
			GroupCreatorMenu.showMinimizedCategorical();
			GroupCreatorTabs.restoreRules(inputObject);
			GroupCreatorTabs.show();
			GroupCreatorTabs.setActive('and');
			GroupCreatorInputBox.restoreRules();
			GroupCreatorInputBox.Placeholder.change(shelfType);
		}

		if (shelfType == 'attribute') {
			self.displayBlock(shelfType, top, left);
			GroupCreatorMenu.showAttribute();
			GroupCreatorTabs.clearRules();
			GroupCreatorTabs.hide();
			GroupCreatorInputBox.clear();
			GroupCreatorInputBox.Placeholder.change(shelfType);
		}
		
		if (shelfType == 'base') {
			self.displayBlock(shelfType, top, left);
			GroupCreatorMenu.showMinimizedCategorical();
			GroupCreatorTabs.restoreRules(inputObject);
			GroupCreatorTabs.setActive('and');
			GroupCreatorTabs.hide();
			GroupCreatorInputBox.restoreRules();
			GroupCreatorInputBox.Placeholder.change(shelfType);
		}

		if (shelfType == 'inclusion') {
			self.displayBlock(shelfType, top, left);
			GroupCreatorMenu.showMinimizedCategorical();
			GroupCreatorTabs.restoreRules(inputObject);
			GroupCreatorTabs.setActive('add');
			GroupCreatorTabs.hide();
			GroupCreatorInputBox.restoreRules();
			GroupCreatorInputBox.Placeholder.change(shelfType);
		}
		
		if (shelfType == 'exclusion') {
			self.displayBlock(shelfType, top, left);
			GroupCreatorMenu.showMinimizedCategorical();
			GroupCreatorTabs.restoreRules(inputObject);
			GroupCreatorTabs.setActive('remove');
			GroupCreatorTabs.hide();
			GroupCreatorInputBox.restoreRules();
			GroupCreatorInputBox.Placeholder.change(shelfType);
		}

		// install rule element event
		RuleElement.installMouseEnterBehaviour();
		RuleElement.installClickBehaviour();
	},
	hide: function() {
		$('#group-creator').css('display', 'none');
		TableHighlightBox.hide();
		RuleElement.removeMouseEnterBehaviour();
		RuleElement.removeClickBehaviour();
	},

	// do the following on enter click outside

	convertInputToRules: function(inputObject) { // { and, add, remove, attribute }
		let shelfType = $('#group-creator').attr('shelf-type');
		let isGroupShelf = (shelfType == 'top' || shelfType == 'bottom' || shelfType == 'base' || shelfType == 'inclusion' || shelfType == 'exclusion');
		let ruleObject = { and: [], add: [], remove: [], attribute: [] };

		for (let currentTabType in inputObject) {
			let ruleInputForCurrentTab = inputObject[currentTabType];
			let splittedRuleInput = ruleInputForCurrentTab.split(';');

			if (ruleInputForCurrentTab == '')
				continue;

			for (let i = 0; i < splittedRuleInput.length; i++) {
				let currentRule = splittedRuleInput[i];
				let sortedAttributeNames = null, mostSimilarAttribute = null, unprocessedAttrValueObject = null;
				let attributeName = null, attributeValueObject = null, systemGeneratedRule = null;

				if (currentRule == '')
					continue;

				// convert to systemGeneratedRule
				if (currentTabType == 'and' || currentTabType == 'add' || currentTabType == 'remove') {
					[ sortedAttributeNames, mostSimilarAttribute, unprocessedAttrValueObject ] = GroupCreatorInputBox.extractInformationFromRule(currentRule);
					attributeName = mostSimilarAttribute;

					if ('mostSimilarCategory' in unprocessedAttrValueObject)
						attributeValueObject = { category: unprocessedAttrValueObject.mostSimilarCategory };
					if ('lowerValue' in unprocessedAttrValueObject)
						attributeValueObject = unprocessedAttrValueObject;
					if ('mostSimilarCategory' in unprocessedAttrValueObject && unprocessedAttrValueObject.mostSimilarCategory == null)
						attributeValueObject = null;
					if ('lowerValue' in unprocessedAttrValueObject && unprocessedAttrValueObject.lowerValue == null && unprocessedAttrValueObject.upperValue == null)
						attributeValueObject = null;

					systemGeneratedRule = GroupCreatorInputBox.Rule.generate(isGroupShelf, attributeName, attributeValueObject);
				}
				if (currentTabType == 'attribute') {
					[ sortedAttributeNames, mostSimilarAttribute ] = GroupCreatorInputBox.extractInformationFromRule(currentRule, isGroupShelf = false);
					attributeName = mostSimilarAttribute;
					systemGeneratedRule = GroupCreatorInputBox.Rule.generate(isGroupShelf, attributeName);
				}

				// save rule
				ruleObject[currentTabType].push(systemGeneratedRule);
			}
		}

		return ruleObject;
	},
	isInvalidInput: function(ruleObject) { // { and: [], add: [], remove: [], attribute: [] }
		if (ruleObject.and.length == 0 && ruleObject.add.length == 0 && ruleObject.remove.length == 0 && ruleObject.attribute.length == 0)
			return false;
		
		let shelfType = $('#group-creator').attr('shelf-type');
		let isTopGroupShelf = (shelfType == 'top');
		let isBottomGroupShelf = (shelfType == 'bottom');
		let isGroupEditorShelf = (shelfType == 'base' || shelfType == 'inclusion' || shelfType == 'exclusion');
		let partialSpecificationCount = 0, onlyPartialRule = null; // only partial rule is the first partial rule
		let isPartialSpecification = true, isMultiplePartialSpecification = false, tooManyUniqueValuesForPartialSpec = false;
		let inputBoxPosition = $('#group-creator .input-box').offset(), inputBoxHeight = $('#group-creator .input-box').height();
		let tooltipText = null;

		// check isPartialSpecification
		for (let currentTabType in ruleObject) {
			let rulesForCurrentTab = ruleObject[currentTabType];

			for (let i = 0; i < rulesForCurrentTab.length; i++) {
				let currentRule = rulesForCurrentTab[i];
				let isCurrentRulePartialSpecification = (currentRule.indexOf('=??') != -1);

				if (!isCurrentRulePartialSpecification) // not found, at least one not partial
					isPartialSpecification = false;
				if (isCurrentRulePartialSpecification) {
					onlyPartialRule = currentRule
					partialSpecificationCount++;
				}
			}
		}

		// check isMultiplePartialSpecification
		if (isPartialSpecification && partialSpecificationCount > 1)
			isMultiplePartialSpecification = true;

		// check tooManyUniqueValuesForPartialSpec
		if (isPartialSpecification  && !isMultiplePartialSpecification) {
			let attributeNameInPartialRule = Helpers.parseAttributeName(onlyPartialRule);
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[attributeNameInPartialRule] == 'numerical';
			let numberOfUniqueValues = 0;

			if (!isCurrentAttributeNumerical)
				numberOfUniqueValues = Database.metadata[attributeNameInPartialRule].uniqueValues.length;
			if (!isCurrentAttributeNumerical && numberOfUniqueValues > 1500)
				tooManyUniqueValuesForPartialSpec = true;
		}

		// determine tooltip text
		if (isBottomGroupShelf && isMultiplePartialSpecification) 
			tooltipText = 'Multiple Partial Specification Not Allowed!';
		if (isTopGroupShelf && isPartialSpecification)
			tooltipText = 'Partial Specification Not Allowed for Top Shelf!';
		if (isGroupEditorShelf && isPartialSpecification)
			tooltipText = 'Partial Specification Not Allowed!';
		if (isPartialSpecification && !isMultiplePartialSpecification && tooManyUniqueValuesForPartialSpec)
			tooltipText = 'Partial Specification Not Allowed for Attributes with Too Many Unique Values!';

		// show
		if (tooltipText !== null) {
			$('#tooltip')
				.attr('data-tooltip', tooltipText)
				.css('top', inputBoxPosition.top + inputBoxHeight / 2 + 1.5 + 8) // 3 is border, 8 is padding
				.css('left', inputBoxPosition.left - 5)
				.addClass('show')
				.addClass('left');

			$('#group-creator .input-box').focus();
			setTimeout(function() {
				$('#tooltip').removeClass('show');
			}, 700);

			return true;
		}

		return false;
	},
	pushRulesToShelf: function(ruleObject, inputObject) {
		let shelfType = $('#group-creator').attr('shelf-type');
		let isEditingGroup = $('#sidebar .shelves .shelf .container .group.editing').length != 0;
		let isViewingGroup = (shelfType == 'base' || shelfType == 'inclusion' ||  shelfType == 'exclusion');
		let isAddingNewGroupsOrAttributes = !isEditingGroup && !isViewingGroup; // only three possible cases
		let isInputBoxEmpty = (ruleObject.and.length == 0 &&  ruleObject.add.length == 0 && 
							   ruleObject.remove.length == 0 && ruleObject.attribute.length == 0);

		Shelf.show('top');
		Shelf.show('bottom');
		Shelf.show('attribute');
		GroupEditor.showShelf('base');
		GroupEditor.showShelf('inclusion');
		GroupEditor.showShelf('exclusion');
		GroupCreator.hide();

		if (!isInputBoxEmpty) {
			// less heavy computations
			if (isEditingGroup) {
				let editingGroupObject = d3.select('#sidebar .shelves .shelf .container .group.editing').datum();
				let originalInputs = editingGroupObject.originalInputObject;
				let isInputChanged = (originalInputs.and != inputObject.and) ||  (originalInputs.add != inputObject.add) || 
									 (originalInputs.remove != inputObject.remove) || (originalInputs.attribute != inputObject.attribute);

				if (!isInputChanged) return;
				Shelf.changeRulesInEditingGroup(ruleObject, inputObject);
				GroupEditor.update();
			}
			if (isViewingGroup) {
				let viewingGroupObject = GroupEditor.currentGroupObject;
				let originalInputs = viewingGroupObject.originalInputObject;
				let isInputChanged = (originalInputs.and != inputObject.and) || (originalInputs.add != inputObject.add) || 
									 (originalInputs.remove != inputObject.remove) || (originalInputs.attribute != inputObject.attribute);

				if (!isInputChanged) return;
				Shelf.changeRulesInViewingGroup(ruleObject, inputObject);
				GroupEditor.update();
			}
			if (isAddingNewGroupsOrAttributes) {
				Shelf.createNewGroupsOrAttributes(ruleObject, inputObject);
				GroupEditor.update();
			}

			// show loader if result panel will update
			if (Shelf.data.top.length >= 1 && 
				Shelf.data.bottom.length >= 1)
				ResultPanel.showLoader();

			// handle heavy computation
			setTimeout(function() {
				Shelf.update();
				ResultPanel.update();
				if (isViewingGroup) GroupViewer.update();
				ResultPanel.removeLoader();
			}, 10);	
		}
	}
}