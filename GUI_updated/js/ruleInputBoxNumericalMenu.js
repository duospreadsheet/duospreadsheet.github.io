const RuleInputBoxNumericalMenu = {
	init: function() {
		const self = this;
		let sliderSelector = '#rule-input-box .menu .range.content #rule-input-slider';
		let sliderParentSelector = '#rule-input-box .menu .range.content';
		let sliderRangeEditorSelector = '#rule-input-range-editor';
		let sliderID = 'rule-input-slider';

		self.Slider = new Slider(sliderSelector, sliderParentSelector, sliderRangeEditorSelector, sliderID);
		self.Slider.show = showSlider;
		self.Slider.installDragSlider = installDragSlider;
		self.Slider.changeTitle = changeSliderTitle;
		self.Slider.initSlider();
		self.Slider.initHandleValues();
		self.Slider.initDensityPlot();
		self.Slider.installClickHandleText();
		self.Slider.installDragSlider();
		self.AttributeNameSearchBox.installSearch();

		function showSlider() {
			$('#rule-input-box .numerical-attribute-value-pair.menu .range').css('display', 'none');
			$('#rule-input-box .numerical-attribute-value-pair.menu .range').fadeIn(300);
		}

		function changeSliderTitle(attributeName) {
			$('#rule-input-box .numerical-attribute-value-pair.menu .range.header')
				.html('Range (' + attributeName + ')');
		}

		function installDragSlider() {
			const self = this;

			self.el.bootstrapSlider('on', 'change', function(data) {
				let clickedMinHandleText = $(self.parentSelector + ' .min-handle-text:hover').length > 0;
				let clickedMaxHandleText = $(self.parentSelector + ' .max-handle-text:hover').length > 0;
				let minHandleValue = self.el.bootstrapSlider('getValue')[0];
				let maxHandleValue = self.el.bootstrapSlider('getValue')[1];

				let selectedAttrName = $('#rule-input-box .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name.selected').attr('attribute-name');
				let attributeValueObject = { lowerValue: minHandleValue, upperValue: maxHandleValue };
				let shelfType = $('#rule-input-box').attr('shelf-type');

				// hacky way to prevent dragging the slider when handle text is clicked
				if (clickedMinHandleText || clickedMaxHandleText)
					self.updateValues(data.oldValue);

				// change handles
				self.updateHandles();
				RuleInputBoxInputInputBox.Rule.add(shelfType, selectedAttrName, attributeValueObject);
			});
		}
	},
	show: function(fadeIn = true) {
		$('#rule-input-box .categorical-attribute-value-pair.menu')
			.css('display', 'none');
		$('#rule-input-box .attribute-only.menu')
			.css('display', 'none');
		$('#rule-input-box') // register menu type
			.attr('menu-type', 'numerical');

		if (fadeIn)
			$('#rule-input-box .numerical-attribute-value-pair.menu')
				.css('display', 'none')
				.fadeIn(200);

		if (!fadeIn)
			$('#rule-input-box .numerical-attribute-value-pair.menu')
				.css('display', 'block');
	},
	AttributeNameList: {
		display: function(scrollTop = null, attributeNameList = null) {
			attributeNameList = (attributeNameList === null) ? Object.keys(Database.metadata) : attributeNameList;
			let attributeNameListHTML = RuleInputBox.getAttributeNameListHTML(attributeNameList);

			$('#rule-input-box .numerical-attribute-value-pair.menu .attribute.content .container .dummy')
				.html(attributeNameListHTML);

			if (scrollTop != null)
				$('#rule-input-box .numerical-attribute-value-pair.menu .attribute.content .container .dummy')
					.scrollTop(scrollTop);
		},
		highlight: function(attributeName) {
			let currentAttributeSelector = '#rule-input-box .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name[attribute-name="' + attributeName + '"]';
			let allAttributeSelector = '#rule-input-box .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name';

			$(allAttributeSelector).removeClass('selected');
			$(currentAttributeSelector).addClass('selected');
		},
		select: function(attributeName, addRule = true) {
			const self = RuleInputBoxNumericalMenu;
			let minValue = Math.round(Database.metadata[attributeName].minValue * 100) / 100;
			let maxValue = Math.round(Database.metadata[attributeName].maxValue * 100) / 100;
			let numberOfDecimals = Helpers.getNumberOfDecimals(attributeName);
			let step = 1 / Math.pow(10, numberOfDecimals);
			let lowerHandleValue = Math.round((minValue + (maxValue - minValue) * 0.2) * 100) / 100;
			let upperHandleValue = Math.round((maxValue - (maxValue - minValue) * 0.2) * 100) / 100;
			let shelfType = $('#rule-input-box').attr('shelf-type');

			// highlight selected attribute if not selected
			self.AttributeNameList.highlight(attributeName);

			// change slider
			self.Slider.show();
			self.Slider.updateMinMax(minValue, maxValue);
			self.Slider.updateStep(step);
			self.Slider.updateValues([ lowerHandleValue, upperHandleValue ]);
			self.Slider.updateHandles();
			self.Slider.updateMinMaxText();
			self.Slider.changeTitle(attributeName);

			// draw svg
			self.Slider.clearDensityPlot();
			self.Slider.generateDensityPlotData(attributeName);
			self.Slider.drawDensityPlot(attributeName);

			// add rule
			if (addRule) RuleInputBoxInputInputBox.Rule.add(shelfType, attributeName);
		},
		scrollTo: function(attributeName) {
			let attributeNameContainerSelector = '#rule-input-box .numerical-attribute-value-pair.menu .attribute.content .container .dummy';
			let currentAttributeSelector = '#rule-input-box .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name[attribute-name="' + attributeName + '"]';
			let offsetOfAttributeNameRelativeToParent = $(currentAttributeSelector).offset().top - $(currentAttributeSelector).parent().offset().top;

		    $(attributeNameContainerSelector)
		    	.scrollTop(offsetOfAttributeNameRelativeToParent);
		},
		installClick: function() {
			const self = RuleInputBoxNumericalMenu;

			$('#rule-input-box .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name')
				.click(clickAttributeName);

			function clickAttributeName() {
				let selectedAttrName = $(this).attr('attribute-name');
				let isSelectedAttrNumerical = Database.isCategoricalOrNumerical[selectedAttrName] == 'numerical';
				let scrollTop = $(this.parentNode).scrollTop();
				let keyword = $('#rule-input-box .numerical-attribute-value-pair.menu .attribute.search-box input').val();
				const currentAttributeList = [];

				if (RuleInputBoxInputInputBox.Rule.islreadyAdded(selectedAttrName))
					return;

				// get currentAttributeList
				$('#rule-input-box .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name').each(function() {
					let currentAttributeName = $(this).attr('attribute-name');
					currentAttributeList.push(currentAttributeName);
				});

				// show menu
				if (isSelectedAttrNumerical)
					self.AttributeNameList.select(selectedAttrName);

				if (!isSelectedAttrNumerical) {
					RuleInputBoxCategoricalMenu.show(fadeIn = false);
					RuleInputBoxCategoricalMenu.AttributeNameList.display(scrollTop, currentAttributeList);
					RuleInputBoxCategoricalMenu.AttributeNameList.select(selectedAttrName);
					RuleInputBoxCategoricalMenu.AttributeNameList.installClick();
					RuleInputBoxCategoricalMenu.AttributeNameSearchBox.changeValue(keyword);
					RuleInputBoxCategoricalMenu.AttributeValueSearchBox.clear();
				}
			}
		}
	},
	AttributeNameSearchBox: {
		clear: function() {
			$('#rule-input-box .numerical-attribute-value-pair.menu .attribute.search-box input').val('');
		},
		focus: function() {
			$('#rule-input-box .attribute-only.menu .attribute.search-box input').focus();
		},
		changeValue: function(value) {
			$('#rule-input-box .numerical-attribute-value-pair.menu .attribute.search-box input').val(value);
		},
		focus: function(value) {
			$('#rule-input-box .numerical-attribute-value-pair.menu .attribute.search-box input').focus();
		},
		installSearch: function() {
			const self = RuleInputBoxNumericalMenu;

			$('#rule-input-box .numerical-attribute-value-pair.menu .attribute.search-box input')
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
	}
}