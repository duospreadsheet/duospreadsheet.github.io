const FilterMenu = {
	init: function() {
		const self = this;
		let sliderSelector = '#filter-menu .filter.range.content #filter-slider';
		let sliderParentSelector = '#filter-menu .filter.range.content';
		let sliderRangeEditorSelector = '#filter-range-editor';
		let sliderID = 'filter-slider';

		self.Slider = new Slider(sliderSelector, sliderParentSelector, sliderRangeEditorSelector, sliderID);
		self.Slider.show = showSlider;
		self.Slider.installDragSlider = installDragSlider;
		self.Slider.generateDensityPlotData = generateDensityPlotData;
		self.Slider.initSlider();
		self.Slider.initHandleValues();
		self.Slider.initDensityPlot();
		self.Slider.installDragSlider();
		self.Slider.installClickHandleText();
		self.AttributeValueList.init();
		self.AttributeValueSearchBox.install();
		self.installClickSortButtonsBehaviour();
		self.installClickConfirmButtonBehaviour();
		self.installClickCancelButtonBehaviour();
		self.installClickOutsideBehaviour();
		self.hide(); // rendering slider require no hiding
		FilterRangeEditor.init();

		function showSlider() {
			$('#filter-menu .filter.value').css('display', 'none');
			$('#filter-menu .filter.range').css('display', 'block');
		}

		function installDragSlider() {
			const self = this;

			self.el.bootstrapSlider('on', 'change', function(data) {
				let clickedMinHandleText = $(self.parentSelector + ' .min-handle-text:hover').length > 0;
				let clickedMaxHandleText = $(self.parentSelector + ' .max-handle-text:hover').length > 0;
				let minHandleValue = self.el.bootstrapSlider('getValue')[0];
				let maxHandleValue = self.el.bootstrapSlider('getValue')[1];

				// hacky way to prevent dragging the slider when handle text is clicked
				if (clickedMinHandleText || clickedMaxHandleText)
					self.updateValues(data.oldValue);

				// change handles
				self.updateHandles();
			});
		}

		function generateDensityPlotData(attributeName) { // overrider to use table data
			const self = this;
			let densityPlotData = [];
			let minValue = Table.metaDataForCurrentTable[attributeName].minValue;
			let maxValue = Table.metaDataForCurrentTable[attributeName].maxValue;
			let binNumber = Table.metaDataForCurrentTable[attributeName].approxBinNumber;
			let binSize = (maxValue - minValue) / binNumber;
			let counts = {};

			// init counts
			for (let i = 0; i < binNumber; i++)
				counts[i] = 0;

			// count
			for (let i = 0; i < Table.rowData.length; i++) {
				let currentValue = Table.rowData[i].data[attributeName];

				if (currentValue !== '') {
					let binIndex = Math.floor((currentValue - minValue) / binSize);

					if (binIndex >= binNumber)
						binIndex = binNumber - 1;

					counts[binIndex]++;
				}
			}

			// store data
			for (let i = 0; i < binNumber; i++) {
				let currentBinCount = counts[i];

				densityPlotData.push(currentBinCount);
			}

			self.densityPlot.data = densityPlotData;
		}
	},
	show: function(attributeName, top, left) {
		const self = this;

		self.display(attributeName, top, left);
		self.changeSortButtons(attributeName);
		self.changeFilterContent(attributeName);
	},
	changeSortButtons: function(attributeName) {
		let isAttributeNumerical = Database.isCategoricalOrNumerical[attributeName] == 'numerical';

		if (isAttributeNumerical) {
			$('#filter-menu .sort.content .ascending-btn .fas').removeClass('fa-sort-alpha-down');
			$('#filter-menu .sort.content .descending-btn .fas').removeClass('fa-sort-alpha-up');
			$('#filter-menu .sort.content .ascending-btn .fas').addClass('fa-sort-numeric-down');
			$('#filter-menu .sort.content .descending-btn .fas').addClass('fa-sort-numeric-up');
		}
		if (!isAttributeNumerical) {
			$('#filter-menu .sort.content .ascending-btn .fas').removeClass('fa-sort-numeric-down');
			$('#filter-menu .sort.content .descending-btn .fas').removeClass('fa-sort-numeric-up');
			$('#filter-menu .sort.content .ascending-btn .fas').addClass('fa-sort-alpha-down');
			$('#filter-menu .sort.content .descending-btn .fas').addClass('fa-sort-alpha-up');
		}
	},
	changeFilterContent: function(attributeName) {
		const self = this;
		let isAttributeNumerical = Database.isCategoricalOrNumerical[attributeName] == 'numerical';

		if (isAttributeNumerical) {
			let minValue = Math.round(Table.metaDataForCurrentTable[attributeName].minValue * 100) / 100;
			let maxValue = Math.round(Table.metaDataForCurrentTable[attributeName].maxValue * 100) / 100;
			let numberOfDecimals = Helpers.getNumberOfDecimals(attributeName);
			let step = 1 / Math.pow(10, numberOfDecimals);
			let lowerHandleValue = Math.round((minValue + (maxValue - minValue) * 0.2) * 100) / 100;
			let upperHandleValue = Math.round((maxValue - (maxValue - minValue) * 0.2) * 100) / 100;

			// change slider
			self.Slider.show();
			self.Slider.updateMinMax(minValue, maxValue);
			self.Slider.updateStep(step);
			self.Slider.updateValues([ lowerHandleValue, upperHandleValue ]);
			self.Slider.updateHandles();
			self.Slider.updateMinMaxText();

			// // draw svg
			self.Slider.clearDensityPlot();
			self.Slider.generateDensityPlotData(attributeName);
			self.Slider.drawDensityPlot(attributeName, Table.metaDataForCurrentTable);
		}

		if (!isAttributeNumerical) {
			self.AttributeValueList.show();
			self.AttributeValueList.displayList(attributeName);
			self.AttributeValueSearchBox.clear();
		}
	},
	display: function (attributeName, top, left) {
		$('#filter-menu')
			.attr('attribute-name', attributeName)
			.css('display', 'block')
			.css('top', top)
			.css('left', left);
	},
	hide: function() {
		$('#table .top-bar .column-index .fa-caret-square-down')
			.removeClass('clicked')
			.css('color', 'white');

		$('#filter-menu')
			.css('display', 'none');
	},
	installClickSortButtonsBehaviour: function() {
		const self = this;

		$('#filter-menu .sort.content .ascending-btn').click(clickAscendingButton);
		$('#filter-menu .sort.content .descending-btn').click(clickDescendingButton);

		function clickAscendingButton() {
			let selectedAttrName = $('#filter-menu').attr('attribute-name');

			// show loader and remove menu first
			self.hide();
			Table.showLoader();

			// heavy computation
			setTimeout(function() {
				Table.rowData.sort(compare);
				Table.createRowHTML();
				Table.createIndexColumnHTML();
				Table.renderTable();
				Table.renderIndexColumn();
				Table.hideLoader();
			}, 10);

			// compare function
			function compare(row1, row2) {
				let aNew = (row1.data[selectedAttrName] === '') ? Infinity : row1.data[selectedAttrName];
				let bNew = (row2.data[selectedAttrName] === '') ? Infinity : row2.data[selectedAttrName];

				if (aNew < bNew)
					return -1;
				if (aNew > bNew)
					return 1;
			  	return 0;
			}
		}

		function clickDescendingButton() {
			let selectedAttrName = $('#filter-menu').attr('attribute-name');

			// show loader and remove menu first
			self.hide();
			Table.showLoader();

			// heavy computation
			setTimeout(function() {
				Table.rowData.sort(compare);
				Table.createRowHTML();
				Table.createIndexColumnHTML();
				Table.renderTable();
				Table.renderIndexColumn();
				Table.hideLoader();
			}, 10);

			// compare function
			function compare(row1, row2) {
				let aNew = (row1.data[selectedAttrName] === '') ? -Infinity : row1.data[selectedAttrName];
				let bNew = (row2.data[selectedAttrName] === '') ? -Infinity : row2.data[selectedAttrName];

				if (aNew > bNew)
					return -1;
				if (aNew < bNew)
					return 1;
			  	return 0;
			}
		}
	},
	installClickConfirmButtonBehaviour: function() {
		const self = this;

		$('#filter-menu .footer .confirm-btn').click(clickConfirmButton);

		function clickConfirmButton() {
			let attributeName = $('#filter-menu').attr('attribute-name');
			let attributeValueObject = createAttributeValueObject(attributeName);
			let isCurrentAttrNumerical = Database.isCategoricalOrNumerical[attributeName] == 'numerical';
			let isAttrValueSelected = $('#filter-menu .filter.value.content .container .dummy .attribute-value.selected').length != 0;
			let duplicatedFilter = null;

			if (!isCurrentAttrNumerical && !isAttrValueSelected)
				self.hide();

			if (isCurrentAttrNumerical || !isCurrentAttrNumerical && isAttrValueSelected) {
				duplicatedFilter = !FilterBar.addFilter(attributeName, attributeValueObject);

				if (!duplicatedFilter) {
					// show loader first
					Table.showLoader();
					self.hide();

					// heavy computation
					setTimeout(function() {
						FilterBar.updateTable();
						FilterBar.updateCount();
						FilterBar.drawFilters();
						FilterBar.installClickCloseButtonBehaviour();
						Table.hideLoader();
					}, 10);
				}
				
				if (duplicatedFilter)
					self.hide();
			}
		}

		function createAttributeValueObject(attributeName) {
			let isCurrentAttrNumerical = Database.isCategoricalOrNumerical[attributeName] == 'numerical';
			let attributeValueObject = {};

			if (isCurrentAttrNumerical) {
				attributeValueObject.lowerValue = self.Slider.el.bootstrapSlider('getValue')[0];
				attributeValueObject.upperValue = self.Slider.el.bootstrapSlider('getValue')[1];
			}
			if (!isCurrentAttrNumerical) {
				attributeValueObject.category = $('#filter-menu .filter.value.content .container .dummy .attribute-value.selected').attr('attribute-value');
			}

			return attributeValueObject;
		}
	},
	installClickCancelButtonBehaviour: function() {
		const self = this;

		$('#filter-menu .footer .cancel-btn').click(clickCancelButton);

		function clickCancelButton() {
			self.hide();
		}
	},
	installClickOutsideBehaviour: function() {
		const self = this;
		let filterButtonSelector = '#table .top-bar .column-index .fa-caret-square-down';
		let filterMenuSelector = '#filter-menu, #filter-range-editor'; // range editor is part of filter menu


		Body.registerNotClickEvent(filterButtonSelector + ',' + filterMenuSelector, clickOutsideFilterMenu);

		function clickOutsideFilterMenu() {
			self.hide();
		}
	},
	AttributeValueList: {
		clusterizeObject: null,

		init: function() {
			const self = FilterMenu;

			self.AttributeValueList.clusterizeObject = new Clusterize({
				rows: [],
				scrollId: 'filter-value-scroll-area',
				contentId: 'filter-value-content-area',
				no_data_text: '',
				callbacks: { clusterChanged: self.AttributeValueList.installClick }
			});
		},
		show: function() {
			$('#filter-menu .filter.value').css('display', 'block');
			$('#filter-menu .filter.range').css('display', 'none');
		},
		displayList: function(attributeName) {
			const self = FilterMenu;
			const attributeList = Table.metaDataForCurrentTable[attributeName].uniqueValues;
			let attributeValueHTMLArray = Helpers.getAttributeValueHTMLArray(attributeList);

			self.AttributeValueList.clusterizeObject.clear();
			self.AttributeValueList.clusterizeObject.update(attributeValueHTMLArray);
		},
		installClick: function() {
			$('#filter-menu .filter.value.content .container .dummy .attribute-value')
				.on('click', clickAttributeValue);

			function clickAttributeValue() {
				$('#filter-menu .filter.value.content .container .dummy .attribute-value').removeClass('selected');
				$(this).addClass('selected');
			}
		}
	},
	AttributeValueSearchBox: {
		clear: function() {
			$('#filter-menu .filter.value.search-box input').val('');
		},
		install: function() {
			const self = FilterMenu;

			$('#filter-menu .filter.value.search-box input')
				.on('input', inputSearchBox);

			function inputSearchBox() {
				let attributeName = $('#filter-menu').attr('attribute-name');
				const attributeList = Table.metaDataForCurrentTable[attributeName].uniqueValues;
				const filteredAttributeList = [];
				let keyword = $(this).val();
				let lowerCaseKeyword = keyword.toLowerCase();
				let attributeValueHTMLArray = null;

				// filter
				for (let i = 0; i < attributeList.length; i++) {
					let currentAttributeValue = attributeList[i];
					let lowerCaseCurrentAttributeValue = currentAttributeValue.toLowerCase();
					let keywordFound = (lowerCaseCurrentAttributeValue.indexOf(lowerCaseKeyword) != -1);

					if (keywordFound)
						filteredAttributeList.push(currentAttributeValue);
				}

				// show
				attributeValueHTMLArray = Helpers.getAttributeValueHTMLArray(filteredAttributeList);
				self.AttributeValueList.clusterizeObject.clear();
				self.AttributeValueList.clusterizeObject.update(attributeValueHTMLArray);
			}
		}
	}
}