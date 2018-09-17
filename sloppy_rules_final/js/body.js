const Body = {
	clickEvents: [],
	notClickEvents: [],

	init: function() {
		const self = this;

		self.initEnterBehaviour();
		self.initClickBehaviour();
	},
	initEnterBehaviour: function() {
		const self = this;

		$("body").keydown(function(event) {
			let isFilterRangeEditorOpened = $("#filter-range-editor").css('display') == 'block';
			let isGroupCreatorOpened = $('#group-creator').css('display') == 'block';
			let isGroupCreatorRangeEditorOpened = $("#group-creator-range-editor").css('display') == 'block';
			let shelfType = $('#group-creator').attr('shelf-type');

			let pressedEnter = (event.keyCode === 13);
			let pressedUp = (event.keyCode === 38);
			let pressedDown = (event.keyCode === 40);

			if (pressedEnter) {
				if (isFilterRangeEditorOpened)
					FilterRangeEditor.confirmInputToUpdateSlider();
				if (isGroupCreatorRangeEditorOpened)
					GroupCreatorRangeEditor.confirmInputToUpdateSlider();
				
				if (isGroupCreatorOpened && !isGroupCreatorRangeEditorOpened) {
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

			if (pressedUp) {
				if (isGroupCreatorOpened && (shelfType == 'top' || shelfType == 'bottom')) {
					GroupCreatorTabs.storeRules();
					GroupCreatorTabs.setPreviousActive();
					GroupCreatorInputBox.restoreRules();
					event.preventDefault();
				}
			}

			if (pressedDown) {
				if (isGroupCreatorOpened && (shelfType == 'top' || shelfType == 'bottom')) {
					GroupCreatorTabs.storeRules();
					GroupCreatorTabs.setNextActive();
					GroupCreatorInputBox.restoreRules();
					event.preventDefault();
				}
			}
		});
	},
	initClickBehaviour: function() {
		const self = this;

		$('body').mousedown(function(event) {
			let deactivatedNotTargetSelectors = [];

			for (let i = 0; i < self.clickEvents.length; i++) {
				let currentTargetSelector = self.clickEvents[i].targetSelector;
				let onClickCurrentTarget = self.clickEvents[i].onClickTarget;
				let currentDeactivatedNotTargetSelector = self.clickEvents[i].deactivatedNotTargetSelector;
				let clickedCurrentTarget = $(event.target).closest(currentTargetSelector).length != 0;

				if (clickedCurrentTarget) {
					deactivatedNotTargetSelectors.push(currentDeactivatedNotTargetSelector);
					onClickCurrentTarget(event);
				}
			}

			for (let i = 0; i < self.notClickEvents.length; i++) {
				let currentNotTargetSelector = self.notClickEvents[i].notTargetSelector;
				let onClickNotTarget = self.notClickEvents[i].onClickNotTarget;
				let clickedNotTarget = $(event.target).closest(currentNotTargetSelector).length == 0;
				let currentNotTargetSelectorDeactivated = deactivatedNotTargetSelectors.indexOf(currentNotTargetSelector) != -1;

				if (currentNotTargetSelectorDeactivated)
					continue;
				if (clickedNotTarget)
					onClickNotTarget(event);
			}
		});
	},
	registerClickEvent: function(targetSelector, onClickTarget, deactivatedNotTargetSelector = null) {
		const self = this;

		self.clickEvents.push({
			targetSelector: targetSelector,
			onClickTarget: onClickTarget,
			deactivatedNotTargetSelector: deactivatedNotTargetSelector,
		});
	},
	registerNotClickEvent: function(notTargetSelector, onClickNotTarget) {
		const self = this;

		self.notClickEvents.push({
			notTargetSelector: notTargetSelector,
			onClickNotTarget: onClickNotTarget
		});
	},
	removeClickEvent: function(targetSelectorToBeRemoved) {
		const self = this;

		for (let i = 0; i < self.clickEvents.length; i++) {
			let currentTargetSelector = self.clickEvents[i].targetSelector;

			if (currentTargetSelector == targetSelectorToBeRemoved)
				self.clickEvents.splice(i, 1);
		}
	}
}