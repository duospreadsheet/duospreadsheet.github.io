var RuleInputBoxAttributeMenu = {
	init: function() {
		const self = this;

		self.AttributeNameSearchBox.installSearch();
	},
	show: function(fadeIn = true) {
		$('#rule-input-box .categorical-attribute-value-pair.menu')
			.css('display', 'none');
		$('#rule-input-box .numerical-attribute-value-pair.menu')
			.css('display', 'none');
		$('#rule-input-box') // register menu type
			.attr('menu-type', 'attribute');

		if (fadeIn)
			$('#rule-input-box .attribute-only.menu')
				.css('display', 'none')
				.fadeIn(200);

		if (!fadeIn)
			$('#rule-input-box .attribute-only.menu')
				.css('display', 'block');
	},
	AttributeNameList: {
		display: function(scrollTop = null, attributeNameList = null) {
			attributeNameList = (attributeNameList === null) ? Object.keys(Database.metadata) : attributeNameList;
			let attributeNameListHTML = RuleInputBox.getAttributeNameListHTML(attributeNameList);

			$('#rule-input-box .attribute-only.menu .attribute.content .container .dummy')
				.html(attributeNameListHTML);

			if (scrollTop != null)
				$('#rule-input-box .attribute-only.menu .attribute.content .container .dummy')
					.scrollTop(scrollTop);
		},
		highlight: function(attributeName) {
			let currentAttributeSelector = '#rule-input-box .attribute-only.menu .attribute.content .container .dummy .attribute-name[attribute-name="' + attributeName + '"]';
			let allAttributeSelector = '#rule-input-box .attribute-only.menu .attribute.content .container .dummy .attribute-name';

			$(allAttributeSelector).removeClass('selected');
			$(currentAttributeSelector).addClass('selected');
		},
		select: function(attributeName, addRule = true) {
			const self = RuleInputBoxAttributeMenu;
			let shelfType = $('#rule-input-box').attr('shelf-type');
			
			// highlight selected attribute
			self.AttributeNameList.highlight(attributeName);

			// show rule
			if (addRule) RuleInputBoxInputInputBox.Rule.add(shelfType, attributeName);
		},
		scrollTo: function(attributeName) {
			let attributeNameContainerSelector = '#rule-input-box .attribute-only.menu .attribute.content .container .dummy';
			let currentAttributeSelector = '#rule-input-box .attribute-only.menu .attribute.content .container .dummy .attribute-name[attribute-name="' + attributeName + '"]';
			let offsetOfAttributeNameRelativeToParent = $(currentAttributeSelector).offset().top - $(currentAttributeSelector).parent().offset().top;

		    $(attributeNameContainerSelector)
		    	.scrollTop(offsetOfAttributeNameRelativeToParent);
		},
		installClick: function() {
			const self = RuleInputBoxAttributeMenu;

			$('#rule-input-box .attribute-only.menu .attribute.content .container .dummy .attribute-name')
				.click(clickAttributeName);

			function clickAttributeName() {
				let selectedAttrName = $(this).attr('attribute-name');

				if (RuleInputBoxInputInputBox.Rule.islreadyAdded(selectedAttrName))
					return;

				self.AttributeNameList.select(selectedAttrName);
			}
		}
	},
	AttributeNameSearchBox: {
		clear: function() {
			$('#rule-input-box .attribute-only.menu .attribute.search-box input').val('');
		},
		installSearch: function() {
			const self = RuleInputBoxAttributeMenu;

			$('#rule-input-box .attribute-only.menu .attribute.search-box input')
				.on('input', inputSearchBox);

			function inputSearchBox() {
				let keyword = $(this).val().toLowerCase();
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
	}
}