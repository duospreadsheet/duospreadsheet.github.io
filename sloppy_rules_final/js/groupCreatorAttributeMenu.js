const GroupCreatorAttributeMenu = {
	show: function(fadeIn = true) {
		$('#group-creator .categorical-attribute-value-pair.menu')
			.css('display', 'none');
		$('#group-creator .numerical-attribute-value-pair.menu')
			.css('display', 'none');
		$('#group-creator') // register menu type
			.attr('menu-type', 'attribute');
		$('#group-creator .rule-editor .input-box')
			.focus();

		if (fadeIn)
			$('#group-creator .attribute-only.menu')
				.css('display', 'none')
				.fadeIn(200);

		if (!fadeIn)
			$('#group-creator .attribute-only.menu')
				.css('display', 'block');
	},
	AttributeNameList: {
		display: function(scrollTop = null, attributeNameList = null) {
			attributeNameList = (attributeNameList === null) ? Object.keys(Database.metadata) : attributeNameList;
			let attributeNameListHTML = GroupCreatorHelpers.getAttributeNameListHTML(attributeNameList);

			$('#group-creator .attribute-only.menu .attribute.content .container .dummy')
				.html(attributeNameListHTML);

			if (scrollTop != null)
				$('#group-creator .attribute-only.menu .attribute.content .container .dummy')
					.scrollTop(scrollTop);
		},
		highlight: function(attributeName) {
			let currentAttributeSelector = '#group-creator .attribute-only.menu .attribute.content .container .dummy .attribute-name[attribute-name="' + attributeName + '"]';
			let allAttributeSelector = '#group-creator .attribute-only.menu .attribute.content .container .dummy .attribute-name';

			$(allAttributeSelector).removeClass('selected');
			$(currentAttributeSelector).addClass('selected');
		},
		select: function(attributeName) {
			const self = GroupCreatorAttributeMenu;
			let shelfType = $('#group-creator').attr('shelf-type');
			
			// highlight selected attribute
			self.AttributeNameList.highlight(attributeName);

			// change rule
			GroupCreatorInputBox.Rule.changeSelected(shelfType, attributeName);
		},
		scrollTo: function(attributeName) {
			let attributeNameContainerSelector = '#group-creator .attribute-only.menu .attribute.content .container .dummy';
			let currentAttributeSelector = '#group-creator .attribute-only.menu .attribute.content .container .dummy .attribute-name[attribute-name="' + attributeName + '"]';
			let offsetOfAttributeNameRelativeToParent = $(currentAttributeSelector).offset().top - $(currentAttributeSelector).parent().offset().top;

		    $(attributeNameContainerSelector)
		    	.scrollTop(offsetOfAttributeNameRelativeToParent);
		},
		installClick: function() {
			const self = GroupCreatorAttributeMenu;

			$('#group-creator .attribute-only.menu .attribute.content .container .dummy .attribute-name')
				.click(clickAttributeName);

			function clickAttributeName() {
				let selectedAttrName = $(this).attr('attribute-name');

				self.AttributeNameList.select(selectedAttrName);
			}
		}
	}
}