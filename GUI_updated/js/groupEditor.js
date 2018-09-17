const GroupEditor = {
	currentGroupObject: {},
	copiedCurrentGroupObject: {},

	init: function() {
		const self = this;

		self.installEditNameBehaviour();
		self.installClickShelfBehaviour();
		self.installResizeShelfBehaviour();
		self.installMouseenterShelfBehaviour();
		self.installClearButtonBehaviour();
		self.installCloseButtonBehaviour();
		self.installRestoreButtonBehaviour();
	},
	installEditNameBehaviour: function() {
		const self = this;

		$('#group-editor .name-editor.content input').on('input', inputNewName);

		function inputNewName() {
			let currentName = $(this).val();
			let currentGroupObject = self.currentGroupObject;
			
			currentGroupObject.name = currentName;
			ChangeNameHandler.changeTextNode(currentGroupObject);
			ResultPanel.resizeAnswer(); // question might be resized
			Shelf.update();
		}
	},
	installClickShelfBehaviour: function(event) {
		const self = this;

		$('#group-editor .content .container .dummy').click(clickShelf); // not click already registered in shelfGroup

		function clickShelf(event) {
			let clickedResizeHandle = $(event.target).closest('.ui-resizable-handle').length != 0;
			let clickedRule = $(event.target).closest('.rule .content').length != 0;
			let clickedRemoveButton = $(event.target).closest('.rule .content .fa-times').length != 0;
			let shelfPosition = $(this).offset();
			let shelfTop = shelfPosition.top;
			let shelfLeft = shelfPosition.left;
			let shelfHeight = $(this).height();
			let shelfType = null;
			let tagClass = 'group';

			// determine shelfType
			if ($(event.target).closest('.base-rule-editor').length != 0) { shelfType = 'base'; }
			else if ($(event.target).closest('.inclusion-rule-editor').length != 0) { shelfType = 'inclusion'; }
			else if ($(event.target).closest('.exclusion-rule-editor').length != 0) { shelfType = 'exclusion'; }

			// handle different clicks
			if (clickedRemoveButton) {
				let ruleType = shelfType + 'Rules';
				let clickedTagEl = $(event.target).closest('.rule')[0];
				let currentRule = d3.select(clickedTagEl).datum();
				let ruleIndex = self.currentGroupObject[ruleType].indexOf(currentRule);
				let currentGroupObject = self.currentGroupObject;
				let noBaseRulesAfterRemoval = (shelfType == 'base' && currentGroupObject[ruleType].length == 1);
				let currentBaseRules = null, currentInclusionRules = null, currentExclusionRules = null;
				let newRuleBasedName = null, oldRuleBasedName = null;

				// change rules and ruleBasedName
				currentGroupObject[ruleType].splice(ruleIndex, 1); // remove
				currentBaseRules = currentGroupObject['baseRules'];
				currentInclusionRules = currentGroupObject['inclusionRules'];
				currentExclusionRules = currentGroupObject['exclusionRules'];
				newRuleBasedName = Shelf.generateGroupName(currentBaseRules, currentInclusionRules, currentExclusionRules);
				oldRuleBasedName = currentGroupObject.ruleBasedName;
				currentGroupObject.ruleBasedName = newRuleBasedName;
				if (currentGroupObject.name == oldRuleBasedName)
					currentGroupObject.name = newRuleBasedName;

				// prepare for changing objects
				if (shelfType == 'base' && !noBaseRulesAfterRemoval)
					Shelf.changedGroupObjects.push({
						groupObject: currentGroupObject,
						updateMode: 'addFromExcluded'
					});
				if (shelfType == 'base' && noBaseRulesAfterRemoval) // remove the only base rule
					Shelf.changedGroupObjects.push({
						groupObject: currentGroupObject,
						updateMode: 'removeFromIncluded'
					});
				if (shelfType == 'inclusion')
					Shelf.changedGroupObjects.push({
						groupObject: currentGroupObject,
						updateMode: 'removeFromIncluded'
					});
				if (shelfType == 'exclusion')
					Shelf.changedGroupObjects.push({
						groupObject: currentGroupObject,
						updateMode: 'addFromExcluded'
					});

				// updates (less heavy computation)
				GroupEditor.update();
				ResultPanel.showLoader(); // result panel must update
				$('#tooltip').removeClass('show');

				// updates (more heavy computation)
				setTimeout(function() {
					Shelf.update();
					ResultPanel.update();
					ResultPanel.removeLoader();
				}, 10);
			}

			if (!clickedRule && !clickedResizeHandle) {
				if (shelfType == 'base') { self.showShelf('base'); self.hideShelf('inclusion'); self.hideShelf('exclusion'); Shelf.show('top'); Shelf.show('bottom'); Shelf.show('attribute'); }
				else if (shelfType == 'inclusion') { self.showShelf('base'); self.showShelf('inclusion'); self.hideShelf('exclusion'); Shelf.show('top'); Shelf.show('bottom'); Shelf.show('attribute'); }
				else if (shelfType == 'exclusion') { self.showShelf('base'); self.showShelf('inclusion'); self.showShelf('exclusion'); Shelf.show('top'); Shelf.show('bottom'); Shelf.show('attribute'); }
				RuleInputBox.changeBorder(shelfType);
				RuleInputBox.show(shelfType, shelfTop + shelfHeight + 9, shelfLeft - 2);
				RuleInputBoxInputInputBox.Placeholder.change(shelfType);
				$('#tooltip').removeClass('show');
			}
		}
	},
	installResizeShelfBehaviour: function() {
		$('#group-editor .content').not('#group-editor .name-editor.content').resizable({
			handles: 's',
			start: startResizeShelf, // stop pointer events to prevent flickering
			stop: stopResizeShelf // restart pointer events
		});

		function startResizeShelf(event, ui) {
			$('#group-editor .content .container .dummy')
				.css('pointer-events', 'none');
		}

		function stopResizeShelf(event, ui) {
			$('#group-editor .content .container .dummy')
				.css('pointer-events', '');
		}
	},
	installMouseenterShelfBehaviour: function() {
		$('#group-editor .content .container .dummy')
			.mouseover(mouseoverShelf)
			.mouseout(mouseoutShelf);

		function mouseoverShelf(event) {
			let hoveredResizeHandle = $(event.target).closest('.ui-resizable-handle').length != 0;
			let hoveredRule = $(event.target).closest('.rule .content').length != 0;
			let hoveredRemoveButton = $(event.target).closest('.rule .content .fa-times').length != 0;

			if (hoveredRule && !hoveredRemoveButton) {
				$(this).css('background-color', 'white');
				$('#tooltip').removeClass('show');
			}

			if (hoveredRemoveButton) {
				let shelfContainerPosition = $(this).offset();
				let shelfContainerHeight = $(this).height();

				$(this)
					.css('background-color', 'white');
				$('#tooltip')
					.attr('data-tooltip', 'Click to remove rule')
					.css('top', shelfContainerPosition.top + shelfContainerHeight / 2)
					.css('left', shelfContainerPosition.left - 5)
					.addClass('show')
					.addClass('left');
			}

			if (!hoveredRule && !hoveredRemoveButton) {
				let shelfContainerPosition = $(this).offset();
				let shelfContainerHeight = $(this).height();

				$(this)
					.css('background-color', '#fffff2');
				$('#tooltip')
					.attr('data-tooltip', 'Click to add rules')
					.css('top', shelfContainerPosition.top + shelfContainerHeight / 2)
					.css('left', shelfContainerPosition.left - 5)
					.addClass('show')
					.addClass('left');
			}
		}

		function mouseoutShelf() {
			$(this).css('background-color', 'white');
			$('#tooltip').removeClass('show');
		}
	},
	installClearButtonBehaviour: function() {
		const self = this;

		$('#group-editor .header .clear-btn').click(clickClearButton);

		function clickClearButton(event) {
			let shelfType = null;
			let ruleType = null;
			let currentGroupObject = self.currentGroupObject;

			// determine shelfType
			if ($(event.target).closest('.base-rule-editor').length != 0) { shelfType = 'base'; }
			else if ($(event.target).closest('.inclusion-rule-editor').length != 0) { shelfType = 'inclusion'; }
			else if ($(event.target).closest('.exclusion-rule-editor').length != 0) { shelfType = 'exclusion'; }

			// change rules and ruleBasedName
			ruleType = shelfType + 'Rules';
			currentGroupObject[ruleType] = [];
			currentBaseRules = currentGroupObject['baseRules'];
			currentInclusionRules = currentGroupObject['inclusionRules'];
			currentExclusionRules = currentGroupObject['exclusionRules'];
			newRuleBasedName = Shelf.generateGroupName(currentBaseRules, currentInclusionRules, currentExclusionRules);
			oldRuleBasedName = currentGroupObject.ruleBasedName;
			currentGroupObject.ruleBasedName = newRuleBasedName;
			if (currentGroupObject.name == oldRuleBasedName)
				currentGroupObject.name = newRuleBasedName;

			// prepare for changing objects
			if (shelfType == 'base')
				Shelf.changedGroupObjects.push({
					groupObject: currentGroupObject,
					updateMode: 'removeFromIncluded'
				});
			if (shelfType == 'inclusion')
				Shelf.changedGroupObjects.push({
					groupObject: currentGroupObject,
					updateMode: 'removeFromIncluded'
				});
			if (shelfType == 'exclusion')
				Shelf.changedGroupObjects.push({
					groupObject: currentGroupObject,
					updateMode: 'addFromExcluded'
				});

			// updates (less heavy computation)
			GroupEditor.update();
			ResultPanel.showLoader(); // result panel must update

			// updates (more heavy computation)
			setTimeout(function() {
				Shelf.update();
				ResultPanel.update();
				ResultPanel.removeLoader();
			}, 10);
		}
	},
	installCloseButtonBehaviour: function() {
		const self = this;

		$('#group-editor .close-btn').click(clickCloseButton);

		function clickCloseButton() {
			let currentGroupObject = self.currentGroupObject;
			let selectedTagNameEl = $('#sidebar .shelf .group.selected .content .name')[0];
			let isSelectedTagOnTopShelf = $(selectedTagNameEl).closest('.top-group').length != 0;
			let shortNameLength = isSelectedTagOnTopShelf ? 23 : 18;
			let longGroupName = null, shortGroupName = null;

			let currentGroupName = currentGroupObject.name;
			let currentRuleBasedName = currentGroupObject.ruleBasedName;

			// avoid empty name
			if (currentGroupName === '') {
				currentGroupObject.name = currentRuleBasedName;
				longGroupName = currentGroupObject.name;
				shortGroupName = Helpers.generateShortName(longGroupName, shortNameLength);

				$(selectedTagNameEl).text(shortGroupName);
				ChangeNameHandler.changeTextNode(currentGroupObject);
				ResultPanel.resizeAnswer(); // question might be resized
			}

			// hide and empty things
			Shelf.show('top');
			Shelf.show('bottom');
			Shelf.show('attribute');
			GroupEditor.showShelf('base');
			GroupEditor.showShelf('inclusion');
			GroupEditor.showShelf('exclusion');
			RuleInputBox.hide();

			GroupEditor.hide();
			Table.expand();
			Shelf.removeAllTagHighlights();
			GroupEditor.currentGroupObject = {};
			GroupEditor.copiedCurrentGroupObject = {};
		}
	},
	installRestoreButtonBehaviour: function() {
		const self = this;

		$('#group-editor .restore-btn').click(clickRestoreButton);

		function clickRestoreButton() {
			self.currentGroupObject.name = self.copiedCurrentGroupObject.name;
			self.currentGroupObject.ruleBasedName = self.copiedCurrentGroupObject.ruleBasedName;
			self.currentGroupObject.baseRules = self.copiedCurrentGroupObject.baseRules;
			self.currentGroupObject.inclusionRules = self.copiedCurrentGroupObject.inclusionRules;
			self.currentGroupObject.exclusionRules = self.copiedCurrentGroupObject.exclusionRules;
			self.copiedCurrentGroupObject = self.createDeepCopy(self.currentGroupObject);

			Shelf.show('top');
			Shelf.show('bottom');
			Shelf.show('attribute');
			GroupEditor.showShelf('base');
			GroupEditor.showShelf('inclusion');
			GroupEditor.showShelf('exclusion');
			RuleInputBox.hide();

			// prepare for changing objects
			Shelf.changedGroupObjects.push({
				groupObject: self.currentGroupObject,
				updateMode: 'searchThroughAll'
			});

			// updates (less heavy computation)
			GroupEditor.update();
			ResultPanel.showLoader(); // result panel must update
			
			// updates (more heavy computation)
			setTimeout(function() {
				Shelf.update();
				ResultPanel.update();
				ResultPanel.removeLoader();
			}, 10);
		}
	},
	show: function(groupObject) {
		const self = this;

		self.currentGroupObject = groupObject;
		self.copiedCurrentGroupObject = self.createDeepCopy(groupObject);
		$('#group-editor').css('display', 'inline-block');
	},
	clear: function() {
		$('#group-editor .name-editor.content input').val('');
		$('#group-editor .base-rule-editor.content .container .dummy').empty();
		$('#group-editor .inclusion-rule-editor.content .container .dummy').empty();
		$('#group-editor .exclusion-rule-editor.content .container .dummy').empty();
	},
	hide: function() {
		$('#group-editor').css('display', 'none');
	},
	showShelf: function(shelfType) {
		$('#group-editor .' + shelfType + '-rule-editor')
			.css('opacity', 1);
	},
	hideShelf: function(shelfType) {
		$('#group-editor .' + shelfType + '-rule-editor')
			.css('opacity', 0);
	},
	update: function() {
		const self = this;
		const name = self.currentGroupObject.name;
		const baseRules = self.currentGroupObject.baseRules;
		const inclusionRules = self.currentGroupObject.inclusionRules;
		const exclusionRules = self.currentGroupObject.exclusionRules;
		let isGroupEditorShown = $('#group-editor').css('display') == 'inline-block';

		if (isGroupEditorShown) {
			self.updateName(name);
			self.updateRules('base-rule-editor', baseRules);
			self.updateRules('inclusion-rule-editor', inclusionRules);
			self.updateRules('exclusion-rule-editor', exclusionRules);
		}
	},
	updateName: function(name) {
		$('#group-editor .name-editor.content input').val(name);
	},
	updateRules: function(shelfClassName, rules) {
		let ruleHTML = '';
		let ruleDivs = d3.select('#group-editor .' + shelfClassName + '.content .container .dummy').selectAll('.rule')
			.data(rules);

		// add new and remove old
		ruleDivs.enter().append('div').attr('class', 'rule');
		ruleDivs.exit().remove();

		// update all
		$('#group-editor .' + shelfClassName + '.content .container .dummy').find('.rule').each(function() {
			let currentRule = d3.select(this).datum();
			let currentRuleHTML = '<span class="content">' + currentRule + '<span class="fas fa-times"></span></span>';

			$(this).html(currentRuleHTML);
		});
	},
	createDeepCopy: function(groupObject) {
		return $.extend(true, {}, groupObject);
	}
}