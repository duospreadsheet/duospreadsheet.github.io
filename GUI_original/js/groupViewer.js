const GroupViewer = {
	headerHTML: null,
	includedRecordIndexColumnHTML: null,
	includedRecordRowHTML: null,
	excludedRecordIndexColumnHTML: null,
	excludedRecordRowHTML: null,

	includedRecordIndexColumnClusterizeObject: null,
	includedRecordTableClusterizeObject: null,
	excludedRecordIndexColumnClusterizeObject: null,
	excludedRecordTableClusterizeObject: null,

	Header: {
		top: { cellMinWidth: 60, isResizing: false, widthConstraintRules: {} },
		bottom: { cellMinWidth: 60, isResizing: false, widthConstraintRules: {} } // { columnIndex: width }
	},
	lastScrollLeft: { 
		top: 0, 
		bottom: 0 
	},
	lastOperation: {
		addToViewer: null,
		numberOfRecordsAdded: null,
		operation: null
	},
	init: function() {
		const self = this;

		self.includedRecordIndexColumnClusterizeObject = new Clusterize({
			rows: self.includedRecordIndexColumnHTML,
		  	scrollId: 'included-record-left-bar-scrollable-area',
		  	contentId: 'included-record-left-bar-content',
		  	no_data_text: ''
		});
		self.includedRecordTableClusterizeObject = new Clusterize({
			rows: self.includedRecordRowHTML,
		  	scrollId: 'included-record-table-scrollable-area',
		  	contentId: 'included-record-table-content',
		  	no_data_text: ''
		});
		self.excludedRecordIndexColumnClusterizeObject = new Clusterize({
			rows: self.excludedRecordIndexColumnHTML,
		  	scrollId: 'excluded-record-left-bar-scrollable-area',
		  	contentId: 'excluded-record-left-bar-content',
		  	no_data_text: ''
		});
		self.excludedRecordTableClusterizeObject = new Clusterize({
			rows: self.excludedRecordRowHTML,
		  	scrollId: 'excluded-record-table-scrollable-area',
		  	contentId: 'excluded-record-table-content',
		  	no_data_text: ''
		});
	},
	update: function () {
		const self = this;
		let isGroupViewerShown = $('#group-viewer').css('display') == 'inline-block';

		if (isGroupViewerShown) {
			// less heavy computation
			self.generateHeaderHTML();
			self.updateIncludedRecordCount();
			self.updateExcludedRecordCount();
			self.updateLastOperationText();
			self.showIncludedRecordLoader();
			self.showExcludedRecordLoader();

			// heavy computation
			setTimeout(function() {
				self.generateIncludedRecordHTML();
				self.renderIncludedRecordHeader();
				self.renderIncludedRecordIndexColumn();
				self.renderIncludedRecordTable();
				self.installScrollBehaviour('includedRecord');
				self.installResizableBehaviour('includedRecord');
				self.installMouseenterHeaderBehaviour('includedRecord');
				self.installClickSeeDistButtonBehaviour('includedRecord');
				self.hideIncludedRecordLoader();
			}, 10);

			// heavy computation
			setTimeout(function() {
				self.generateExcludedRecordHTML();
				self.renderExcludedRecordHeader();
				self.renderExcludedRecordIndexColumn();
				self.renderExcludedRecordTable();
				self.installScrollBehaviour('excludedRecord');
				self.installResizableBehaviour('excludedRecord');
				self.installMouseenterHeaderBehaviour('excludedRecord');
				self.installClickSeeDistButtonBehaviour('excludedRecord');
				self.hideExcludedRecordLoader();
			}, 10);
		}
	},
	clear: function() {
		const self = this;
		
		$('#group-viewer .top.viewer .top-bar .top-bar-scrollable-area').empty();
		$('#group-viewer .bottom.viewer .top-bar .top-bar-scrollable-area').empty();
		self.includedRecordIndexColumnClusterizeObject.update([]);
		self.excludedRecordIndexColumnClusterizeObject.update([]);
		self.includedRecordTableClusterizeObject.update([]);
		self.excludedRecordTableClusterizeObject.update([]);
		self.lastOperation.addToViewer = null;
		self.lastOperation.numberOfRecordsAdded = null;
		self.lastOperation.operation = null;
	},
	show: function() {
		$('#group-viewer').css('display', 'inline-block');
		$('#table').css('display', 'none');
	},
	hide: function() {
		$('#table').css('display', 'inline-block');
		$('#group-viewer').css('display', 'none');
	},
	showIncludedRecordLoader: function() {
		$('#group-viewer .top.viewer .loader')
			.css('display', 'block');
	},
	showExcludedRecordLoader: function() {
		$('#group-viewer .bottom.viewer .loader')
			.css('display', 'block');
	},
	hideIncludedRecordLoader: function() {
		$('#group-viewer .top.viewer .loader')
			.css('display', 'none');
	},
	hideExcludedRecordLoader: function() {
		$('#group-viewer .bottom.viewer .loader')
			.css('display', 'none');
	},
	updateIncludedRecordCount: function() {
		let includedRecordCount = GroupEditor.currentGroupObject.includedObjects.length;

		$('#group-viewer .top.viewer .header .count')
			.html('Included Records (' + includedRecordCount + ')');
	},
	updateExcludedRecordCount: function() {
		let excludedRecordCount = GroupEditor.currentGroupObject.excludedObjects.length;

		$('#group-viewer .bottom.viewer .header .count')
			.html('Excluded Records (' + excludedRecordCount + ')');
	},
	updateLastOperationText: function() {
		const self = this;
		let lastOperationText = '';
		let changedTopOrBottomViewerSelector = null;
		let unchangedTopOrBottomViewerSelector = null;
		let noLastOperation = self.lastOperation.addToViewer === null &&
						      self.lastOperation.operation === null;

		if (noLastOperation) {
			$('#group-viewer .top.viewer .header .last-operation').html('');
			$('#group-viewer .bottom.viewer .header .last-operation').html('');
			return;
		}

		changedTopOrBottomViewerSelector = (self.lastOperation.addToViewer == 'excluded') ? '.bottom.viewer' : '.top.viewer';
		unchangedTopOrBottomViewerSelector = (self.lastOperation.addToViewer == 'excluded') ? '.top.viewer' : '.bottom.viewer';
		
		lastOperationText += self.lastOperation.numberOfRecordsAdded;
		lastOperationText += (self.lastOperation.numberOfRecordsAdded > 1) ? ' records are ' : ' record is ';
		lastOperationText += (self.lastOperation.addToViewer == 'excluded') ? ' removed after ' : ' added after ';
		lastOperationText += self.lastOperation.operation;
		
		$('#group-viewer ' + changedTopOrBottomViewerSelector + ' .header .last-operation').html(lastOperationText);
		$('#group-viewer ' + unchangedTopOrBottomViewerSelector + ' .header .last-operation').html('');
	},
	generateHeaderHTML: function() {
		const self = this;
		self.headerHTML = TableHelpers.createHeaderHTML();
	},
	generateIncludedRecordHTML: function() {
		const self = this;
		const includedRecordRowData = GroupEditor.currentGroupObject.includedObjects;
		self.includedRecordIndexColumnHTML = TableHelpers.createIndexColumnHTML(includedRecordRowData);
		self.includedRecordRowHTML = TableHelpers.createRowHTML(includedRecordRowData);
	},
	generateExcludedRecordHTML: function() {
		const self = this;
		const excludedRecordRowData = GroupEditor.currentGroupObject.excludedObjects;
		self.excludedRecordIndexColumnHTML = TableHelpers.createIndexColumnHTML(excludedRecordRowData);
		self.excludedRecordRowHTML = TableHelpers.createRowHTML(excludedRecordRowData);
	},
	renderIncludedRecordHeader: function() {
		const self = this;

		$('#group-viewer .top.viewer .top-bar .top-bar-scrollable-area')
			.html(self.headerHTML);
	},
	renderExcludedRecordHeader: function() {
		const self = this;

		$('#group-viewer .bottom.viewer .top-bar .top-bar-scrollable-area')
			.html(self.headerHTML);
	},
	renderIncludedRecordIndexColumn: function() {
		const self = this;

		self.includedRecordIndexColumnClusterizeObject
			.update(self.includedRecordIndexColumnHTML);

		// restore scroll
		document.getElementById('included-record-left-bar-scrollable-area').scrollTop = 0;
		document.getElementById('included-record-left-bar-scrollable-area').scrollLeft = 0;
	},
	renderExcludedRecordIndexColumn: function() {
		const self = this;

		self.excludedRecordIndexColumnClusterizeObject
			.update(self.excludedRecordIndexColumnHTML);

		// restore scroll
		document.getElementById('excluded-record-left-bar-scrollable-area').scrollTop = 0;
		document.getElementById('excluded-record-left-bar-scrollable-area').scrollLeft = 0;
	},
	renderIncludedRecordTable: function() {
		const self = this;

		self.includedRecordTableClusterizeObject
			.update(self.includedRecordRowHTML);

		// restore scroll
		document.getElementById('included-record-table-scrollable-area').scrollTop = 0;
		document.getElementById('included-record-table-scrollable-area').scrollLeft = 0;
	},
	renderExcludedRecordTable: function() {
		const self = this;

		self.excludedRecordTableClusterizeObject
			.update(self.excludedRecordRowHTML);

		// restore scroll
		document.getElementById('excluded-record-table-scrollable-area').scrollTop = 0;
		document.getElementById('excluded-record-table-scrollable-area').scrollLeft = 0;
	},
	installScrollBehaviour: function(includedOrExcluded) {
		const self = this;
		let topOrBottom = (includedOrExcluded == 'includedRecord') ? 'top' : 'bottom';
		let tableScrollableAreaSelector = '#group-viewer .' + topOrBottom + '.viewer .content .bottom-container .table-scrollable-area';
		let leftBarScrollableAreaSelector = '#group-viewer .' + topOrBottom + '.viewer .content .bottom-container .left-bar-scrollable-area';
		let topBarScrollableAreaSelector = '#group-viewer .' + topOrBottom + '.viewer .content .top-bar .top-bar-scrollable-area';
		let leftBarContentSelector = '#group-viewer .' + topOrBottom + '.viewer .content .bottom-container .left-bar-content'
		let tableScrollableAreaEl = document.querySelector(tableScrollableAreaSelector);

		// programmatically scroll index column
		$(tableScrollableAreaSelector).on('scroll', function(event) {
			let isTop = $(this).closest('.top.viewer').length != 0;
			let topOrBottom = isTop ? 'top' : 'bottom';
			let tableScrollTop = $(this).scrollTop();
			let tableScrollLeft = $(this).scrollLeft();
			let isHorizontalScroll = self.lastScrollLeft[topOrBottom] != tableScrollLeft;
			let isDistPaneOpened = $('#distribution-pane').css('display') == 'block';
			let isDistPaneAndScrollAtTheSameViewer = $('#distribution-pane').attr('viewer') == topOrBottom;

			if (isHorizontalScroll && isDistPaneOpened && isDistPaneAndScrollAtTheSameViewer)
				DistributionPane.hide();

			$(leftBarScrollableAreaSelector).scrollTop(tableScrollTop);
			$(topBarScrollableAreaSelector).scrollLeft(tableScrollLeft);
			self.lastScrollLeft[topOrBottom] = tableScrollLeft;
		});

		// programmatically change bottom margin of row index
		if (tableScrollableAreaEl.offsetWidth < tableScrollableAreaEl.scrollWidth)
			$(leftBarContentSelector).addClass('table-has-bottom-scrollbar');

		// programmatically change right margin of column index
		if (tableScrollableAreaEl.offsetHeight < tableScrollableAreaEl.scrollHeight)
			$(topBarScrollableAreaSelector).addClass('table-has-right-scrollbar');
	},
	installResizableBehaviour: function(includedOrExcluded) {
		const self = this;
		let topOrBottom = (includedOrExcluded == 'includedRecord') ? 'top' : 'bottom';
		let tableScrollableAreaSelector = '#group-viewer .' + topOrBottom + '.viewer .content .bottom-container .table-scrollable-area';
		let topBarResizableColumnIndexSelector = '#group-viewer .' + topOrBottom + '.viewer .content .top-bar .column-index.resizable';
		let topBarResizableHandleSelector = '#group-viewer .' + topOrBottom + '.viewer .content .top-bar .column-index .ui-resizable-handle';
		let resizeGuideSelector = '#group-viewer .' + topOrBottom + '.viewer .bottom-container .resize-guide';
		let tableScrollableAreaEl = document.querySelector(tableScrollableAreaSelector);

		// install resizable
		$(topBarResizableColumnIndexSelector).resizable({
			handles: 'e',
			start: startResizeHeader,
			resize: resizeHeader,
			stop: stopResizeHeader,
		});

		// change color when mouse over a handle
		$(topBarResizableHandleSelector)
			.mouseover(mouseoverResizableHandle)
			.mouseout(mouseoutResizableHandle);

		// programmatically change height of resize guide
		if(tableScrollableAreaEl.offsetWidth < tableScrollableAreaEl.scrollWidth)
			$(resizeGuideSelector).addClass('table-has-bottom-scrollbar');

		function startResizeHeader(event, ui) {
			let isTop = $(this).closest('.top.viewer').length != 0;
			let topOrBottom = isTop ? 'top' : 'bottom';
			let topBarSeeDistButtonSelector = '#group-viewer .top-bar .column-index .fa-caret-square-down';

			self.Header[topOrBottom].isResizing = true;
			ui.element.find('.ui-resizable-handle')
				.css('background', 'DodgerBlue');
			$(topBarSeeDistButtonSelector)
				.css('color', 'white')
				.css('pointer-events', 'none');
		}

		function resizeHeader(event, ui) {
			let isTop = $(this).closest('.top.viewer').length != 0;
			let topOrBottom = isTop ? 'top' : 'bottom';
			let handleOffset = ui.element.find('.ui-resizable-handle').offset();
			let handleLeft = handleOffset.left - 8 + 3; // 8 = body margin, 3 = handle width
			let resizeGuideSelector = '#group-viewer .' + topOrBottom + '.viewer .bottom-container .resize-guide';

			// change left of the resize guide
			$(resizeGuideSelector)
				.css('display', 'block')
				.css('left', handleLeft);
		}

		function stopResizeHeader(event, ui) {
			let isTop = $(this).closest('.top.viewer').length != 0;
			let topOrBottom = isTop ? 'top' : 'bottom';
			let includedOrExcluded = isTop ? 'included' : 'excluded';
			let columnIndex = parseInt(ui.element.attr('column-index')) + 1;
			let newWidthAfterResizing = (ui.size.width < self.Header[topOrBottom].cellMinWidth) ? self.Header[topOrBottom].cellMinWidth : ui.size.width;
			let widthConstraintCSS = '';
			let tableContentSelector = '#group-viewer .' + topOrBottom + '.viewer .bottom-container .table-scrollable-area .table-content';
			let topBarScrollableAreaSelector = '#group-viewer .' + topOrBottom + '.viewer .top-bar .top-bar-scrollable-area';
			let topBarSeeDistButtonSelector = '#group-viewer .top-bar .column-index .fa-caret-square-down';
			let resizeGuideSelector = '#group-viewer .' + topOrBottom + '.viewer .bottom-container .resize-guide';
			let tableResizeStyleSelector = '#' + includedOrExcluded + '-record-table-resize-style';
			let isMouseOnHandle = ui.element.find('.ui-resizable-handle').is(':hover');

			// store resizing rules and generate width constraint CSS
			self.Header[topOrBottom].widthConstraintRules[columnIndex] = newWidthAfterResizing;
			widthConstraintCSS = TableHelpers.generateWidthConstraintCSS(tableContentSelector, topBarScrollableAreaSelector, self.Header[topOrBottom].widthConstraintRules);
			$(tableResizeStyleSelector).html(widthConstraintCSS);

			// restore
			if (!isMouseOnHandle)
				ui.element.find('.ui-resizable-handle')
					.css('background', '');
			$(topBarSeeDistButtonSelector)
				.css('pointer-events', '');
			$(resizeGuideSelector)
				.css('display', '');

			// stop resizing
			self.Header[topOrBottom].isResizing = false;
		}

		function mouseoverResizableHandle() {
			let isTop = $(this).closest('.top.viewer').length != 0;
			let topOrBottom = isTop ? 'top' : 'bottom';
			let currentSeeDistButtonEl = $(this.parentNode).find('.fa-caret-square-down')[0];
			let isCurrentSeeDistButtonClicked = $(currentSeeDistButtonEl).hasClass('clicked');

			if (!self.Header[topOrBottom].isResizing) {
				$(this).css('background', 'DodgerBlue');

				if (!isCurrentSeeDistButtonClicked)
					$(currentSeeDistButtonEl).css('color', 'white');
			}
		}

		function mouseoutResizableHandle() {
			let isTop = $(this).closest('.top.viewer').length != 0;
			let topOrBottom = isTop ? 'top' : 'bottom';

			if (!self.Header[topOrBottom].isResizing)
				$(this).css('background', '');
		}
	},
	installMouseenterHeaderBehaviour: function(includedOrExcluded) {
		const self = this;
		let topOrBottom = (includedOrExcluded == 'includedRecord') ? 'top' : 'bottom';
		let topBarResizableColumnIndexSelector = '#group-viewer .' + topOrBottom + '.viewer .content .top-bar .column-index.resizable';
		let topBarSeeDistButtonSelector = '#group-viewer .' + topOrBottom + '.viewer .content .top-bar .column-index .fa-caret-square-down';

		$(topBarResizableColumnIndexSelector)
			.mouseenter(mouseenterHeader)
			.mouseleave(mouseleaveHeader);

		$(topBarSeeDistButtonSelector)
			.mouseenter(mouseenterSeeDistButton)
			.mouseleave(mouseleaveSeeDistButton);

		function mouseenterHeader() {
			let isTop = $(this).closest('.top.viewer').length != 0;
			let topOrBottom = isTop ? 'top' : 'bottom';
			let isHeaderResizing = self.Header[topOrBottom].isResizing;
			let isCurrentButtonClicked = $(this).find('.fa-caret-square-down').hasClass('clicked');

			if (!isHeaderResizing && !isCurrentButtonClicked)
				$(this).find('.fa-caret-square-down')
					.css('color', '#7fb8e8');
		}

		function mouseleaveHeader() {
			let isTop = $(this).closest('.top.viewer').length != 0;
			let topOrBottom = isTop ? 'top' : 'bottom';
			let isHeaderResizing = self.Header[topOrBottom].isResizing;
			let isCurrentButtonClicked = $(this).find('.fa-caret-square-down').hasClass('clicked');

			if (!isHeaderResizing && !isCurrentButtonClicked)
				$(this).find('.fa-caret-square-down')
					.css('color', 'white');
		}

		function mouseenterSeeDistButton() {
			let isTop = $(this).closest('.top.viewer').length != 0;
			let topOrBottom = isTop ? 'top' : 'bottom';
			let seeDistButtonEl = this;
			let isHeaderResizing = self.Header[topOrBottom].isResizing;
			let isCurrentButtonClicked = $(seeDistButtonEl).hasClass('clicked');
			let buttonPos = $(seeDistButtonEl).offset();
        	let buttonWidth = $(seeDistButtonEl).width();

			if (!isHeaderResizing && !isCurrentButtonClicked) {
				$('#tooltip')
					.attr('data-tooltip', 'See Distribution')
					.css('top', buttonPos.top - 5)
					.css('left', buttonPos.left + buttonWidth / 2)
					.addClass('show')
					.removeClass('left');
				$(seeDistButtonEl)
					.css('color', '#1c4060');
			}
		}

		function mouseleaveSeeDistButton() {
			let isTop = $(this).closest('.top.viewer').length != 0;
			let topOrBottom = isTop ? 'top' : 'bottom';
			let seeDistButtonEl = this;
			let isHeaderResizing = self.Header[topOrBottom].isResizing;
			let isCurrentButtonClicked = $(seeDistButtonEl).hasClass('clicked');

			if (!isHeaderResizing && !isCurrentButtonClicked) {
				$('#tooltip')
					.removeClass('show');
				$(seeDistButtonEl)
					.css('color', '#7fb8e8');
			}
		}
	},
	installClickSeeDistButtonBehaviour: function(includedOrExcluded) {
		const self = this;
		let topOrBottom = (includedOrExcluded == 'includedRecord') ? 'top' : 'bottom';
		let topBarSeeDistButtonSelector = '#group-viewer .' + topOrBottom + '.viewer .content .top-bar .column-index .fa-caret-square-down';

		$(topBarSeeDistButtonSelector)
			.click(clickSeeDistButton);

		function clickSeeDistButton() {
			let isTop = $(this).closest('.top.viewer').length != 0;
			let topOrBottom = isTop ? 'top' : 'bottom';
			let seeDistButtonEl = this;
			let columnIndex = $(this.parentNode).attr('column-index');
			let attributeName = Database.data.columns[columnIndex];
			let buttonPosition = $(this).offset();
			let buttonLeft = buttonPosition.left;
			let buttonTop = buttonPosition.top;
			let buttonHeight = $(this).height();
			let buttonWidth = $(this).width();

			// highlight the button
			$('#group-viewer .top-bar .column-index .fa-caret-square-down')
				.removeClass('clicked')
				.css('color', 'white')
			$(seeDistButtonEl)
				.addClass('clicked')
				.css('color', '#1c4060');
			$('#tooltip')
				.removeClass('show');

			// show menu
			DistributionPane.show(attributeName, topOrBottom, buttonTop + buttonHeight / 2, buttonLeft + buttonWidth / 2);
		}
	}
}