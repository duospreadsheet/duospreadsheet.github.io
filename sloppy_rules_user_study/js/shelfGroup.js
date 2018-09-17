const ShelfGroup = {
	init: function() {
		const self = this;

		self.installClickBehaviour();
		self.installResizableBehaviour();
		self.installMouseenterShelfBehaviour();
	},
	installClickBehaviour: function() {
		let topGroupShelfSelector = '#sidebar .shelves .shelf.top-group';
		let bottomGroupShelfSelector = '#sidebar .shelves .shelf.bottom-group';
		let attributeShelfSelector = '#sidebar .shelves .shelf.attributes';
		let groupInShelvesSelector = '#sidebar .shelves .shelf .container .group';
		let shelfAndGroupCreatorSelector = '#sidebar .shelves .shelf, #group-creator, #group-creator-range-editor'; // range editor is part of input box
		let groupEditorShelfSelector = '#group-editor .content .container .dummy';
		let groupEditorButtonSelector = '#group-editor .footer .button';

		$(topGroupShelfSelector).click(clickShelf);
		$(bottomGroupShelfSelector).click(clickShelf);
		$(attributeShelfSelector).click(clickShelf);
		Body.registerNotClickEvent(shelfAndGroupCreatorSelector + ',' + groupEditorShelfSelector + ',' + groupEditorButtonSelector, notClickShelf);

		function clickShelf(event) {
			let clickedClearButton = $(event.target).closest('.clear-btn').length != 0;
			let clickedTag = $(event.target).closest('.content').length != 0;
			let clickedRemoveButton = $(event.target).closest('.fa-times').length != 0;
			let clickedEditButton = $(event.target).closest('.fa-edit').length != 0;
			let clickedViewButton = $(event.target).closest('.fa-eye').length != 0;
			let clickedResizeHandle = $(event.target).closest('.ui-resizable-handle').length != 0;
			let shelfPosition = $(this).offset();
			let shelfTop = shelfPosition.top;
			let shelfLeft = shelfPosition.left;
			let shelfHeight = $(this).height();
			let shelfType = null;
			let tagClass = null;

			// determine shelfType and tagClass
			if ($(this).hasClass('top-group')) { shelfType = 'top'; tagClass = 'group'; }
			else if ($(this).hasClass('bottom-group')) { shelfType = 'bottom'; tagClass = 'group'; }
			else if ($(this).hasClass('attributes')) { shelfType = 'attribute'; tagClass = 'attribute'; }

			// handle different clicks
			if (clickedRemoveButton) {
				let clickedTagEl = $(event.target).closest('.' + tagClass)[0];
				let currentDataItem = d3.select(clickedTagEl).datum();
				let isClickedTagSelected = $(clickedTagEl).hasClass('selected');

				if (isClickedTagSelected) {
					GroupEditor.hide();
					GroupViewer.hide();
					Shelf.removeAllTagViewingClass();
				}

				Shelf.removeShelfDataItem(shelfType, currentDataItem);
				Shelf.refreshUI();
				ResultPanel.update();
				$('#tooltip').removeClass('show');
			}

			if (clickedEditButton) {
				let clickedTagEl = $(event.target).closest('.' + tagClass)[0];
				let currentGroupObject = d3.select(clickedTagEl).datum();
				let originalInputObject = currentGroupObject.originalInputObject;

				// show box
				if (shelfType == 'top') { Shelf.show('top'); Shelf.hide('bottom'); Shelf.hide('attribute'); GroupEditor.showShelf('base'); GroupEditor.showShelf('inclusion'); GroupEditor.showShelf('exclusion'); }
				else if (shelfType == 'bottom') { Shelf.show('top'); Shelf.show('bottom'); Shelf.hide('attribute'); GroupEditor.showShelf('base'); GroupEditor.showShelf('inclusion'); GroupEditor.showShelf('exclusion'); }
				else if (shelfType == 'attribute') { Shelf.show('top'); Shelf.show('bottom'); Shelf.show('attribute'); GroupEditor.showShelf('base'); GroupEditor.showShelf('inclusion'); GroupEditor.showShelf('exclusion'); }
				GroupCreator.changeColour(shelfType);
				GroupCreator.show(shelfType, shelfTop + shelfHeight + 8, shelfLeft, originalInputObject, editing = true);
				$('#tooltip').removeClass('show');

				// should not affect tags (group viewer may be opened)
				$(groupInShelvesSelector).removeClass('editing');
				$(clickedTagEl).addClass('editing');
				$('#tooltip').removeClass('show');
			}

			if (clickedViewButton) {
				let clickedTagEl = $(event.target).closest('.' + tagClass)[0];
				let currentGroupObject = d3.select(clickedTagEl).datum();

				// hide the editor as it is not needed
				Shelf.show('top');
				Shelf.show('bottom');
				Shelf.show('attribute');
				GroupEditor.showShelf('base');
				GroupEditor.showShelf('inclusion');
				GroupEditor.showShelf('exclusion');
				GroupCreator.hide();
				Shelf.removeAllTagEditingClass();

				// show them first
				GroupEditor.clear(); // avoid seeing what previously was there
				GroupViewer.clear(); // avoid seeing what previously was there
				Shelf.sortObjectsInGroupByIndex(currentGroupObject);
				Shelf.resetAddedAndRemoved(currentGroupObject);
				GroupEditor.show(currentGroupObject);
				GroupViewer.show();
				GroupEditor.update();
				GroupViewer.update();

				$(groupInShelvesSelector).removeClass('selected');
				$(clickedTagEl).addClass('selected');
				$('#tooltip').removeClass('show');
			}

			if (clickedClearButton) {
				Shelf.clearShelfData(shelfType);
				Shelf.update();
				ResultPanel.update();

				if (shelfType == 'bottom') {
					GroupEditor.hide();
					GroupViewer.hide();
				}
			}

			if (!clickedTag && !clickedResizeHandle && !clickedClearButton) {
				if (shelfType == 'top') { Shelf.show('top'); Shelf.hide('bottom'); Shelf.hide('attribute'); GroupEditor.showShelf('base'); GroupEditor.showShelf('inclusion'); GroupEditor.showShelf('exclusion'); }
				else if (shelfType == 'bottom') { Shelf.show('top'); Shelf.show('bottom'); Shelf.hide('attribute'); GroupEditor.showShelf('base'); GroupEditor.showShelf('inclusion'); GroupEditor.showShelf('exclusion'); }
				else if (shelfType == 'attribute') { Shelf.show('top'); Shelf.show('bottom'); Shelf.show('attribute'); GroupEditor.showShelf('base'); GroupEditor.showShelf('inclusion'); GroupEditor.showShelf('exclusion'); }
				GroupCreator.changeColour(shelfType);
				GroupCreator.show(shelfType, shelfTop + shelfHeight + 8, shelfLeft);
				$('#tooltip').removeClass('show');
			}
		}

		function notClickShelf() {
			var isGroupCreatorOpened = $("#group-creator").css("display") == "block";

			if (isGroupCreatorOpened) {
				let inputObject = null;
				let ruleObject = null;

				GroupCreatorTabs.storeRules();
				inputObject = GroupCreatorTabs.currentRules;
				ruleObject = GroupCreator.convertInputToRules(inputObject);

				if (!GroupCreator.isInvalidInput(ruleObject)) {
					GroupCreator.pushRulesToShelf(ruleObject, inputObject);
					Shelf.removeAllTagEditingClass();
				}
			}
		}
	},
	installResizableBehaviour: function() {
		$('#sidebar .shelves .bottom-group.shelf, #sidebar .shelves .attributes.shelf')
			.resizable({
				handles: 's',
				start: startResizeShelf, // stop pointer events to prevent flickering
				resize: resizingShelf,
				stop: stopResizeShelf // restart pointer events
			});

		function startResizeShelf(event, ui) {
			Shelf.show('top');
			Shelf.show('bottom');
			Shelf.show('attribute');
			GroupEditor.showShelf('base');
			GroupEditor.showShelf('inclusion');
			GroupEditor.showShelf('exclusion');
			GroupCreator.hide();

			$('#sidebar .shelves .shelf')
				.css('pointer-events', 'none');
		}

		function resizingShelf() {
			ResultPanel.resize();
		}

		function stopResizeShelf(event, ui) {
			$('#sidebar .shelves .shelf')
				.css('pointer-events', '');
		}
	},
	installMouseenterShelfBehaviour: function() {
		$('#sidebar .shelves .shelf')
			.mouseover(mouseoverShelf)
			.mouseout(mouseoutShelf);

		function mouseoverShelf(event) {
			let hoveredClearButton = $(event.target).closest('.clear-btn').length != 0;
			let hoveredResizeHandle = $(event.target).closest('.ui-resizable-handle').length != 0;
			let hoveredGroup = $(event.target).closest('.group .content').length != 0;
			let hoveredAttribute =  $(event.target).closest('.attribute .content').length != 0;
			let hoveredEditButton = $(event.target).closest('.group .content .fa-edit').length != 0;
			let hoveredViewButton = $(event.target).closest('.group .content .fa-eye').length != 0;
			let hoveredRemoveButton = $(event.target).closest('.group .content .fa-times').length != 0
								  || $(event.target).closest('.attribute .content .fa-times').length != 0;

			if ((hoveredGroup || hoveredAttribute) && !hoveredEditButton && !hoveredRemoveButton) {
				$(this).find('.container')
					.css('background-color', 'white');
				$('#tooltip')
					.removeClass('show');
			}

			if ((hoveredGroup || hoveredAttribute) && (hoveredEditButton || hoveredRemoveButton || hoveredViewButton)) {
				let currentTagPos = hoveredGroup ? $(event.target).closest('.group .content').offset() : $(event.target).closest('.attribute .content').offset();
        		let currentTagHeight = hoveredGroup ? $(event.target).closest('.group .content').height() : $(event.target).closest('.attribute .content').height();
        		let tooltipText = hoveredEditButton ? 'Click to edit the group' : 'Click to remove the group';

        		if (hoveredEditButton)
        			tooltipText = 'Click to edit the group';
        		if (hoveredRemoveButton)
        			tooltipText = 'Click to remove the group';
        		if (hoveredViewButton)
        			tooltipText = 'Click to open group viewer';

	        	$('#tooltip')
					.attr('data-tooltip', tooltipText)
					.css('top', currentTagPos.top + currentTagHeight / 2)
					.css('left', currentTagPos.left - 7)
					.addClass('show')
					.addClass('left');
			}

			if (hoveredClearButton) {
				let shelfPosition = $(this).offset();
				let shelfHeight = $(this).height();

				$('#tooltip')
					.attr('data-tooltip', 'Click to clear shelf')
					.css('top', shelfPosition.top + shelfHeight / 2)
					.css('left', shelfPosition.left - 5)
					.addClass('show')
					.addClass('left');
			}	

			if (!hoveredGroup && !hoveredAttribute && !hoveredResizeHandle && !hoveredClearButton) {
				let shelfPosition = $(this).offset();
				let shelfHeight = $(this).height();

				if ($(this).hasClass('top-group') && Shelf.data['top'].length == 0)
					tooltipText = 'Click to Add Group';
				if ($(this).hasClass('top-group') && Shelf.data['top'].length == 1)
					tooltipText = 'Click to Replace Group';
				if ($(this).hasClass('bottom-group'))
					tooltipText = 'Click to Add Group';
				if ($(this).hasClass('attributes'))
					tooltipText = 'Click to Add Attribute';

				$(this).find('.container')
					.css('background-color', '#fffff2');
				$('#tooltip')
					.attr('data-tooltip', tooltipText)
					.css('top', shelfPosition.top + shelfHeight / 2)
					.css('left', shelfPosition.left - 5)
					.addClass('show')
					.addClass('left');
			}			
		}

		function mouseoutShelf() {
			$(this).find('.container').css('background-color', 'white');
			$('#tooltip').removeClass('show');
		}
	}
}