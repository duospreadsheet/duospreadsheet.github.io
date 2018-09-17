const GroupCreatorTabs = {
	currentRules: { and: '', add: '', remove: '', attribute: '' }, // for top and bottom shelf only

	init: function() {
		const self = this;

		self.installClick();
	},
	installClick: function() {
		const self = this;

		$('#group-creator .rule-editor .tabs .tab').on('click', clickTab);

		function clickTab() {
			let tabType = null;

			if ($(this).hasClass('and-tab'))
				tabType = 'and';
			else if ($(this).hasClass('add-tab'))
				tabType = 'add';
			else if ($(this).hasClass('remove-tab'))
				tabType = 'remove';

			self.storeRules();
			self.setActive(tabType);
			GroupCreatorInputBox.restoreRules();
		}
	},
	show: function() {
		$('#group-creator .rule-editor .tabs')
			.css('display', 'block');
	},
	hide: function() {
		$('#group-creator .rule-editor .tabs')
			.css('display', 'none');
	},
	restoreRules: function(inputObject) {
		const self = this;

		self.currentRules = {};
		self.currentRules.and = inputObject.and;
		self.currentRules.add = inputObject.add;
		self.currentRules.remove = inputObject.remove;
		self.currentRules.attribute = inputObject.attribute;
	},
	clearRules: function() {
		const self = this;

		self.currentRules = {};
		self.currentRules.and = '';
		self.currentRules.add = '';
		self.currentRules.remove = '';
		self.currentRules.attribute = '';
	},
	storeRules: function() {
		const self = this;
		let shelfType = $('#group-creator').attr('shelf-type');
		let isTopAndBottomShelf = (shelfType == 'top' || shelfType == 'bottom');
		let isAttributeShelf = (shelfType == 'attribute');
		let isBaseShelf = (shelfType == 'base');
		let isInclusionShelf = (shelfType == 'inclusion');
		let isExclusionShelf = (shelfType == 'exclusion');
		let andIsActive = $('#group-creator .rule-editor .tabs .tab.selected').hasClass('and-tab');
		let addIsActive = $('#group-creator .rule-editor .tabs .tab.selected').hasClass('add-tab');
		let removeIsActive = $('#group-creator .rule-editor .tabs .tab.selected').hasClass('remove-tab');
		let currentRules = $('#group-creator .input-box').text();
		let tabType = null;

		if (isAttributeShelf) tabType = 'attribute';
		if (isTopAndBottomShelf && andIsActive || isBaseShelf) tabType = 'and';
		if (isTopAndBottomShelf && addIsActive || isInclusionShelf) tabType = 'add';
		if (isTopAndBottomShelf && removeIsActive || isExclusionShelf) tabType = 'remove';

		self.currentRules[tabType] = currentRules;
	},
	setActive: function(tabType) {
		$('#group-creator .rule-editor .tabs .tab')
			.removeClass('selected');
		$('#group-creator .rule-editor .tabs .' + tabType + '-tab')
			.addClass('selected');
	},
	setPreviousActive: function() {
		let currentSelectedTabEl = $('#group-creator .rule-editor .tabs .tab.selected')[0];
		let currentSelectedTabHasPrevious = $('#group-creator .rule-editor .tabs .tab.selected').prev().length != 0;

		if (!currentSelectedTabHasPrevious) {
			$('#group-creator .rule-editor .tabs .tab').removeClass('selected');
			$('#group-creator .rule-editor .tabs .remove-tab').addClass('selected');
		}
		if (currentSelectedTabHasPrevious) {
			$('#group-creator .rule-editor .tabs .tab').removeClass('selected');
			$(currentSelectedTabEl).prev().addClass('selected');
		}
	},
	setNextActive: function() {
		let currentSelectedTabEl = $('#group-creator .rule-editor .tabs .tab.selected')[0];
		let currentSelectedTabHasNext = $('#group-creator .rule-editor .tabs .tab.selected').next().length != 0;

		if (!currentSelectedTabHasNext) {
			$('#group-creator .rule-editor .tabs .tab').removeClass('selected');
			$('#group-creator .rule-editor .tabs .and-tab').addClass('selected');
		}
		if (currentSelectedTabHasNext) {
			$('#group-creator .rule-editor .tabs .tab').removeClass('selected');
			$(currentSelectedTabEl).next().addClass('selected');
		}
	}
}