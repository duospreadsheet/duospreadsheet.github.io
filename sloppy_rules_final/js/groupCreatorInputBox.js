const GroupCreatorInputBox = {
	previousInput: '',

	init: function() {
		const self = this;

		self.installInputBehaviour();
	},
	installInputBehaviour: function() {
		let self = this;

		$('#group-creator .rule-editor .input-box')
			.on('click', clickInputBox)
			.on('keydown', keydownInputBox)
			.on('input', keyupInputBox); // input can detect long press

		function clickInputBox() {
			if ($(this).text() === '')
				return;

			let selection = window.getSelection();
			let range = selection.getRangeAt(0);
			let selectedSpanEl = range.commonAncestorContainer.parentNode;
			let isSelectedSpanARule = $(selectedSpanEl).hasClass('rule');
			let selectedSpanHasNextRule = $(selectedSpanEl).next('.rule').length != 0;
			let selectedRuleEl = null, selectedRule = null;

			// get data
			if (isSelectedSpanARule) { selectedRuleEl = selectedSpanEl; selectedRule = $(selectedRuleEl).text(); } // selected a rule
			if (!isSelectedSpanARule && selectedSpanHasNextRule) { selectedRuleEl = $(selectedSpanEl).next('.rule')[0]; selectedRule = $(selectedRuleEl).text(); } // selected ;, find next rule
			if (!isSelectedSpanARule && !selectedSpanHasNextRule) return; // selected more than one rule

			// highlight selected rule and show menu
			self.Rule.highlight(selectedRuleEl);
			GroupCreatorMenu.showMenuBasedOnRule(selectedRule);
		}

		function keydownInputBox() {
			let keyCode = window.event ? event.which : event.keyCode;
			let pressedEnter = (event.keyCode === 13);
			self.previousInput = $(this).text();

			if (pressedEnter) {
				$(this).blur();
				event.preventDefault(); // prevent new line
			}
		}

		function keyupInputBox() {
			let shelfType = $('#group-creator').attr('shelf-type');
			let currentInput = $(this).text();
			let currentRule = self.extractCurrentRule(self.previousInput, currentInput);

			// restructure input box content and show menu
			self.restructureInputBoxTextOnInput();
			GroupCreatorMenu.showMenuBasedOnRule(currentRule);
		}
	},
	extractCurrentRule: function(previousInput, currentInput) {
		let previousRuleList = previousInput.split(';');
		let currentRuleList = currentInput.split(';');

		if (currentRuleList.length > previousRuleList.length) // add ;
			return currentRuleList[currentRuleList.length - 1];

		for (let i = 0; i < currentRuleList.length; i++) { // edit rule
			let currentRule = currentRuleList[i];
			let previousRule = previousRuleList[i];

			if (currentRule !== previousRule)
				return currentRule;
		}

		return '';
	},
	extractInformationFromRule: function(rule, isGroupShelf = true) {
		let lowerCaseRule = rule.toLowerCase();
		let sortedAttrNamesAndValues = null, mostSimilarMatchIsAttrName = null;
		let sortedAttributeNames = null, mostSimilarAttribute = null, attributeValueObject = null;

		if (isGroupShelf) {
			[ attributeNameInRule, 
			  ruleWithoutAttrName, 
			  seperatedAttrFromValue ] = GroupCreatorHelpers.seperateAttrNameFromNonAttrName(lowerCaseRule);

			if (seperatedAttrFromValue) {
				sortedAttributeNames = GroupCreatorHelpers.computeSimilarAttributeList(attributeNameInRule);
				mostSimilarAttribute = sortedAttributeNames[0];
				attributeValueObject = GroupCreatorHelpers.extractAttributeValueObject(ruleWithoutAttrName, mostSimilarAttribute);
			}

			if (!seperatedAttrFromValue) {
				[ mostSimilarMatchIsAttrName,
				  sortedAttributeNames,
				  sortedMostSimilarValueList, // it is the value list for the attribute that corresponds to the most similar value
				  mostSimilarValueCorrAttr ] = GroupCreatorHelpers.computeSimilarAttrNamesAndValues(lowerCaseRule);

				if (mostSimilarMatchIsAttrName) {
					sortedAttributeNames = sortedAttributeNames;
					mostSimilarAttribute = sortedAttributeNames[0];
					attributeValueObject = (Database.isCategoricalOrNumerical[mostSimilarAttribute] == 'numerical')
										 ? GroupCreatorHelpers.extractNumbers(lowerCaseRule, mostSimilarAttribute)
										 : { sortedCategories: Database.metadata[mostSimilarAttribute].uniqueValues, mostSimilarCategory: null };
				}
				if (!mostSimilarMatchIsAttrName) {
					sortedAttributeNames = Object.keys(Database.metadata);
					mostSimilarAttribute = mostSimilarValueCorrAttr;
					attributeValueObject = {
						sortedCategories: sortedMostSimilarValueList, 
						mostSimilarCategory: sortedMostSimilarValueList[0]
					};
				}
			}
		
			return [ sortedAttributeNames, mostSimilarAttribute, attributeValueObject ];
		}

		if (!isGroupShelf) {
			sortedAttributeNames = GroupCreatorHelpers.computeSimilarAttributeList(lowerCaseRule);
			mostSimilarAttribute = sortedAttributeNames[0];

			return [ sortedAttributeNames, mostSimilarAttribute ];
		}
	},
	restructureInputBoxTextOnInput: function() {
		let inputboxEl = $('#group-creator .rule-editor .input-box')[0];
		let input = $('#group-creator .rule-editor .input-box').text();
		let splittedInput = input.split(';');
		let inputWithSpan = '';

		let selection = window.getSelection();
		let oldRange = selection.getRangeAt(0);
		let newRange = document.createRange();
		let caretPositionInSpan = oldRange.endOffset;
		let caretPositionInInput = 0;
		let editedTextNodeEl = oldRange.commonAncestorContainer;
		let editedTextOldParentSpanEl = editedTextNodeEl.parentNode;
		let editedTextNewParentSpanEl = null;

		// find caretPositionInInput
		$(inputboxEl).find('span').each(function() {
	    	if (this == editedTextOldParentSpanEl) return false;
  			caretPositionInInput += $(this).text().length;
		});
		caretPositionInInput += caretPositionInSpan;

		// create html
	    if (input.indexOf(';') == -1) {
	    	// set html
	    	inputWithSpan = '<span class="rule">' + input + '</span>';
	      	$(inputboxEl).html(inputWithSpan);
	      
	      	// set editedTextNewParentSpanEl
	      	editedTextNewParentSpanEl = $(inputboxEl).find('span')[0];
	    }

	    if (input.indexOf(';') != -1) {
	    	let currentTextLengthCount = 0;
	     	let newCaretPositionInSpan = caretPositionInInput;
	      
		    // set html
		    for (let i = 0; i < splittedInput.length; i++) {
		    	inputWithSpan += '<span class="rule">' + splittedInput[i] + '</span>';
		        inputWithSpan += (i != splittedInput.length - 1) ? '<span class="semi-colon">;</span>' : '';
		    }
		    $(inputboxEl).html(inputWithSpan);
	      
	      	// find editedTextNewParentSpanEl
	      	$(inputboxEl).find('span').each(function() {
	      		let currentTextLength = $(this).text().length;
	      		currentTextLengthCount += currentTextLength;
	        
	        	if (currentTextLengthCount < caretPositionInInput)
	        		newCaretPositionInSpan -= currentTextLength;
	        	if (currentTextLengthCount >= caretPositionInInput) {
	          		editedTextNewParentSpanEl = this;
	          		return false;
	         	}
	      	});
	      	
	      	// save position
	      	caretPositionInSpan = newCaretPositionInSpan
	    }

	    // set selected if edited text is a rule
	    if ($(editedTextNewParentSpanEl).hasClass('rule'))
	    	$(editedTextNewParentSpanEl).addClass('selected');
	    else {
	    	let hasNextRule = $(editedTextNewParentSpanEl).next('.rule').length != 0;
	    	let nextRuleEl = $(editedTextNewParentSpanEl).next('.rule')[0];
	    	if (hasNextRule) $(nextRuleEl).addClass('selected');
	    }
	    
	    // reset caret position (if there is text inside span)
	    if (editedTextNewParentSpanEl.childNodes.length > 0) {
	    	let textNodeEl = editedTextNewParentSpanEl.childNodes[0];
	    	newRange.setStart(textNodeEl, caretPositionInSpan);
	    	newRange.collapse(true);
	    	selection.removeAllRanges();
	    	selection.addRange(newRange);
	    	$(inputboxEl).focus();
	    }
	    if (editedTextNewParentSpanEl.childNodes.length == 0) {
	    	$(editedTextNewParentSpanEl).remove();
	    	$(inputboxEl).focus();
	    }
	},
	clear: function() {
		$('#group-creator .input-box').html('');
		self.previousInput = '';
	},
	restoreRules: function() {
		const self = this;
		let allRulesInCurrentTab = null;
		let selectedRule = null;
		let selection = window.getSelection();
		let range = document.createRange();
		let inputboxEl = $('#group-creator .input-box')[0];

		if ($('#group-creator .rule-editor .tabs .tab.selected').hasClass('and-tab'))
			allRulesInCurrentTab = GroupCreatorTabs.currentRules.and;
		else if ($('#group-creator .rule-editor .tabs .tab.selected').hasClass('add-tab'))
			allRulesInCurrentTab = GroupCreatorTabs.currentRules.add;
		else if ($('#group-creator .rule-editor .tabs .tab.selected').hasClass('remove-tab'))
			allRulesInCurrentTab = GroupCreatorTabs.currentRules.remove;

		// restructure input
		if (allRulesInCurrentTab == '') {
			selectedRule = '';
			$(inputboxEl).html('');
			placeCaretAtEnd(inputboxEl);
		}
		if (allRulesInCurrentTab != '' && allRulesInCurrentTab.indexOf(';') == -1) {
			selectedRule = allRulesInCurrentTab;
	      	$(inputboxEl).html('<span class="rule selected">' + allRulesInCurrentTab + '</span>');
	      	placeCaretAtEnd(inputboxEl);
		}
	    if (allRulesInCurrentTab != '' && allRulesInCurrentTab.indexOf(';') != -1) {
	    	let splittedInput = allRulesInCurrentTab.split(';');
	    	let currentRulesHTML = '';
	    	
	    	for (let i = 0; i < splittedInput.length; i++) {
	    		if (i != splittedInput.length - 1) {
	    			currentRulesHTML += '<span class="rule">' + splittedInput[i] + '</span>';
	    			currentRulesHTML += '<span class="semi-colon">;</span>';
	    		}
	    		if (i == splittedInput.length - 1) {
	    			currentRulesHTML += '<span class="rule selected">' + splittedInput[i] + '</span>';
	    			selectedRule = splittedInput[i];
	    		}
		    }

		    $(inputboxEl).html(currentRulesHTML);
		    placeCaretAtEnd(inputboxEl);
	    }

	    // show menu
	    GroupCreatorMenu.showMenuBasedOnRule(selectedRule);
	},
	Rule: {
		changeSelected: function(shelfType, attributeName, attributeValueObject = null) {
			const self = GroupCreatorInputBox;
			let isGroupShelf = shelfType == 'top' || shelfType == 'bottom' || shelfType == 'base' || shelfType == 'inclusion' || shelfType == 'exclusion';
			let systemGeneratedRule = self.Rule.generate(isGroupShelf, attributeName, attributeValueObject, showQuestionMarkIfNoAttrName = false);
			let hasSelectedRuleInSpan = $('#group-creator .input-box .rule.selected').length != 0;

			let selection = window.getSelection();
			let range = document.createRange();
			let textNodeEl = null;

			// change selected rule
			if (hasSelectedRuleInSpan)
				$('#group-creator .input-box .rule.selected')
					.text(systemGeneratedRule);
			if (!hasSelectedRuleInSpan) // the only case without active rule should be active
				$('#group-creator .input-box')
					.html('<span class="rule selected">' + systemGeneratedRule + '</span>');

			// reset cursor to end of selected rule
			textNodeEl = $('#group-creator .input-box .rule.selected')[0].childNodes[0];
			range.setStart(textNodeEl, systemGeneratedRule.length); // set to end
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);
			$('#group-creator .input-box').focus();

			return [ selection, range ]
		},
		generate: function(isGroupShelf, attributeName, attributeValueObject = null, showQuestionMarkIfNoAttrName = true) {
			let hasRange = (attributeValueObject !== null) && 'lowerValue' in attributeValueObject;
			let hasCategory = (attributeValueObject !== null) && 'category' in attributeValueObject;
			let rule = '';

			if (!isGroupShelf)
				rule = attributeName;
			if (isGroupShelf && attributeValueObject === null && !showQuestionMarkIfNoAttrName)
				rule = attributeName;
			if (isGroupShelf && attributeValueObject === null && showQuestionMarkIfNoAttrName)
				rule = attributeName + '=??';
			if (isGroupShelf && hasCategory)
				rule = attributeName + '=' + attributeValueObject.category;
			if (isGroupShelf && hasRange)
				rule = attributeValueObject.lowerValue + '<=' + attributeName + '<=' + attributeValueObject.upperValue;

			return rule;
		},
		saveData: function(ruleEl, sortedAttributeNames, mostSimilarAttribute, attributeValueObject) {
			$(ruleEl).data({
				sortedAttributeNames: sortedAttributeNames,
				mostSimilarAttribute: mostSimilarAttribute,
				attributeValueObject: attributeValueObject
			});
		},
		highlight: function(ruleEl) {
			$('#group-creator .rule-editor .input-box .rule').removeClass('selected');
			$(ruleEl).addClass('selected');
		}
	},
	Placeholder: {
		change: function(shelfType) {
			let placeHolder = '';

			if (shelfType == 'top' || shelfType == 'bottom' || shelfType == 'base' || shelfType == 'inclusion' || shelfType == 'exclusion')
				placeHolder = 'Enter rules seperated by ;';
			if (shelfType == 'attribute')
				placeHolder = 'Enter attributes seperated by ;';

			$('#group-creator .rule-editor .input-box')
				.attr('data-text', placeHolder);
		}
	}
}