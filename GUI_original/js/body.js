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

		$("body").keypress(function(event) {
			if (event.keyCode === 13) {
				let isRuleInputBoxOpened = $('#rule-input-box').css('display') == 'block';
				let isRuleInputBoxRuleSelected = ($('#rule-input-box .input-box .rule-container .rule.selected').length != 0);
				let isRuleInputBoxRangeEditorOpened = $("#rule-input-range-editor").css('display') == 'block';
				let isFilterRangeEditorOpened = $("#filter-range-editor").css('display') == 'block';

				if (isRuleInputBoxRangeEditorOpened)
					RuleInputBoxRangeEditor.confirmInputToUpdateSlider();

				if (isRuleInputBoxOpened && !isRuleInputBoxRangeEditorOpened && isRuleInputBoxRuleSelected)
					RuleInputBoxInputInputBox.Rule.confirm();

				if (isRuleInputBoxOpened && !isRuleInputBoxRangeEditorOpened && !isRuleInputBoxRuleSelected)
					RuleInputBox.onAddToShelf();

				if (isFilterRangeEditorOpened)
					FilterRangeEditor.confirmInputToUpdateSlider();
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