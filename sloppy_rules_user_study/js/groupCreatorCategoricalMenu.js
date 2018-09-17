const GroupCreatorCategoricalMenu = {
	attributeValueListClusterizeObject: null,

	init: function() {
		const self = this;

		self.attributeValueListClusterizeObject = new Clusterize({
			rows: [],
			scrollId: 'attribute-value-scroll-area',
			contentId: 'attribute-value-content-area',
			no_data_text: '',
			callbacks: { clusterChanged: self.AttributeValueList.installClick }
		});
	},
	show: function(fadeIn = true, scrollTop = null) {
		$('#group-creator .numerical-attribute-value-pair.menu')
			.css('display', 'none');
		$('#group-creator .attribute-only.menu')
			.css('display', 'none');
		$('#group-creator') // register menu type
			.attr('menu-type', 'categorical');
		$('#group-creator .rule-editor .input-box')
			.focus();

		if (fadeIn)
			$('#group-creator .categorical-attribute-value-pair.menu')
				.css('display', 'none')
				.fadeIn(200);

		if (!fadeIn)
			$('#group-creator .categorical-attribute-value-pair.menu')
				.css('display', 'block');

		if (scrollTop != null)
			$('#group-creator .categorical-attribute-value-pair.menu .attribute.content .container .dummy')
				.scrollTop(scrollTop);
	},
	AttributeNameList: {
		display: function(scrollTop = null, attributeNameList = null) {
			attributeNameList = (attributeNameList === null) ? Object.keys(Database.metadata) : attributeNameList;
			let attributeNameListHTML = GroupCreatorHelpers.getAttributeNameListHTML(attributeNameList);

			$('#group-creator .categorical-attribute-value-pair.menu .attribute.content .container .dummy')
				.html(attributeNameListHTML);

			if (scrollTop != null)
				$('#group-creator .categorical-attribute-value-pair.menu .attribute.content .container .dummy')
					.scrollTop(scrollTop);
		},
		highlight: function(attributeName) {
			let currentAttributeSelector = '#group-creator .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name[attribute-name="' + attributeName + '"]';
			let allAttributeSelector = '#group-creator .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name';

			$(allAttributeSelector).removeClass('selected');
			$(currentAttributeSelector).addClass('selected');
		},
		select: function(attributeName) {
			const self = GroupCreatorCategoricalMenu;
			let attributeValueList = Database.metadata[attributeName].uniqueValues;
			let shelfType = $('#group-creator').attr('shelf-type');

			// highlight selected attribute and update bottom list
			self.AttributeNameList.highlight(attributeName);
			self.AttributeValueList.display(scrollTop = 0, attributeValueList);
			self.AttributeValueList.installClick();
			self.AttributeValueList.changeTitle(attributeName);

			// change rule
			GroupCreatorInputBox.Rule.changeSelected(shelfType, attributeName);
		},
		scrollTo: function(attributeName) {
			let attributeNameContainerSelector = '#group-creator .categorical-attribute-value-pair.menu .attribute.content .container .dummy';
			let currentAttributeSelector = '#group-creator .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name[attribute-name="' + attributeName + '"]';
			let offsetOfAttributeNameRelativeToParent = $(currentAttributeSelector).offset().top - $(currentAttributeSelector).parent().offset().top;

		    $(attributeNameContainerSelector)
		    	.scrollTop(offsetOfAttributeNameRelativeToParent);
		},
		installClick: function() {
			const self = GroupCreatorCategoricalMenu;

			$('#group-creator .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name')
				.click(clickAttributeName);

			function clickAttributeName() {
				let isCurrentAttrAlreadySelected = $(this).hasClass('selected');
				let selectedAttrName = $(this).attr('attribute-name');
				let isSelectedAttrNumerical = Database.isCategoricalOrNumerical[selectedAttrName] == 'numerical';
				let scrollTop = $(this.parentNode).scrollTop();
				let currentAttributeList = [];

				// not change anything is already selected
				if (isCurrentAttrAlreadySelected)
					return;

				// get currentAttributeList
				$('#group-creator .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name').each(function() {
					let currentAttributeName = $(this).attr('attribute-name');
					currentAttributeList.push(currentAttributeName);
				});

				// show menu
				if (isSelectedAttrNumerical) {
					GroupCreatorNumericalMenu.show(fadeIn = false);
					GroupCreatorNumericalMenu.AttributeNameList.display(scrollTop, currentAttributeList);
					GroupCreatorNumericalMenu.AttributeNameList.installClick();
					GroupCreatorNumericalMenu.AttributeNameList.select(selectedAttrName);
				}
				if (!isSelectedAttrNumerical)
					self.AttributeNameList.select(selectedAttrName);
			}
		}
	},
	AttributeValueList: {
		display: function(scrollTop = null, attributeValueList = null, fadeIn = true) {
			const self = GroupCreatorCategoricalMenu;
			let attributeValueHTMLArray = Helpers.getAttributeValueHTMLArray(attributeValueList);

			self.attributeValueListClusterizeObject.clear();
			self.attributeValueListClusterizeObject.update(attributeValueHTMLArray);

			if (fadeIn)
				$('#group-creator .categorical-attribute-value-pair.menu .value')
					.css('display', 'none')
					.fadeIn(300);

			if (!fadeIn)
				$('#group-creator .categorical-attribute-value-pair.menu .value')
					.css('display', 'block');

			if (scrollTop !== null)
				$('#attribute-value-scroll-area')
					.scrollTop(scrollTop);
		},
		changeTitle: function(attributeName) {
			$('#group-creator .categorical-attribute-value-pair.menu .value.header')
				.html('Attribute Values (' + attributeName + ')');
		},
		hide: function() {
			$('#group-creator .categorical-attribute-value-pair.menu .value')
				.css('display', 'none');
		},
		highlight: function(attributeValue) {
			let currentAttributeValueSelector = '#group-creator .categorical-attribute-value-pair.menu .value.content .container .dummy .attribute-value[attribute-value="' + attributeValue + '"]';
			let allAttributeValueSelector = '#group-creator .categorical-attribute-value-pair.menu .value.content .container .dummy .attribute-value';

			$(allAttributeValueSelector).removeClass('selected');
			$(currentAttributeValueSelector).addClass('selected');
		},
		select: function(attributeValue, attributeName = null) {
			const self = GroupCreatorCategoricalMenu;
			let attributeValueObject = { category: attributeValue };
			let shelfType = $('#group-creator').attr('shelf-type');

			// highlight selected attribute value
			self.AttributeValueList.highlight(attributeValue);

			// show rule
			if (attributeName !== null)
				GroupCreatorInputBox.Rule.changeSelected(shelfType, attributeName, attributeValueObject);
		},
		scrollTo: function(attributeValue) {
			let attributeValueContainerSelector = '#group-creator .categorical-attribute-value-pair.menu .value.content .container';
			let currentAttributeValueSelector = '#group-creator .categorical-attribute-value-pair.menu .value.content .container .dummy .attribute-value[attribute-value="' + attributeValue + '"]';
			let offsetOfAttributeValueRelativeToParent = $(currentAttributeValueSelector).offset().top - $(currentAttributeValueSelector).parent().offset().top;

		    $(attributeValueContainerSelector)
		    	.scrollTop(offsetOfAttributeValueRelativeToParent);
		},
		installClick: function() {
			const self = GroupCreatorCategoricalMenu;

			$('#group-creator .categorical-attribute-value-pair.menu .value.content .container .dummy .attribute-value')
				.unbind('click').on('click', clickAttributeValue); // will trigger twice if not unbind

			function clickAttributeValue() {
				let selectedAttrValue = $(this).attr('attribute-value');
				let currentAttributeNameSelector = '#group-creator .categorical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name.selected';
				let selectedAttrName = $(currentAttributeNameSelector).attr('attribute-name');

				self.AttributeValueList.select(selectedAttrValue, selectedAttrName);
			}
		}
	}
}