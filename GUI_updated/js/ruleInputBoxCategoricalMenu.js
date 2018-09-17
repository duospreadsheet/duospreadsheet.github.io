var RuleInputBoxCategoricalMenu = {
	attributeValueListClusterizeObject: null,

	init: function() {
		const self = this;

		self.AttributeNameSearchBox.installSearch();
		self.AttributeValueSearchBox.installSearch();
		self.attributeValueListClusterizeObject = new Clusterize({
			rows: [],
			scrollId: 'attribute-value-scroll-area',
			contentId: 'attribute-value-content-area',
			no_data_text: '',
			callbacks: { clusterChanged: self.AttributeValueList.installClick }
		});
	},
	show: function(fadeIn = true, scrollTop = null) {
		$('#rule-input-box .numerical-attribute-value-pair.menu')
			.css('display', 'none');
		$('#rule-input-box .attribute-only.menu')
			.css('display', 'none');
		$('#rule-input-box') // register menu type
			.attr('menu-type', 'categorical');

		if (fadeIn)
			$('#rule-input-box .categorical-attribute-value-pair.menu')
				.css('display', 'none')
				.fadeIn(200);

		if (!fadeIn)
			$('#rule-input-box .categorical-attribute-value-pair.menu')
				.css('display', 'block');

		if (scrollTop != null)
			$('#rule-input-box .categorical-attribute-value-pair.menu .attribute.content .container .dummy')
				.scrollTop(scrollTop);
	},
	AttributeNameList: {
		display: function(scrollTop = null, attributeNameList = null) {
			attributeNameList = (attributeNameList === null) ? Object.keys(Database.metadata) : attributeNameList;
			let attributeNameListHTML = RuleInputBox.getAttributeNameListHTML(attributeNameList);

			$('#rule-input-box .categorical-attribute-value-pair.menu .attribute.content .container .dummy')
				.html(attributeNameListHTML);

			if (scrollTop != null)
				$('#rule-input-box .categorical-attribute-value-pair.menu .attribute.content .container .dummy')
					.scrollTop(scrollTop);
		},
		highlight: function(attributeName) {
			let currentAttributeSelector = '#rule-input-box .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name[attribute-name="' + attributeName + '"]';
			let allAttributeSelector = '#rule-input-box .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name';

			$(allAttributeSelector).removeClass('selected');
			$(currentAttributeSelector).addClass('selected');
		},
		select: function(attributeName, addRule = true) {
			const self = RuleInputBoxCategoricalMenu;
			let attributeValueList = Database.metadata[attributeName].uniqueValues;
			let shelfType = $('#rule-input-box').attr('shelf-type');

			// highlight selected attribute
			self.AttributeNameList.highlight(attributeName);

			// update bottom list
			self.AttributeValueList.display(scrollTop = 0, attributeValueList);
			self.AttributeValueList.installClick();
			self.AttributeValueList.changeTitle(attributeName);
			self.AttributeValueSearchBox.focus();

			// show rule
			if (addRule) RuleInputBoxInputInputBox.Rule.add(shelfType, attributeName);
		},
		scrollTo: function(attributeName) {
			let attributeNameContainerSelector = '#rule-input-box .categorical-attribute-value-pair.menu .attribute.content .container .dummy';
			let currentAttributeSelector = '#rule-input-box .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name[attribute-name="' + attributeName + '"]';
			let offsetOfAttributeNameRelativeToParent = $(currentAttributeSelector).offset().top - $(currentAttributeSelector).parent().offset().top;

		    $(attributeNameContainerSelector)
		    	.scrollTop(offsetOfAttributeNameRelativeToParent);
		},
		installClick: function() {
			const self = RuleInputBoxCategoricalMenu;

			$('#rule-input-box .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name')
				.click(clickAttributeName);

			function clickAttributeName() {
				let selectedAttrName = $(this).attr('attribute-name');
				let isSelectedAttrNumerical = Database.isCategoricalOrNumerical[selectedAttrName] == 'numerical';
				let scrollTop = $(this.parentNode).scrollTop();
				let keyword = $('#rule-input-box .categorical-attribute-value-pair.menu .attribute.search-box input').val();
				const currentAttributeList = [];

				if (RuleInputBoxInputInputBox.Rule.islreadyAdded(selectedAttrName))
					return;

				// get currentAttributeList
				$('#rule-input-box .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name').each(function() {
					let currentAttributeName = $(this).attr('attribute-name');
					currentAttributeList.push(currentAttributeName);
				});

				// show menu
				if (isSelectedAttrNumerical) {
					RuleInputBoxNumericalMenu.show(fadeIn = false);
					RuleInputBoxNumericalMenu.AttributeNameList.display(scrollTop, currentAttributeList);
					RuleInputBoxNumericalMenu.AttributeNameList.select(selectedAttrName);
					RuleInputBoxNumericalMenu.AttributeNameList.installClick();
					RuleInputBoxNumericalMenu.AttributeNameSearchBox.changeValue(keyword);
				}	

				if (!isSelectedAttrNumerical)
					self.AttributeNameList.select(selectedAttrName);
			}
		}
	},
	AttributeValueList: {
		display: function(scrollTop = null, attributeValueList = null, fadeIn = true) {
			const self = RuleInputBoxCategoricalMenu;
			let attributeValueHTMLArray = Helpers.getAttributeValueHTMLArray(attributeValueList);

			self.attributeValueListClusterizeObject.clear();
			self.attributeValueListClusterizeObject.update(attributeValueHTMLArray);

			if (fadeIn)
				$('#rule-input-box .categorical-attribute-value-pair.menu .value').css('display', 'none').fadeIn(300);
			if (!fadeIn)
				$('#rule-input-box .categorical-attribute-value-pair.menu .value').css('display', 'block');
			if (scrollTop !== null)
				$('#attribute-value-scroll-area').scrollTop(scrollTop);
		},
		hide: function() {
			$('#rule-input-box .categorical-attribute-value-pair.menu .value').css('display', 'none');
		},
		clear: function() {
			$('#rule-input-box .categorical-attribute-value-pair.menu .value.content .container .dummy').html('');
			$('#rule-input-box .categorical-attribute-value-pair.menu .value.header').html('Attribute Values');
		},
		highlight: function(attributeValue) {
			let currentAttributeValueSelector = '#rule-input-box .categorical-attribute-value-pair.menu .value.content .container .dummy .attribute-value[attribute-value="' + attributeValue + '"]';
			let allAttributeValueSelector = '#rule-input-box .categorical-attribute-value-pair.menu .value.content .container .dummy .attribute-value';

			$(allAttributeValueSelector).removeClass('selected');
			$(currentAttributeValueSelector).addClass('selected');
		},
		select: function(attributeValue, attributeName = null, addRule = true) {
			const self = RuleInputBoxCategoricalMenu;
			let attributeValueObject = { category: attributeValue };
			let shelfType = $('#rule-input-box').attr('shelf-type');

			// highlight selected attribute value
			self.AttributeValueList.highlight(attributeValue);

			// show rule
			if (attributeName !== null && addRule)
				RuleInputBoxInputInputBox.Rule.add(shelfType, attributeName, attributeValueObject);
		},
		scrollTo: function(attributeValue) {
			let attributeValueContainerSelector = '#rule-input-box .categorical-attribute-value-pair.menu .value.content .container';
			let currentAttributeValueSelector = '#rule-input-box .categorical-attribute-value-pair.menu .value.content .container .dummy .attribute-value[attribute-value="' + attributeValue + '"]';
			let offsetOfAttributeValueRelativeToParent = $(currentAttributeValueSelector).offset().top - $(currentAttributeValueSelector).parent().offset().top;

		    $(attributeValueContainerSelector)
		    	.scrollTop(offsetOfAttributeValueRelativeToParent);
		},
		changeTitle: function(attributeName) {
			$('#rule-input-box .categorical-attribute-value-pair.menu .value.header')
				.html('Attribute Values (' + attributeName + ')');
		},
		installClick: function() {
			const self = RuleInputBoxCategoricalMenu;

			$('#rule-input-box .categorical-attribute-value-pair.menu .value.content .container .dummy .attribute-value')
				.unbind('click').on('click', clickAttributeValue);

			function clickAttributeValue() {
				let selectedAttrValue = $(this).attr('attribute-value');
				let currentAttributeNameSelector = '#rule-input-box .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name.selected';
				let selectedAttrName = $(currentAttributeNameSelector).attr('attribute-name');
				
				self.AttributeValueList.select(selectedAttrValue, selectedAttrName);
			}
		}
	},
	AttributeNameSearchBox: {
		clear: function() {
			$('#rule-input-box .categorical-attribute-value-pair.menu .attribute.search-box input').val('');
		},
		focus: function() {
			$('#rule-input-box .attribute-only.menu .attribute.search-box input').focus();
		},
		changeValue: function(value) {
			$('#rule-input-box .categorical-attribute-value-pair.menu .attribute.search-box input').val(value);
		},
		focus: function() {
			$('#rule-input-box .categorical-attribute-value-pair.menu .attribute.search-box input').focus();
		},
		installSearch: function() {
			const self = RuleInputBoxCategoricalMenu;

			$('#rule-input-box .categorical-attribute-value-pair.menu .attribute.search-box input')
				.on('input', inputSearchBox);

			function inputSearchBox() {
				let keyword = $(this).val();
				let lowerCaseKeyword = keyword.toLowerCase();
				let attrNameInSelectedRule = null;
				const attributeNameList = Object.keys(Database.metadata);
				const filterAttributeNameList = [];

				// get attrNameInSelectedRule
				if (RuleInputBoxInputInputBox.selectedSpanEl !== null) {
					let selectedRule = $(RuleInputBoxInputInputBox.selectedSpanEl).attr('rule');
					attrNameInSelectedRule = Helpers.parseAttributeName(selectedRule);
				}

				// search
				for (let i = 0; i < attributeNameList.length; i++) {
					let currentAttributeName = attributeNameList[i];
					let lowerCaseCurrentAttributeName = attributeNameList[i].toLowerCase();

					if (lowerCaseCurrentAttributeName.indexOf(keyword) != -1)
						filterAttributeNameList.push(currentAttributeName);
				}

				// display
				self.AttributeNameList.display(scrollTop = 0, filterAttributeNameList);
				self.AttributeNameList.installClick();
				if (attrNameInSelectedRule !== null)
					self.AttributeNameList.highlight(attrNameInSelectedRule);
			}
		}
	},
	AttributeValueSearchBox: {
		clear: function() {
			$('#rule-input-box .categorical-attribute-value-pair.menu .value.search-box input').val('');
		},
		focus: function() {
			$('#rule-input-box .categorical-attribute-value-pair.menu .value.search-box input').focus();
		},
		installSearch: function() {
			const self = RuleInputBoxCategoricalMenu;

			$('#rule-input-box .categorical-attribute-value-pair.menu .value.search-box input')
				.on('input', inputSearchBox);

			function inputSearchBox() {
				let keyword = $(this).val().toLowerCase();
				let selectedAttrName = $('#rule-input-box .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name.selected').attr('attribute-name');
				let attrValueInSelectedRule = null;
				const attributeValueList = Database.metadata[selectedAttrName].uniqueValues;
				const filterAttributeValueList = [];

				// get attrValueInSelectedRule
				if (RuleInputBoxInputInputBox.selectedSpanEl !== null) {
					let selectedRule = $(RuleInputBoxInputInputBox.selectedSpanEl).attr('rule');
					let valueParsedFromSelectedRule = Helpers.parseAttributeValue(selectedRule);

					if ('category' in valueParsedFromSelectedRule && valueParsedFromSelectedRule.category != '??')
						attrValueInSelectedRule = valueParsedFromSelectedRule.category;
				}

				// search
				for (let i = 0; i < attributeValueList.length; i++) {
					let currentAttributeValue = attributeValueList[i];
					let lowerCaseCurrentAttributeValue = attributeValueList[i].toLowerCase();

					if (lowerCaseCurrentAttributeValue.indexOf(keyword) != -1)
						filterAttributeValueList.push(currentAttributeValue);
				}

				// display
				self.AttributeValueList.display(scrollTop = 0, filterAttributeValueList, fadeIn = false);
				self.AttributeValueList.installClick();
				if (attrValueInSelectedRule !== null)
					self.AttributeValueList.highlight(attrValueInSelectedRule);
			}
		}
	}
}