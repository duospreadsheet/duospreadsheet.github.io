const RuleInputBox = {
	init: function() {
		const self = this;

		RuleInputBoxInputInputBox.init();
		RuleInputBoxNumericalMenu.init();
		RuleInputBoxCategoricalMenu.init();
		RuleInputBoxAttributeMenu.init();
		RuleInputBoxRangeEditor.init();
		self.hide(); // rendering numerical menu require no hiding
	},
	show: function(shelfType, top, left) {
		const self = this;
		let isGroupShelf = shelfType == 'top' || shelfType == 'bottom' || shelfType == 'base' || shelfType == 'inclusion' || shelfType == 'exclusion';
		let cursorTop, cursorLeft;

		// show
		$('#rule-input-box')
			.attr('shelf-type', shelfType) // register shelfType
			.css('display', 'block')
			.css('top', top)
			.css('left', left);

		// show cursor at start position
		cursorTop = RuleInputBoxInputInputBox.Cursor.getStartPositionTop();
		cursorLeft = RuleInputBoxInputInputBox.Cursor.getStartPositionLeft();
		RuleInputBoxInputInputBox.Cursor.show(cursorTop, cursorLeft);

		// display the correct menu
		if (isGroupShelf) { // group shelf
			RuleInputBoxCategoricalMenu.show();
			RuleInputBoxCategoricalMenu.AttributeNameList.display(scrollTop = 0);
			RuleInputBoxCategoricalMenu.AttributeNameList.installClick();
			RuleInputBoxCategoricalMenu.AttributeValueList.hide();
			RuleInputBoxCategoricalMenu.AttributeValueList.clear();
			RuleInputBoxCategoricalMenu.AttributeNameSearchBox.clear();
			RuleInputBoxCategoricalMenu.AttributeValueSearchBox.clear();
			RuleInputBoxInputInputBox.Rule.clear();
			RuleInputBoxInputInputBox.saveSpanEl({}); // remove all
		}
		if (!isGroupShelf) { // attribute shelf
			RuleInputBoxAttributeMenu.show();
			RuleInputBoxAttributeMenu.AttributeNameList.display(scrollTop = 0);
			RuleInputBoxAttributeMenu.AttributeNameList.installClick();
			RuleInputBoxAttributeMenu.AttributeNameSearchBox.clear();
			RuleInputBoxInputInputBox.Rule.clear();
			RuleInputBoxInputInputBox.saveSpanEl({}); // remove all
		}

		// install rule element event
		RuleElement.installMouseEnterBehaviour();
		RuleElement.installClickBehaviour();
	},
	hide: function() {
		$('#rule-input-box').css('display', 'none');
		RuleInputBoxInputInputBox.Cursor.hide();
		TableHighlightBox.hide();
		RuleElement.removeMouseEnterBehaviour();
		RuleElement.removeClickBehaviour();
	},
	onAddToShelf: function() {
		let isInputBoxEmpty = $('#rule-input-box .input-box .rule-container').is(':empty');
		let isPartialSpecification = !isInputBoxEmpty; // not partial spec if empty
		let tooManyUniqueValuesForPartialSpec = false;
		let isTopShelf = $('#rule-input-box').attr('shelf-type') == 'top';
		let currentRules = RuleInputBoxInputInputBox.Rule.getAllRulesFromInputBox();
		let filteredRuleArray = Shelf.filterRedundantRules(currentRules);
		let isMultiplePartialSpecification = (currentRules.length > 0) && filteredRuleArray.length == 1 && filteredRuleArray[0].length == 0;
		let isGroupEditorShelf = $('#rule-input-box').attr('shelf-type') == 'base'
							  || $('#rule-input-box').attr('shelf-type') == 'inclusion'
							  || $('#rule-input-box').attr('shelf-type') == 'exclusion';

		// determine if it is partial specification
		for (let i = 0; i < currentRules.length; i++)
			if (currentRules[i].indexOf('=??') == -1) // not found, at least one not partial
				isPartialSpecification = false;

		if (isPartialSpecification && !isMultiplePartialSpecification) {
			let attributeNameInPartialRule = Helpers.parseAttributeName(currentRules[0]);
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[attributeNameInPartialRule] == 'numerical';
			let numberOfUniqueValues = 0;

			if (!isCurrentAttributeNumerical)
				numberOfUniqueValues = Database.metadata[attributeNameInPartialRule].uniqueValues.length;
			if (!isCurrentAttributeNumerical && numberOfUniqueValues > 1500)
				tooManyUniqueValuesForPartialSpec = true;
		}

		// handle different cases
		if ((isPartialSpecification && isTopShelf) || 
			(isPartialSpecification && isGroupEditorShelf) || 
			isMultiplePartialSpecification ||
			(isPartialSpecification && !isMultiplePartialSpecification && tooManyUniqueValuesForPartialSpec)) {
			let inputBoxPosition = $('#rule-input-box .input-box').offset();
			let inputBoxHeight = $('#rule-input-box .input-box').height();
			let tooltipText = null;

			// determine tooltip text
			if (isMultiplePartialSpecification) 
				tooltipText = 'Invalid Rules';
			if (isPartialSpecification && isTopShelf)
				tooltipText = 'Partial Specification Not Allowed for Top Shelf!';
			if (isPartialSpecification && isGroupEditorShelf)
				tooltipText = 'Partial Specification Not Allowed!';
			if (isPartialSpecification && !isMultiplePartialSpecification && tooManyUniqueValuesForPartialSpec)
				tooltipText = 'The Attribute Has Too Many Uniques!';

			// show
			$('#tooltip')
				.attr('data-tooltip', tooltipText)
				.css('top', inputBoxPosition.top + inputBoxHeight / 2 + 1.5) // 3 is border
				.css('left', inputBoxPosition.left - 5)
				.addClass('show')
				.addClass('left');
			setTimeout(function(){
				$('#tooltip').removeClass('show');
			}, 700);

			return;
		}

		// handle faster operation first
		Shelf.show('top');
		Shelf.show('bottom');
		Shelf.show('attribute');
		GroupEditor.showShelf('base');
		GroupEditor.showShelf('inclusion');
		GroupEditor.showShelf('exclusion');
		RuleInputBox.hide();

		
		if (!isInputBoxEmpty) {
			// less heavy computation
			Shelf.addRulesFromInputBox();
			GroupEditor.update();

			// show loader if result panel will update
			if (Shelf.data.top.length >= 1 && 
				Shelf.data.bottom.length >= 1)
				ResultPanel.showLoader();

			// handle heavy computation
			setTimeout(function() {
				Shelf.update();
				ResultPanel.update();

				if (isGroupEditorShelf)
					GroupViewer.update();

				ResultPanel.removeLoader();
			}, 10);	
		}
	},

	// -- Helpers --//

	changeBorder: function(shelfType) {
		let borderColour = (shelfType == 'top' || shelfType == 'bottom' || shelfType == 'attribute') ? Shelf.colour[shelfType] : '#a0d1ff';
		let borderWidth = (shelfType == 'top' || shelfType == 'bottom' || shelfType == 'attribute') ? 3 : 2;

		$('#rule-input-box .input-box')
			.css('border-color', borderColour)
			.css('border-width', borderWidth);
		$('#rule-input-box .menu')
			.css('border-color', borderColour)
			.css('border-width', borderWidth);
		$('#rule-input-box .menu .search-box input')
			.css('border-color', borderColour);
		$('#rule-input-box .menu .search-box .fa-search')
			.css('color', borderColour);
		$('#rule-input-box .menu .attribute.content .container')
			.css('border-color', borderColour);
		$('#rule-input-box .menu .value.content .container')
			.css('border-color', borderColour);
	},
	getAttributeNameListHTML: function(attributeNameList) {
		let attributeNameListHTML = '';

		for (let i = 0; i < attributeNameList.length; i++)
			attributeNameListHTML += '<div class="attribute-name" attribute-name="' + attributeNameList[i] + '">' + attributeNameList[i] + '</div>';

		return attributeNameListHTML;
	}
}