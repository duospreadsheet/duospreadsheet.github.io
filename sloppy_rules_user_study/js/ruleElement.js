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
			let shelfType = $('#group-creator').attr('shelf-type');
			let showAttributeMenu = shelfType == 'attribute';
			let showNumericalMenu = !showAttributeMenu && Database.isCategoricalOrNumerical[attributeName] == 'numerical';
			let showCategoricalMenu = !showAttributeMenu && Database.isCategoricalOrNumerical[attributeName] != 'numerical';

			if (!hasClickedFilterRemoveButton && showNumericalMenu && !hasClickedColumnIndex) {
				let lowerValueString = $(ruleElementEl).attr('lower-value');
				let upperValueString = $(ruleElementEl).attr('upper-value');
				let lowerValue = parseFloat($(ruleElementEl).attr('lower-value'));
				let upperValue = parseFloat($(ruleElementEl).attr('upper-value'));
				let attributeValueObject = { lowerValue: lowerValue, upperValue: upperValue };

				let minValue = Math.round(Database.metadata[attributeName].minValue * 100) / 100;
				let maxValue = Math.round(Database.metadata[attributeName].maxValue * 100) / 100;
				let numberOfDecimals = Helpers.getNumberOfDecimals(attributeName);
				let step = 1 / Math.pow(10, numberOfDecimals);

				if (lowerValueString !== '' && upperValueString !== '') {
					GroupCreatorNumericalMenu.show(fadeIn = false);
					GroupCreatorNumericalMenu.AttributeNameList.display(scrollTop = 0);
					GroupCreatorNumericalMenu.AttributeNameList.highlight(attributeName);
					GroupCreatorNumericalMenu.AttributeNameList.installClick();
					GroupCreatorNumericalMenu.AttributeNameList.scrollTo(attributeName);

					GroupCreatorNumericalMenu.Slider.show();
					GroupCreatorNumericalMenu.Slider.updateMinMax(minValue, maxValue);
					GroupCreatorNumericalMenu.Slider.updateStep(step);
					GroupCreatorNumericalMenu.Slider.updateValues([ lowerValue, upperValue ]);
					GroupCreatorNumericalMenu.Slider.updateHandles();
					GroupCreatorNumericalMenu.Slider.updateMinMaxText();
					GroupCreatorNumericalMenu.Slider.changeTitle(attributeName);

					GroupCreatorNumericalMenu.Slider.clearDensityPlot();
					GroupCreatorNumericalMenu.Slider.generateDensityPlotData(attributeName);
					GroupCreatorNumericalMenu.Slider.drawDensityPlot(attributeName);

					GroupCreatorInputBox.Rule.changeSelected(shelfType, attributeName, attributeValueObject);
					setTimeout(function () { $('#group-creator .input-box').focus(); }, 1); // hack to set focus
				}
			}

			if (!hasClickedFilterRemoveButton && showCategoricalMenu && !hasClickedColumnIndex) {
				let category = $(ruleElementEl).attr('category');
				let attributeValueObject = { category: category };
				let attributeValueList = Database.metadata[attributeName].uniqueValues;

				if (category !== '') {
					GroupCreatorCategoricalMenu.show(fadeIn = false);
					GroupCreatorCategoricalMenu.AttributeNameList.display(scrollTop = 0);
					GroupCreatorCategoricalMenu.AttributeNameList.highlight(attributeName);
					GroupCreatorCategoricalMenu.AttributeNameList.installClick();
					GroupCreatorCategoricalMenu.AttributeNameList.scrollTo(attributeName);
					
					GroupCreatorCategoricalMenu.AttributeValueList.display(scrollTop = 0, attributeValueList);
					GroupCreatorCategoricalMenu.AttributeValueList.highlight(category);
					GroupCreatorCategoricalMenu.AttributeValueList.installClick();
					GroupCreatorCategoricalMenu.AttributeValueList.scrollTo(category);
					GroupCreatorCategoricalMenu.AttributeValueList.changeTitle(attributeName);

					GroupCreatorInputBox.Rule.changeSelected(shelfType, attributeName, attributeValueObject);
					setTimeout(function () { $('#group-creator .input-box').focus(); }, 1); // hack to set focus
				}
			}

			if (!hasClickedFilterRemoveButton && showAttributeMenu) {
				GroupCreatorAttributeMenu.show(fadeIn = false);
				GroupCreatorAttributeMenu.AttributeNameList.display(scrollTop = 0);
				GroupCreatorAttributeMenu.AttributeNameList.highlight(attributeName);
				GroupCreatorAttributeMenu.AttributeNameList.installClick();
				GroupCreatorAttributeMenu.AttributeNameList.scrollTo(attributeName);

				GroupCreatorInputBox.Rule.changeSelected(shelfType, attributeName);
				setTimeout(function () { $('#group-creator .input-box').focus(); }, 1); // hack to set focus
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
			let shelfType = $('#group-creator').attr('shelf-type');

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