const RuleElement = {
	selector: '.rule-element',
	
	// remember to handle dynamically change element!!
	installClickBehaviour: function() {
		const self = this;

		Body.removeClickEvent(self.selector);
		Body.registerClickEvent(self.selector, clickRuleElement);

		function clickRuleElement(event) {
			let ruleElementEl = $(event.target).closest(self.selector)[0];
			let hasClickedColumnIndex = $(event.target).closest('.column-index').length != 0;
			let hasClickedFilterRemoveButton = $(event.target).closest('.fa-times').length != 0;
			let attributeName = $(ruleElementEl).attr('attribute-name');
			let shelfType = $('#rule-input-box').attr('shelf-type');
			let showAttributeMenu = shelfType == 'attribute';
			let showNumericalMenu = !showAttributeMenu && Database.isCategoricalOrNumerical[attributeName] == 'numerical';
			let showCategoricalMenu = !showAttributeMenu && Database.isCategoricalOrNumerical[attributeName] != 'numerical';

			if (!hasClickedFilterRemoveButton && showNumericalMenu && !hasClickedColumnIndex) {
				let lowerValueString = $(ruleElementEl).attr('lower-value');
				let upperValueString = $(ruleElementEl).attr('upper-value');
				let lowerValue = parseFloat($(ruleElementEl).attr('lower-value'));
				let upperValue = parseFloat($(ruleElementEl).attr('upper-value'));
				let attributeValueObject = { lowerValue: lowerValue, upperValue: upperValue };

				if (lowerValueString !== '' && upperValueString !== '') {
					RuleInputBoxInputInputBox.Rule.add(shelfType, attributeName, attributeValueObject);
					RuleInputBoxNumericalMenu.show(fadeIn = false);
					RuleInputBoxNumericalMenu.AttributeNameList.display(scrollTop = 0);
					RuleInputBoxNumericalMenu.AttributeNameList.select(attributeName, addRule = false);
					RuleInputBoxNumericalMenu.AttributeNameList.scrollTo(attributeName);
					RuleInputBoxNumericalMenu.AttributeNameList.installClick();
					RuleInputBoxNumericalMenu.AttributeNameSearchBox.clear();
					RuleInputBoxNumericalMenu.Slider.updateValues([ lowerValue, upperValue ]);
					RuleInputBoxNumericalMenu.Slider.updateHandles();
				}
			}

			if (!hasClickedFilterRemoveButton && showCategoricalMenu && !hasClickedColumnIndex) {
				let category = $(ruleElementEl).attr('category');
				let attributeValueObject = { category: category };

				if (category !== '') {
					RuleInputBoxInputInputBox.Rule.add(shelfType, attributeName, attributeValueObject);
					RuleInputBoxCategoricalMenu.show(fadeIn = false);
					RuleInputBoxCategoricalMenu.AttributeNameList.display(scrollTop = 0);
					RuleInputBoxCategoricalMenu.AttributeNameList.select(attributeName, addRule = false);
					RuleInputBoxCategoricalMenu.AttributeNameList.scrollTo(attributeName);
					RuleInputBoxCategoricalMenu.AttributeNameList.installClick();
					RuleInputBoxCategoricalMenu.AttributeNameSearchBox.clear();
					RuleInputBoxCategoricalMenu.AttributeValueSearchBox.clear();
					RuleInputBoxCategoricalMenu.AttributeValueList.select(category);
					RuleInputBoxCategoricalMenu.AttributeValueList.scrollTo(category);
				}
			}

			if (!hasClickedFilterRemoveButton && showAttributeMenu) {
				RuleInputBoxInputInputBox.Rule.add(shelfType, attributeName);
				RuleInputBoxAttributeMenu.show(fadeIn = false);
				RuleInputBoxAttributeMenu.AttributeNameList.display(scrollTop = 0);
				RuleInputBoxAttributeMenu.AttributeNameList.select(attributeName, addRule = false);
				RuleInputBoxAttributeMenu.AttributeNameList.scrollTo(attributeName);
				RuleInputBoxAttributeMenu.AttributeNameList.installClick();
				RuleInputBoxAttributeMenu.AttributeNameSearchBox.clear();
			}
		}
	},
	removeClickBehaviour: function() {
		const self = this;

		Body.removeClickEvent(self.selector);
	},
	installMouseEnterBehaviour: function() {
		$('body').on('mousemove', mouseenterRuleElement);

		function mouseenterRuleElement(event) {
			let shelfType = $('#rule-input-box').attr('shelf-type');

			let $filter = $(event.target).closest('.filter.rule-element');
			let $cell = $(event.target).closest('.cell.rule-element');
			let $columnIndex = $(event.target).closest('.column-index.rule-element');

			let isFilter = $filter.length != 0;
			let isCell = $cell.length != 0;
			let isColumnIndex = $columnIndex.length != 0;

			if (isFilter) {
				$filter
					.css('border-width', 2)
					.css('margin-top', 1.5)
					.css('margin-left', 4);
				$filter.next()
					.css('margin-left', 4);
				$('body')
					.css('cursor', 'copy');
			}

			if (isCell) {
				let cellWidth = $cell.width();
				let cellHeight = $cell.height();
				let cellPosition = $cell.offset();
				let boxWidth = cellWidth + 5 - 2; // 5 is padding
				let boxHeight = cellHeight - 2;
				let boxTop = cellPosition.top;
				let boxLeft = cellPosition.left;

				TableHighlightBox.show(boxWidth, boxHeight, boxTop, boxLeft);
				$('body').css('cursor', 'copy');
			}

			if (isColumnIndex && shelfType == 'attribute') {
				let cellWidth = $columnIndex.width();
				let cellHeight = $columnIndex.height();
				let cellPosition = $columnIndex.offset();
				let boxWidth = cellWidth + 5 - 2; // 5 is padding
				let boxHeight = cellHeight - 2;
				let boxTop = cellPosition.top - 1;
				let boxLeft = cellPosition.left - 1;

				TableHighlightBox.show(boxWidth, boxHeight, boxTop, boxLeft);
				$('body').css('cursor', 'copy');
			}

			if (!isFilter && !isCell && !(isColumnIndex && shelfType == 'attribute')) {
				$('.filter.rule-element')
					.css('border-width', '')
					.css('margin-top', '')
					.css('margin-left', '');

				TableHighlightBox.hide();
				$('body').css('cursor', '');
			}
		}
	},
	removeMouseEnterBehaviour: function() {
		$('body').css('cursor', '');
		$('body').off('mousemove');
	}
}