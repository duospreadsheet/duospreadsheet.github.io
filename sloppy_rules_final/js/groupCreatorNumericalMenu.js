const GroupCreatorNumericalMenu = {
	init: function() {
		const self = this;
		let sliderSelector = '#group-creator .menu .range.content #group-creator-slider';
		let sliderParentSelector = '#group-creator .menu .range.content';
		let sliderRangeEditorSelector = '#group-creator-range-editor';
		let sliderID = 'group-creator-slider';

		self.Slider = new Slider(sliderSelector, sliderParentSelector, sliderRangeEditorSelector, sliderID);
		self.Slider.show = showSlider;
		self.Slider.installDragSlider = installDragSlider;
		self.Slider.changeTitle = changeSliderTitle;
		self.Slider.installClickHandleText = installClickHandleText;
		self.Slider.initSlider();
		self.Slider.initHandleValues();
		self.Slider.initDensityPlot();
		self.Slider.installClickHandleText();
		self.Slider.installDragSlider();

		function showSlider(fadeIn = true) {
			if (fadeIn)
				$('#group-creator .numerical-attribute-value-pair.menu .range')
					.css('display', 'none')
					.fadeTo(300, 1);

			if (!fadeIn)
				$('#group-creator .numerical-attribute-value-pair.menu .range')
					.css('display', 'block');
		}

		function changeSliderTitle(attributeName) {
			$('#group-creator .numerical-attribute-value-pair.menu .range.header')
				.html('Range (' + attributeName + ')');
		}

		function installDragSlider() {
			const self = this;

			self.el.bootstrapSlider('on', 'change', function(data) {
				let clickedMinHandleText = $(self.parentSelector + ' .min-handle-text:hover').length > 0;
				let clickedMaxHandleText = $(self.parentSelector + ' .max-handle-text:hover').length > 0;
				let minHandleValue = self.el.bootstrapSlider('getValue')[0];
				let maxHandleValue = self.el.bootstrapSlider('getValue')[1];

				let shelfType = $('#group-creator').attr('shelf-type');
				let selectedAttrName = $('#group-creator .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name.selected').attr('attribute-name');
				let attributeValueObject = { lowerValue: minHandleValue, upperValue: maxHandleValue };

				// hacky way to prevent dragging the slider when handle text is clicked
				if (clickedMinHandleText || clickedMaxHandleText)
					self.updateValues(data.oldValue);

				// change handles and save rule
				self.updateHandles();
				GroupCreatorInputBox.Rule.changeSelected(shelfType, selectedAttrName, attributeValueObject);
			});
		}

		function installClickHandleText() {
			const self = this;
			let minHandleTextSelector = self.parentSelector + ' .min-handle-text';
			let maxHandleTextSelector = self.parentSelector + ' .max-handle-text';
			let handleTextSelector = minHandleTextSelector + ', ' + maxHandleTextSelector;
			let sliderRangeEditorSelector = self.sliderRangeEditorSelector;

			Body.registerClickEvent(handleTextSelector, clickHandleText, sliderRangeEditorSelector);
			Body.registerNotClickEvent(sliderRangeEditorSelector, updateSliderOnClickOutside);

			function clickHandleText(event) {
				var isClickedTextNull = ($(event.target).html() == 'NULL');
				var clickedLowerText = $(event.target).hasClass('min-handle-text');
				var handleTextBbox = event.target.getBoundingClientRect();
				var handleTextValue = null;
				var whichTextClicked = clickedLowerText ? 'lower' : 'upper';

				if (isClickedTextNull)
					handleTextValue = 'NULL';
				if (!isClickedTextNull && clickedLowerText)
					handleTextValue = self.el.bootstrapSlider('getValue')[0];
				if (!isClickedTextNull && !clickedLowerText)
					handleTextValue = self.el.bootstrapSlider('getValue')[1];

				$(sliderRangeEditorSelector)
					.attr('which-text-clicked', whichTextClicked)
					.attr('original-value', handleTextValue)
					.css('display', 'block')
					.css('min-width', handleTextBbox.width)
					.css('width', handleTextBbox.width)
					.css('height', handleTextBbox.height)
					.css('top', handleTextBbox.top)
					.css('left', handleTextBbox.left)
					.val(handleTextValue)
					.select();
			}

			function updateSliderOnClickOutside(event) {
				if ($(sliderRangeEditorSelector).css('display') == 'none')
					return;

				let whichTextChanged = $(sliderRangeEditorSelector).attr('which-text-clicked');
				let originalValue = $(sliderRangeEditorSelector).attr('original-value');
				let currentValue = $(sliderRangeEditorSelector).val();
				let isInputEmpty = currentValue == '';

				let shelfType = $('#group-creator').attr('shelf-type');
				let selectedAttrName = $('#group-creator .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name.selected').attr('attribute-name');
				let attributeValueObject = { lowerValue: null, upperValue: null };

				if (originalValue != currentValue && !isInputEmpty) {
					let value1 = null, value2 = null, newRange = null;

					if (whichTextChanged == 'lower') {
						value1 = self.el.bootstrapSlider('getValue')[1];
						value2 = parseFloat(currentValue);
						newRange = [ Math.min(value1, value2), Math.max(value1, value2) ];
					}
					if (whichTextChanged == 'upper') {
						value1 = self.el.bootstrapSlider('getValue')[0];
						value2 = parseFloat(currentValue);
						newRange = [ Math.min(value1, value2), Math.max(value1, value2) ];
					}

					self.updateValues(newRange);
					self.updateHandles();
					attributeValueObject.lowerValue = self.el.bootstrapSlider('getValue')[0];
					attributeValueObject.upperValue = self.el.bootstrapSlider('getValue')[1];
				}

				$(sliderRangeEditorSelector).css('display', 'none');
				GroupCreatorInputBox.Rule.changeSelected(shelfType, selectedAttrName, attributeValueObject);
			}
		}
	},
	show: function(fadeIn = true) {
		$('#group-creator .categorical-attribute-value-pair.menu')
			.css('display', 'none');
		$('#group-creator .attribute-only.menu')
			.css('display', 'none');
		$('#group-creator') // register menu type
			.attr('menu-type', 'numerical');

		if (fadeIn)
			$('#group-creator .numerical-attribute-value-pair.menu')
				.css('display', 'none')
				.fadeTo(200, 1);

		if (!fadeIn)
			$('#group-creator .numerical-attribute-value-pair.menu')
				.css('display', 'block');
	},
	AttributeNameList: {
		display: function(scrollTop = null, attributeNameList = null) {
			attributeNameList = (attributeNameList === null) ? Object.keys(Database.metadata) : attributeNameList;
			let attributeNameListHTML = GroupCreatorHelpers.getAttributeNameListHTML(attributeNameList);

			$('#group-creator .numerical-attribute-value-pair.menu .attribute.content .container .dummy')
				.html(attributeNameListHTML);

			if (scrollTop != null)
				$('#group-creator .numerical-attribute-value-pair.menu .attribute.content .container .dummy')
					.scrollTop(scrollTop);
		},
		highlight: function(attributeName) {
			let currentAttributeSelector = '#group-creator .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name[attribute-name="' + attributeName + '"]';
			let allAttributeSelector = '#group-creator .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name';

			$(allAttributeSelector).removeClass('selected');
			$(currentAttributeSelector).addClass('selected');
		},
		select: function(attributeName) {
			const self = GroupCreatorNumericalMenu;
			let minValue = Database.metadata[attributeName].minValue;
			let maxValue = Database.metadata[attributeName].maxValue;
			let numberOfDecimals = Helpers.getNumberOfDecimals(attributeName);
			let step = 1 / Math.pow(10, numberOfDecimals);
			let lowerHandleValue = minValue;
			let upperHandleValue = maxValue;
			let shelfType = $('#group-creator').attr('shelf-type');

			// highlight selected attribute if not selected
			self.AttributeNameList.highlight(attributeName);

			// change slider
			self.Slider.show();
			self.Slider.updateMinMax(minValue, maxValue);
			self.Slider.updateStep(step);
			self.Slider.updateValues([ lowerHandleValue, upperHandleValue ]);
			self.Slider.updateHandles(rangeSpecified = false);
			self.Slider.updateMinMaxText();
			self.Slider.changeTitle(attributeName);

			// draw svg
			self.Slider.clearDensityPlot();
			self.Slider.generateDensityPlotData(attributeName);
			self.Slider.drawDensityPlot(attributeName);

			// add rule
			GroupCreatorInputBox.Rule.changeSelected(shelfType, attributeName);
		},
		scrollTo: function(attributeName) {
			let attributeNameContainerSelector = '#group-creator .numerical-attribute-value-pair.menu .attribute.content .container .dummy';
			let currentAttributeSelector = '#group-creator .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name[attribute-name="' + attributeName + '"]';
			let offsetOfAttributeNameRelativeToParent = $(currentAttributeSelector).offset().top - $(currentAttributeSelector).parent().offset().top;

		    $(attributeNameContainerSelector)
		    	.scrollTop(offsetOfAttributeNameRelativeToParent);
		},
		installClick: function() {
			const self = GroupCreatorNumericalMenu;

			$('#group-creator .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name')
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
				$('#group-creator .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name').each(function() {
					let currentAttributeName = $(this).attr('attribute-name');
					currentAttributeList.push(currentAttributeName);
				});

				// show menu
				if (isSelectedAttrNumerical)
					self.AttributeNameList.select(selectedAttrName);

				if (!isSelectedAttrNumerical) {
					GroupCreatorCategoricalMenu.show(fadeIn = false);
					GroupCreatorCategoricalMenu.AttributeNameList.display(scrollTop, currentAttributeList);
					GroupCreatorCategoricalMenu.AttributeNameList.installClick();
					GroupCreatorCategoricalMenu.AttributeNameList.select(selectedAttrName);
				}
			}
		}
	}
}