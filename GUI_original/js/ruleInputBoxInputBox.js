const RuleInputBoxInputInputBox = {
	spanBeforeCursorEl: null,
	spanAfterCursorEl: null,
	selectedSpanEl: null,

	init: function() {
		const self = this;

		self.installMouseenterAddButtonBehaviour();
		self.installClickAddButtonBehaviour();
		self.installClickInputBoxBehaviour();
	},
	installMouseenterAddButtonBehaviour: function() {
		$('#rule-input-box .input-box .fa-plus-circle').mouseenter(mouseenterAddButton);
		$('#rule-input-box .input-box .fa-plus-circle').mouseleave(mouseleaveAddButton);

		function mouseenterAddButton() {
			var inputBoxPosition = $('#rule-input-box .input-box').offset();
			var inputBoxHeight = $('#rule-input-box .input-box').height();

			$('#tooltip')
				.attr('data-tooltip', 'Click to add group')
				.css('top', inputBoxPosition.top + inputBoxHeight / 2 + 3) // 3 is border
				.css('left', inputBoxPosition.left - 5)
				.addClass('show')
				.addClass('left');
		}

		function mouseleaveAddButton() {
			$('#tooltip').removeClass('show')
		}
	},
	installClickAddButtonBehaviour: function() {
		const self = this;

		$('#rule-input-box .input-box .fa-plus-circle').click(clickAddButton);

		function clickAddButton() {
			RuleInputBox.onAddToShelf();
		}
	},
	installClickInputBoxBehaviour: function() {
		const self = this;

		$('#rule-input-box .input-box .rule-container').click(clickRuleContainer);

		function clickRuleContainer(event) {
			let mouseX = event.pageX;
        	let mouseY = event.pageY;
        	let cursorHeight = $('#blinking-cursor').height();

			let cursorTop = self.Cursor.getStartPositionTop();
        	let cursorLeft = self.Cursor.getStartPositionLeft();
        	let closestRuleEl = null;
        	let closestRuleFound = false;
        	let mouseCloserToLeftEdge = false;
        	let isAttributeShelfOpened = $('#rule-input-box .attribute-only.menu').css('display') == 'block';

        	let clickedRule = $(event.target).closest('.rule .content').length != 0;
        	let clickedRemove = $(event.target).closest('.rule .fa-times').length != 0;

        	// not show cursor if clicked rule
        	if (clickedRule && !clickedRemove) self.Cursor.hide();
        	if (clickedRule) return;

        	// look for the right position to insert cursor
        	$('#rule-input-box .input-box .rule-container .rule .content').each(function(i) {
        		let currentRulePos = $(this).offset()
        		let currentRuleHeight = $(this).height();
        		let currentRuleWidth = $(this).width();

        		let currentRuleLeft = currentRulePos.left;
        		let currentRuleRight = currentRulePos.left + currentRuleWidth;
        		let currentRuleTop = currentRulePos.top;
        		let currentRuleBottom = currentRulePos.top + currentRuleHeight;

        		let currentRuleOnTheSameLineAsCursor = (mouseY > currentRuleTop) && (mouseY < currentRuleBottom);
        		let distanceFromLeftEdge = Math.abs(currentRuleLeft - mouseX);
        		let distanceFromRightEdge = Math.abs(currentRuleRight - mouseX);

        		if (currentRuleOnTheSameLineAsCursor && distanceFromLeftEdge <= distanceFromRightEdge) {
        			cursorTop = currentRuleTop - cursorHeight / 2 + currentRuleHeight / 2 + 1;
        			cursorLeft = currentRuleLeft - 5;
        			closestRuleEl = this.parentNode;
        			mouseCloserToLeftEdge = true;
        			closestRuleFound = true;
        		}

        		if (currentRuleOnTheSameLineAsCursor && distanceFromLeftEdge > distanceFromRightEdge) {
        			cursorTop = currentRuleTop - cursorHeight / 2 + currentRuleHeight / 2 + 1;
        			cursorLeft = currentRuleRight + 8;
        			closestRuleEl = this.parentNode;
        			closestRuleFound = true;
        		}
        	});

        	// store the closest element and show cursor
        	if (closestRuleFound && mouseCloserToLeftEdge) {
        		self.saveSpanEl({ after: closestRuleEl });
        		self.Cursor.show(cursorTop, cursorLeft);
        	}
        	if (closestRuleFound && !mouseCloserToLeftEdge) {
        		self.saveSpanEl({ before: closestRuleEl });
        		self.Cursor.show(cursorTop, cursorLeft);
        	}

        	// restore menu
        	if (isAttributeShelfOpened && closestRuleFound) {
        		RuleInputBoxAttributeMenu.show(fadeIn = false);
				RuleInputBoxAttributeMenu.AttributeNameList.display(scrollTop = 0);
				RuleInputBoxAttributeMenu.AttributeNameList.installClick();
				RuleInputBoxAttributeMenu.AttributeNameSearchBox.clear();
        	}
			if (!isAttributeShelfOpened && closestRuleFound) {
				RuleInputBoxCategoricalMenu.show(fadeIn = false);
				RuleInputBoxCategoricalMenu.AttributeNameList.display(scrollTop = 0);
				RuleInputBoxCategoricalMenu.AttributeNameList.installClick();
				RuleInputBoxCategoricalMenu.AttributeValueList.hide();
				RuleInputBoxCategoricalMenu.AttributeValueList.clear();
				RuleInputBoxCategoricalMenu.AttributeNameSearchBox.clear();
				RuleInputBoxCategoricalMenu.AttributeValueSearchBox.clear();
			}
		}	
	},
	saveSpanEl: function(spanObject) {
		const self = this;

		self.spanBeforeCursorEl = ('before' in spanObject) ? spanObject.before : null;
		self.spanAfterCursorEl = ('after' in spanObject) ? spanObject.after : null;
		self.selectedSpanEl = ('selected' in spanObject) ? spanObject.selected : null;
	},
	Rule: {
		add: function(shelfType, attributeName, attributeValueObject = null) {
			const self = RuleInputBoxInputInputBox;

			self.Cursor.hide();
			self.Rule.createTag(shelfType, attributeName, attributeValueObject);
			self.Rule.installClickBehaviour();
			self.Rule.installMouseenterBehaviour();
			self.Rule.installMouseleaveBehaviour();
		},
		clear: function() {
			$('#rule-input-box .input-box .rule-container').html('')
		},
		islreadyAdded: function(attributeNameToBeAdded) {
			const self = RuleInputBoxInputInputBox;
			const allAddedAttributeNames = [];

			// get added attribute names
			$('#rule-input-box .input-box .rule-container .rule .content').each(function() {
				let rule = $(this.parentNode).attr('rule');
				let currentAttributeName = Helpers.parseAttributeName(rule);

				allAddedAttributeNames.push(currentAttributeName);
			});

			// attribute names already added, show error message
			if (allAddedAttributeNames.indexOf(attributeNameToBeAdded) != -1) {
				var ruleContainerPosition = $('#rule-input-box .input-box .rule-container').offset();
				var ruleContainerHeight = $('#rule-input-box .input-box .rule-container').height();

				$('#tooltip')
					.attr('data-tooltip', 'Attribute already added!')
					.css('top', ruleContainerPosition.top + ruleContainerHeight / 2 + 6) // 6 is border
					.css('left', ruleContainerPosition.left - 5)
					.addClass('show')
					.addClass('left');

				setTimeout(function(){
					$('#tooltip')
						.removeClass('show');
				}, 700);

				return true;
			}

			// attribute names not added yet
			if (allAddedAttributeNames.indexOf(attributeNameToBeAdded) == -1)
				return false;
		},
		confirm: function() {
			const self = RuleInputBoxInputInputBox;
			let isAttributeShelfOpened = $('#rule-input-box .attribute-only.menu').css('display') == 'block';
			let hasSelectedRule = $('#rule-input-box .input-box .rule-container .rule.selected').length != 0;
			let selectedRuleEl = $('#rule-input-box .input-box .rule-container .rule.selected')[0];
			let selectedRuleContentEl = $('#rule-input-box .input-box .rule-container .rule.selected .content')[0];
			let cursorHeight = $('#blinking-cursor').height();
			let selectedRulePos = null, selectedRuleHeight = null, selectedRuleWidth = null;
			let selectedRuleTop = null, selectedRuleLeft = null, selectedRuleBottom = null, selectedRuleRight = null;
			let cursorTop = null, cursorLeft = null;

			// continue only when there is a selected rule
			if (!hasSelectedRule)
				return;

			// save span and show cursor
			selectedRulePos = $(selectedRuleContentEl).offset();
			selectedRuleHeight = $(selectedRuleContentEl).height();
			selectedRuleWidth = $(selectedRuleContentEl).width();
			selectedRuleTop = selectedRulePos.top;
			selectedRuleLeft = selectedRulePos.left;
			selectedRuleBottom = selectedRuleTop + selectedRuleHeight;
			selectedRuleRight = selectedRuleLeft + selectedRuleWidth;
			cursorTop = selectedRuleTop - cursorHeight / 2 + selectedRuleHeight / 2 + 1;
			cursorLeft = selectedRuleRight + 8;
			self.saveSpanEl({ before: selectedRuleEl });
			self.Cursor.show(cursorTop, cursorLeft);

			// restore menu
			if (isAttributeShelfOpened) {
				RuleInputBoxAttributeMenu.show(fadeIn = false);
				RuleInputBoxAttributeMenu.AttributeNameList.display(scrollTop = 0);
				RuleInputBoxAttributeMenu.AttributeNameList.installClick();
				RuleInputBoxAttributeMenu.AttributeNameSearchBox.clear();
			}
			if (!isAttributeShelfOpened) {
				RuleInputBoxCategoricalMenu.show(fadeIn = false);
				RuleInputBoxCategoricalMenu.AttributeNameList.display(scrollTop = 0);
				RuleInputBoxCategoricalMenu.AttributeNameList.installClick();
				RuleInputBoxCategoricalMenu.AttributeValueList.hide();
				RuleInputBoxCategoricalMenu.AttributeValueList.clear();
				RuleInputBoxCategoricalMenu.AttributeNameSearchBox.clear();
				RuleInputBoxCategoricalMenu.AttributeValueSearchBox.clear();
			}
		},
		generate: function(isGroupShelf, attributeName, attributeValueObject) {
			let hasRange = (attributeValueObject !== null) && 'lowerValue' in attributeValueObject;
			let hasCategory = (attributeValueObject !== null) && 'category' in attributeValueObject;
			let rule = '';

			if (!isGroupShelf)
				rule = attributeName;
			if (isGroupShelf && attributeValueObject === null)
				rule = attributeName + '=??';
			if (isGroupShelf && hasCategory)
				rule = attributeName + '=' + attributeValueObject.category;
			if (isGroupShelf && hasRange)
				rule = attributeValueObject.lowerValue + '<=' + attributeName + '<=' + attributeValueObject.upperValue;

			return rule;
		},
		createTag: function(shelfType, attributeName, attributeValueObject) {
			const self = RuleInputBoxInputInputBox;
			let isGroupShelf = shelfType == 'top' || shelfType == 'bottom' || shelfType == 'base' || shelfType == 'inclusion' || shelfType == 'exclusion';
			let isInputBoxEmpty = $('#rule-input-box .input-box .rule-container').is(':empty');
			let shortAttributeNameLength = isGroupShelf ? 18 : 32;
			let shortAttributeValueLength = 23; // attribute shelf have no value object
			let shortAttributeName = Helpers.generateShortName(attributeName, shortAttributeNameLength);
			let shortAttributeValueObject = (attributeValueObject != null && 'category' in attributeValueObject) 
										  ? { 'category': Helpers.generateShortName(attributeValueObject.category, shortAttributeValueLength) } 
										  : attributeValueObject;

			let fullRule = self.Rule.generate(isGroupShelf, attributeName, attributeValueObject);
			let shortRule = self.Rule.generate(isGroupShelf, shortAttributeName, shortAttributeValueObject);
			let ruleHTML = '<div class="rule selected">' + 
								'<span class="content">' + shortRule + '<span class="fas fa-times"></span>' + 
						   '</div>';

			// create tag
			if (isInputBoxEmpty) { // append new span
				$('#rule-input-box .input-box .rule-container').append(ruleHTML);
				self.saveSpanEl({ selected: $('#rule-input-box .input-box .rule-container .rule:last-child')[0] });
				$(self.selectedSpanEl).attr('rule', fullRule);
			}

			else if (!isInputBoxEmpty && self.selectedSpanEl !== null) { // edit the currently selected span
				$(self.selectedSpanEl).html('<span class="content">' + shortRule + '<span class="fas fa-times"></span>');
				$(self.selectedSpanEl).attr('rule', fullRule);
			}

			else if (!isInputBoxEmpty && self.spanBeforeCursorEl !== null) { // insert span after
				$(ruleHTML).insertAfter(self.spanBeforeCursorEl);
				self.saveSpanEl({ selected: $(self.spanBeforeCursorEl).next()[0] });
				$(self.selectedSpanEl).attr('rule', fullRule);
			}

			else if (!isInputBoxEmpty && self.spanAfterCursorEl !== null) { // insert span before
				$(ruleHTML).insertBefore(self.spanAfterCursorEl);
				self.saveSpanEl({ selected: $(self.spanAfterCursorEl).prev()[0] });
				$(self.selectedSpanEl).attr('rule', fullRule);
			}
		},
		installClickBehaviour: function() {
			const self = RuleInputBoxInputInputBox;

			$('#rule-input-box .input-box .rule-container .rule .content').unbind('click').click(function(event) { // unbind to prevent multiple binding
				let currentRuleEl = this.parentNode;
				let rule = $(currentRuleEl).attr('rule');
				let isAttributeNameOnly = rule.indexOf('=') == -1;
				let attributeName = Helpers.parseAttributeName(rule);
				let attributeValue = Helpers.parseAttributeValue(rule);
				let isAttributeNumerical = Database.isCategoricalOrNumerical[attributeName] == 'numerical';
				let isPartialSpecification = ('category' in attributeValue) && (attributeValue.category == '??');
				
				let needToRemoveTag = $(event.target).closest('.fa-times').length != 0;
				let hasSelectedRule = $('#rule-input-box .input-box .rule-container .rule.selected').length != 0;
				let removeSelectedRule = $(event.target).closest('.rule.selected').length != 0;
				let isEmptyAfterRemoval = null;
				let cursorTop = self.Cursor.getStartPositionTop();
	        	let cursorLeft = self.Cursor.getStartPositionLeft();

	        	// restore menu if needed
	        	if (needToRemoveTag && !(hasSelectedRule && !removeSelectedRule)) {

	        		if (!isAttributeNameOnly) { // group shelf
	        			RuleInputBoxCategoricalMenu.show(fadeIn = false);
						RuleInputBoxCategoricalMenu.AttributeNameList.display(scrollTop = 0);
						RuleInputBoxCategoricalMenu.AttributeNameList.installClick();
						RuleInputBoxCategoricalMenu.AttributeValueList.hide();
						RuleInputBoxCategoricalMenu.AttributeValueList.clear();
						RuleInputBoxCategoricalMenu.AttributeNameSearchBox.clear();
						RuleInputBoxCategoricalMenu.AttributeValueSearchBox.clear();
	        		}

	        		if (isAttributeNameOnly) { // attribute shelf
	        			RuleInputBoxAttributeMenu.show(fadeIn = false);
						RuleInputBoxAttributeMenu.AttributeNameList.display(scrollTop = 0);
						RuleInputBoxAttributeMenu.AttributeNameList.installClick();
						RuleInputBoxAttributeMenu.AttributeNameSearchBox.clear();
	        		}
	        	}

	        	// show cursor if needed and exit on removal
	        	if (needToRemoveTag) {
	        		$(currentRuleEl).remove();
	        		$('#tooltip').removeClass('show');
	        		isEmptyAfterRemoval = $('#rule-input-box .input-box .rule-container').is(':empty');

	        		if (isEmptyAfterRemoval) {
	        			self.saveSpanEl({}); // remove all
	        			self.Cursor.show(cursorTop, cursorLeft);
	        		}

	        		if (!isEmptyAfterRemoval && !(hasSelectedRule && !removeSelectedRule)) {
	        			let cursorHeight = $('#blinking-cursor').height();
	        			let lastTagEl = $('#rule-input-box .input-box .rule-container .rule:last-child .content')[0];
	        			let lastRulePos = $(lastTagEl).offset()
        				let lastRuleHeight = $(lastTagEl).height();
        				let lastRuleWidth = $(lastTagEl).width();
        				let lastRuleLeft = lastRulePos.left;
        				let lastRuleRight = lastRulePos.left + lastRuleWidth;
        				let lastRuleTop = lastRulePos.top;
        				let lastRuleBottom = lastRulePos.top + lastRuleHeight;
	        			let cursorTop = lastRuleTop - cursorHeight / 2 + lastRuleHeight / 2 + 1;
        				let cursorLeft = lastRuleRight + 8;

        				self.saveSpanEl({ before: lastTagEl.parentNode });
	        			self.Cursor.show(cursorTop, cursorLeft);
	        		}

					return;
	        	}

				// show tag information at the widget
				if (!isAttributeNameOnly && isAttributeNumerical) { // numerical attribute
					RuleInputBoxNumericalMenu.show(fadeIn = false);
					RuleInputBoxNumericalMenu.AttributeNameList.display(scrollTop = 0);
					RuleInputBoxNumericalMenu.AttributeNameList.select(attributeName, addRule = false);
					RuleInputBoxNumericalMenu.AttributeNameList.scrollTo(attributeName);
					RuleInputBoxNumericalMenu.AttributeNameList.installClick();
					RuleInputBoxNumericalMenu.AttributeNameSearchBox.clear();

					if (!isPartialSpecification) {
						RuleInputBoxNumericalMenu.Slider.updateValues([ attributeValue.lowerValue, attributeValue.upperValue ]);
						RuleInputBoxNumericalMenu.Slider.updateHandles();
					}
				}

				if (!isAttributeNameOnly && !isAttributeNumerical) { // categorical attribute
					RuleInputBoxCategoricalMenu.show(fadeIn = false);
					RuleInputBoxCategoricalMenu.AttributeNameList.display(scrollTop = 0);
					RuleInputBoxCategoricalMenu.AttributeNameList.select(attributeName, addRule = false);
					RuleInputBoxCategoricalMenu.AttributeNameList.scrollTo(attributeName);
					RuleInputBoxCategoricalMenu.AttributeNameList.installClick();
					RuleInputBoxCategoricalMenu.AttributeNameSearchBox.clear();
					RuleInputBoxCategoricalMenu.AttributeValueSearchBox.clear();

					if (!isPartialSpecification) {
						RuleInputBoxCategoricalMenu.AttributeValueList.select(attributeValue.category);
						RuleInputBoxCategoricalMenu.AttributeValueList.scrollTo(attributeValue.category);
					}
				}

				if (isAttributeNameOnly) { // attribute shelf attribute
					RuleInputBoxAttributeMenu.show(fadeIn = false);
					RuleInputBoxAttributeMenu.AttributeNameList.display(scrollTop = 0);
					RuleInputBoxAttributeMenu.AttributeNameList.select(attributeName, addRule = false);
					RuleInputBoxAttributeMenu.AttributeNameList.scrollTo(attributeName);
					RuleInputBoxAttributeMenu.AttributeNameList.installClick();
					RuleInputBoxAttributeMenu.AttributeNameSearchBox.clear();
				}

				// changes look and save
				$('#rule-input-box .input-box .rule-container .rule').removeClass('selected');
				$(currentRuleEl).addClass('selected');
				self.saveSpanEl({ selected: currentRuleEl });
			});
		},
		installMouseenterBehaviour: function() {
			const self = RuleInputBoxInputInputBox;

			$('#rule-input-box .input-box .rule-container .rule').unbind('mouseenter').mouseenter(function(event) { // unbind to prevent multiple binding
				let displayedRule = $(this).text();
				let storedRule = $(this).attr('rule');
				let rulePosition = $(this).offset();
				let ruleContainerPosition = $('#rule-input-box .input-box .rule-container').offset();
				let ruleHeight = $(this).height();

				if (displayedRule != storedRule) {
					$('#tooltip')
						.attr('data-tooltip', storedRule)
						.css('top', rulePosition.top + ruleHeight / 2) // 6 is border
						.css('left', ruleContainerPosition.left - 7)
						.addClass('show')
						.addClass('left');
				}
			});
		},
		installMouseleaveBehaviour: function() {
			const self = RuleInputBoxInputInputBox;

			$('#rule-input-box .input-box .rule-container .rule').unbind('mouseleave').mouseleave(function(event) { // unbind to prevent multiple binding
				let displayedRule = $(this).text();
				let storedRule = $(this).attr('rule');

				if (displayedRule != storedRule)
					$('#tooltip').removeClass('show');
			});
		},
		getAllRulesFromInputBox: function() {
			let allRules = [];

			$('#rule-input-box .input-box .rule-container .rule').each(function() {
				let currentRule = $(this).attr('rule');
				allRules.push(currentRule);
			});

			return allRules;
		}
	},
	Placeholder: {
		change: function(shelfName) {
			let placeHolder = '';

			if (shelfName == 'top' || shelfName == 'bottom' || shelfName == 'base' || shelfName == 'inclusion' || shelfName == 'exclusion')
				placeHolder = 'Add a rule to define a group';
			if (shelfName == 'attribute')
				placeHolder = 'Add an attribute';

			$('#rule-input-box .input-box .rule-container')
				.attr('data-text', placeHolder);
		}
	},
	Cursor: {
		show: function(top , left) {
			$('#blinking-cursor')
				.css('display', 'block')
				.css('top', top)
				.css('left', left);

			$('#rule-input-box .input-box .rule-container .rule')
				.removeClass('selected');
		},
		hide: function() {
			$('#blinking-cursor')
				.css('display', 'none');
		},
		getStartPositionTop: function() {
			return $('#rule-input-box .input-box .rule-container').offset().top + 4;
		},
		getStartPositionLeft: function() {
			return $('#rule-input-box .input-box .rule-container').offset().left + 5;
		}
	}
}