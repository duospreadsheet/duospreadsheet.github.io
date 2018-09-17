const Table = {
	rowData: null, // { index, data }
	metaDataForCurrentTable: {},

	rowHTML: [],
	indexColumnHTML: [],
	headerHTML: '',
	
	indexColumnClusterizeObject: null,
	tableClusterizeObject: null,

	Header: {
		cellMinWidth: 60,
		isResizing: false, // check if the header is resizing
		widthConstraintRules: {}, // { columnIndex: width }
	},
	lastScrollLeft: 0,

	init: function() {
		const self = this;

		self.indexColumnClusterizeObject = new Clusterize({
			rows: self.indexColumnHTML,
		  	scrollId: 'left-bar-scrollable-area',
		  	contentId: 'left-bar-content',
		  	no_data_text: ''
		});
		self.tableClusterizeObject = new Clusterize({
			rows: self.rowHTML,
		  	scrollId: 'table-scrollable-area',
		  	contentId: 'table-content',
		  	no_data_text: ''
		});
	},
	show: function() {
		const self = this;

		self.copyRowDataFromDatabase();
		self.generateHTML();
		self.renderIndexColumn();
		self.renderHeader();
		self.renderTable();
		FilterBar.updateCount();
		self.installScrollBehaviour();
		self.installResizableBehaviour();
		self.installClickFilterButtonBehaviour();
		self.installMouseenterHeaderBehaviour();
	},
	copyRowDataFromDatabase: function() {
		const self = this;
		const rowData = [];

		for (let i = 0; i < Database.data.length; i++) {
			const currentRowObject = {};
			currentRowObject.index = i + 1;
			currentRowObject.data = Database.data[i];
			rowData.push(currentRowObject);
		}

		self.updateRowDataAndMetaData(rowData);
	},
	filterRowData: function(filters) {
		const self = this;
		const filteredRowData = [];

		for (let i = 0; i < Database.data.length; i++) {
			let currentRow = Database.data[i];
			let currentRowSatisifiesAllConditions = true;
			const currentRowObject = {};

			for (let j = 0; j < filters.length; j++) {
				let currentFilter = filters[j];
				let currentFilterAttribute = currentFilter.attributeName;
				let currentRowValue = currentRow[currentFilterAttribute];
				let isCurrentAttrNumerical = ('lowerValue' in currentFilter);

				if (isCurrentAttrNumerical) {
					let currentFilterLowerValue = currentFilter.lowerValue;
					let currentFilterUpperValue = currentFilter.upperValue;

					if (currentRowValue < currentFilterLowerValue || 
						currentRowValue > currentFilterUpperValue)
						currentRowSatisifiesAllConditions = false;
				}

				if (!isCurrentAttrNumerical) {
					let currentFilterValue = currentFilter.category;

					if (currentRowValue !== currentFilterValue)
						currentRowSatisifiesAllConditions = false;
				}
			}

			if (currentRowSatisifiesAllConditions) {
				currentRowObject.index = i + 1;
				currentRowObject.data = currentRow;
				filteredRowData.push(currentRowObject);
			}
		}

		self.updateRowDataAndMetaData(filteredRowData);
	},
	updateRowDataAndMetaData: function(newRowData) {
		const self = this;
		const attributeList = Database.data.columns;
		let metadata = {};

		for (let i = 0; i < attributeList.length; i++) {
			let currentAttribute = attributeList[i];
			let isCurrentAttrNumerical = Database.isCategoricalOrNumerical[currentAttribute] == 'numerical';

			if (isCurrentAttrNumerical) { // numerical
				const allNumericalValues = [];
				const allUniqueValues = {};
				let numberOfUniqueValues = null;
				let approxBinNumber = null;
				let minValue = null, maxValue = null;

				// loop the new row data
				for (let j = 0; j < newRowData.length; j++) {
					let currentValue = newRowData[j].data[currentAttribute];

					if (currentValue !== '') { // not missing
						allUniqueValues[currentValue] = null;
						allNumericalValues.push(currentValue);
					}
				}

				// determine min, max and median
				Helpers.sortNumbers(allNumericalValues);
				minValue = allNumericalValues[0];
				maxValue = allNumericalValues[allNumericalValues.length - 1];
				numberOfUniqueValues = Object.keys(allUniqueValues).length;
				approxBinNumber = (numberOfUniqueValues > 10) ? 10 : numberOfUniqueValues;

				// store
				metadata[currentAttribute] = { 
					minValue: minValue,
					maxValue: maxValue,
					approxBinNumber: approxBinNumber // for drawing density map
				};
			}

			if (!isCurrentAttrNumerical) { // categorical
				let allUniqueValues = {};

				// loop the new row data
				for (let j = 0; j < newRowData.length; j++) {
					let currentValue = newRowData[j].data[currentAttribute];

					if (currentValue !== '') // not missing
						allUniqueValues[currentValue] = null;
				}

				// store
				metadata[currentAttribute] = { 
					uniqueValues: Object.keys(allUniqueValues)
				};
			}
		}

		self.rowData = newRowData;
		self.metaDataForCurrentTable = metadata;
	},
	createHeaderHTML: function() {
		const self = this;

		self.headerHTML = TableHelpers.createHeaderHTML();
	},
	createIndexColumnHTML: function() {
		const self = this;

		self.indexColumnHTML = TableHelpers.createIndexColumnHTML(self.rowData);
	},
	createRowHTML: function() {
		const self = this;

		self.rowHTML = TableHelpers.createRowHTML(self.rowData);
	},
	generateHTML: function() {
		const self = this;

		self.createHeaderHTML();
		self.createIndexColumnHTML();
		self.createRowHTML();
	},
	renderIndexColumn: function() {
		const self = this;

		self.indexColumnClusterizeObject.update(self.indexColumnHTML);
	},
	renderHeader: function() {
		const self = this;

		$('#table .top-bar .top-bar-scrollable-area').html(self.headerHTML);
	},
	renderTable: function() {
		const self = this;

		self.tableClusterizeObject.update(self.rowHTML);
	},
	installScrollBehaviour: function() {
		const self = this;
		let tableScrollableAreaEl = document.querySelector('#table-scrollable-area');

		// programmatically scroll index column
		$('#table-scrollable-area').on('scroll', function(event) {
			let tableScrollTop = $(this).scrollTop();
			let tableScrollLeft = $(this).scrollLeft();
			let isHorizontalScroll = self.lastScrollLeft != tableScrollLeft;
			let isFilterMenuOpened = $('#filter-menu').css('display') == 'block';

			if (isHorizontalScroll && isFilterMenuOpened)
				FilterMenu.hide();

			$('#left-bar-scrollable-area').scrollTop(tableScrollTop);
			$('#table .top-bar .top-bar-scrollable-area').scrollLeft(tableScrollLeft);
			self.lastScrollLeft = tableScrollLeft;
		});

		// programmatically change bottom margin of row index
		if (tableScrollableAreaEl.offsetWidth < tableScrollableAreaEl.scrollWidth)
			$('#left-bar-content').addClass('table-has-bottom-scrollbar');

		// programmatically change right margin of column index
		if (tableScrollableAreaEl.offsetHeight < tableScrollableAreaEl.scrollHeight)
			$('#table .top-bar .top-bar-scrollable-area').addClass('table-has-right-scrollbar');
	},
	installResizableBehaviour: function() {
		const self = this;
		let tableScrollableAreaEl = document.querySelector('#table-scrollable-area');

		// install resizable
		$('#table .top-bar .column-index.resizable').resizable({
			handles: 'e',
			start: startResizeHeader,
			resize: resizeHeader,
			stop: stopResizeHeader,
		});

		// change color when mouse over a handle
		$('#table .top-bar .column-index .ui-resizable-handle')
			.mouseover(mouseoverResizableHandle)
			.mouseout(mouseoutResizableHandle);

		// programmatically change height of resize guide
		if(tableScrollableAreaEl.offsetWidth < tableScrollableAreaEl.scrollWidth)
			$('#table .bottom-container .resize-guide').addClass('table-has-bottom-scrollbar');

		function startResizeHeader(event, ui) {
			self.Header.isResizing = true;

			ui.element.find('.ui-resizable-handle')
				.css('background', 'DodgerBlue');
			$('#table .top-bar .column-index .fa-caret-square-down')
				.css('color', 'white')
				.css('pointer-events', 'none');
		}

		function resizeHeader(event, ui) {
			let handleOffset = ui.element.find('.ui-resizable-handle').offset();
			let handleLeft = handleOffset.left - 8 + 3; // 8 = body margin, 3 = handle width

			// change left of the resize guide
			$('#table .bottom-container .resize-guide')
				.css('display', 'block')
				.css('left', handleLeft);
		}

		function stopResizeHeader(event, ui) {
			let columnIndex = parseInt(ui.element.attr('column-index')) + 1;
			let newWidthAfterResizing = (ui.size.width < self.Header.cellMinWidth) ? self.Header.cellMinWidth : ui.size.width;
			let widthConstraintCSS = '';
			let tableContentSelector = '#table .bottom-container #table-scrollable-area #table-content';
			let topBarScrollableAreaSelector = '#table .top-bar .top-bar-scrollable-area';
			let isMouseOnHandle = ui.element.find('.ui-resizable-handle').is(':hover');

			// store resizing rules and generate width constraint CSS
			self.Header.widthConstraintRules[columnIndex] = newWidthAfterResizing;
			widthConstraintCSS = TableHelpers.generateWidthConstraintCSS(tableContentSelector, topBarScrollableAreaSelector, self.Header.widthConstraintRules);
			$('#table-resize-style').html(widthConstraintCSS);

			// restore
			if (!isMouseOnHandle)
				ui.element.find('.ui-resizable-handle')
					.css('background', '');
			$('#table .top-bar .column-index .fa-caret-square-down')
				.css('pointer-events', '');
			$('#table .bottom-container .resize-guide')
				.css('display', '')

			// stop resizing
			self.Header.isResizing = false;
		}

		function mouseoverResizableHandle() {
			let currentFilterButtonEl = $(this.parentNode).find('.fa-caret-square-down')[0];
			let isCurrentFilterButtonClicked = $(currentFilterButtonEl).hasClass('clicked');

			if (!self.Header.isResizing) {
				$(this).css('background', 'DodgerBlue');

				if (!isCurrentFilterButtonClicked)
					$(currentFilterButtonEl).css('color', 'white');
			}	
		}

		function mouseoutResizableHandle() {
			if (!self.Header.isResizing)
				$(this).css('background', '');
		}
	},
	installClickFilterButtonBehaviour: function() {
		$('#table .top-bar .column-index .fa-caret-square-down')
			.click(clickFilterButton);

		function clickFilterButton() {
			let columnIndex = $(this.parentNode).attr('column-index');
			let attributeName = Database.data.columns[columnIndex];
			let buttonPosition = $(this).offset();
			let buttonLeft = buttonPosition.left;
			let buttonTop = buttonPosition.top;
			let buttonHeight = $(this).height();
			let buttonWidth = $(this).width();

			// highlight the button
			$('#table .top-bar .column-index .fa-caret-square-down')
				.removeClass('clicked')
				.css('color', 'white')
			$(this)
				.addClass('clicked')
				.css('color', 'gray');
			$('#tooltip')
				.removeClass('show');

			// show menu
			FilterMenu.show(attributeName, buttonTop + buttonHeight / 2, buttonLeft + buttonWidth / 2);
		}
	},
	installMouseenterHeaderBehaviour: function() {
		const self = this;

		$('#table .top-bar .column-index.resizable')
			.mouseenter(mouseenterHeader)
			.mouseleave(mouseleaveHeader);

		$('#table .top-bar .column-index .fa-caret-square-down')
			.mouseenter(mouseenterFilterButton)
			.mouseleave(mouseleaveFilterButton);

		// need to stop event when dragging
		function mouseenterHeader() {
			let isHeaderResizing = self.Header.isResizing;
			let isCurrentButtonClicked = $(this).find('.fa-caret-square-down').hasClass('clicked');

			if (!isHeaderResizing && !isCurrentButtonClicked)
				$(this).find('.fa-caret-square-down')
					.css('color', '#d3d3d3');
		}

		function mouseleaveHeader() {
			let isHeaderResizing = self.Header.isResizing;
			let isCurrentButtonClicked = $(this).find('.fa-caret-square-down').hasClass('clicked');

			if (!isHeaderResizing && !isCurrentButtonClicked)
				$(this).find('.fa-caret-square-down')
					.css('color', 'white');
		}

		function mouseenterFilterButton() {
			let filterButtonEl = this;
			let isHeaderResizing = self.Header.isResizing;
			let isCurrentButtonClicked = $(filterButtonEl).hasClass('clicked');
			let buttonPos = $(filterButtonEl).offset();
        	let buttonWidth = $(filterButtonEl).width();

			if (!isHeaderResizing && !isCurrentButtonClicked) {
				$('#tooltip')
					.attr('data-tooltip', 'Sort and Filter')
					.css('top', buttonPos.top - 5)
					.css('left', buttonPos.left + buttonWidth / 2)
					.addClass('show')
					.removeClass('left');
				$(filterButtonEl)
					.css('color', 'gray');
			}
		}

		function mouseleaveFilterButton() {
			let filterButtonEl = this;
			let isHeaderResizing = self.Header.isResizing;
			let isCurrentButtonClicked = $(filterButtonEl).hasClass('clicked');

			if (!isHeaderResizing && !isCurrentButtonClicked) {
				$('#tooltip')
					.removeClass('show');
				$(filterButtonEl)
					.css('color', '#d3d3d3');
			}
		}
	},
	showLoader: function() {
		$('#table .loader').css('display', 'block');
	},
	hideLoader: function() {
		$('#table .loader').css('display', 'none');
	}
}