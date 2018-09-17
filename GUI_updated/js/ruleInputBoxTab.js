const RuleInputBoxTab = {
	rulesInTabs: { 'base': [], 'inclusion': [], 'exclusion': [] },

	init: function() {
		const self = this;

		self.installClick();
	},
	generateRules: function(ruleType) {
		const self = this;
		let currentRulesInTab = self.rulesInTabs[ruleType];
		let allRules = [];

		for (let i = 0; i < currentRulesInTab.length; i++) {
			let attributeName = currentRulesInTab[i].attributeName;
			let attributeValueObject = currentRulesInTab[i].attributeValueObject;
			let rule = RuleInputBoxInputInputBox.Rule.generate(true, attributeName, attributeValueObject);

			allRules.push(rule);
		}

		return allRules;
	},
	installClick: function() {
		const self = this;

		$('#rule-input-box .rule-type-tab .tab').on('click', clickTab);

		function clickTab() {
			let selectedRuleType = $(this).attr('rule-type');
			let shelfType = $('#rule-input-box').attr('shelf-type');

			self.setActive(selectedRuleType);
			self.loadTagsToInputBox(shelfType, selectedRuleType);
		}
	},
	show: function() {
		$('#rule-input-box .rule-type-tab')
			.css('display', 'block');
	},
	clearRules: function() {
		const self = this;

		self.rulesInTabs.base = [];
		self.rulesInTabs.inclusion = [];
		self.rulesInTabs.exclusion = [];
	},
	appendRule: function(ruleData) {
		const self = this;
		let currentActiveRuleType = $('#rule-input-box .rule-type-tab .tab.active').attr('rule-type');
		let currentRulesInTab = RuleInputBoxTab.rulesInTabs[currentActiveRuleType];

		currentRulesInTab.push(ruleData);
	},
	insertRuleAfter: function(existingRuleData, newRuleData) {
		const self = this;
		let currentActiveRuleType = $('#rule-input-box .rule-type-tab .tab.active').attr('rule-type');
		let currentRulesInTab = RuleInputBoxTab.rulesInTabs[currentActiveRuleType];

		for (let i = 0; i < currentRulesInTab.length; i++) {
			let currentRuleData = currentRulesInTab[i];

			if (currentRuleData == existingRuleData) {
				currentRulesInTab.splice(i + 1, 0, newRuleData);
				break;
			}
		}
	},
	insertRuleBefore: function(existingRuleData, newRuleData) {
		const self = this;
		let currentActiveRuleType = $('#rule-input-box .rule-type-tab .tab.active').attr('rule-type');
		let currentRulesInTab = RuleInputBoxTab.rulesInTabs[currentActiveRuleType];

		for (let i = 0; i < currentRulesInTab.length; i++) {
			let currentRuleData = currentRulesInTab[i];

			if (currentRuleData == existingRuleData) {
				currentRulesInTab.splice(i, 0, newRuleData);
				break;
			}
		}
	},
	removeRule: function(ruleData) {
		const self = this;
		let currentActiveRuleType = $('#rule-input-box .rule-type-tab .tab.active').attr('rule-type');
		let currentRulesInTab = RuleInputBoxTab.rulesInTabs[currentActiveRuleType];

		for (let i = 0; i < currentRulesInTab.length; i++) {
			let currentRuleData = currentRulesInTab[i];

			if (currentRuleData == ruleData) {
				currentRulesInTab.splice(i, 1);
				break;
			}
		}
	},
	setActive: function(ruleType) {
		const self = this;
		let hasCurrentActiveTab = $('#rule-input-box .rule-type-tab .tab.active').length > 0;
		let currentActiveRuleType = null;

		if (hasCurrentActiveTab)
			currentActiveRuleType = $('#rule-input-box .rule-type-tab .tab.active').attr('rule-type');
		if (currentActiveRuleType == ruleType)
			return;

		$('#rule-input-box .rule-type-tab .tab')
			.removeClass('active');
		$('#rule-input-box .rule-type-tab .' + ruleType + '-rule')
			.addClass('active');
	},
	loadTagsToInputBox: function(shelfType, ruleType) {
		const self = this;
		let currentRulesInTab = RuleInputBoxTab.rulesInTabs[ruleType];

		// clear
		cursorTop = RuleInputBoxInputInputBox.Cursor.getStartPositionTop();
		cursorLeft = RuleInputBoxInputInputBox.Cursor.getStartPositionLeft();
		RuleInputBoxInputInputBox.Cursor.show(cursorTop, cursorLeft);
		RuleInputBoxCategoricalMenu.show();
		RuleInputBoxCategoricalMenu.AttributeNameList.display(scrollTop = 0);
		RuleInputBoxCategoricalMenu.AttributeNameList.installClick();
		RuleInputBoxCategoricalMenu.AttributeValueList.hide();
		RuleInputBoxCategoricalMenu.AttributeValueList.clear();
		RuleInputBoxCategoricalMenu.AttributeNameSearchBox.clear();
		RuleInputBoxCategoricalMenu.AttributeValueSearchBox.clear();
		RuleInputBoxInputInputBox.Rule.clear();
		RuleInputBoxInputInputBox.saveSpanEl({}); // remove all

		for (let i = 0; i < currentRulesInTab.length; i++) {
			let attributeName = currentRulesInTab[i].attributeName;
			let attributeValueObject = currentRulesInTab[i].attributeValueObject;

			RuleInputBoxInputInputBox.Rule.add_special(shelfType, attributeName, attributeValueObject, currentRulesInTab[i]);
			RuleInputBoxInputInputBox.Rule.confirm_special();
		}
	},
	changeColour: function(shelfType) {
		let tabColour = Shelf.colour[shelfType];

		$('#rule-input-box .rule-type-tab .tab')
			.css('background-color', tabColour);
	},
	hide: function() {
		$('#rule-input-box .rule-type-tab')
			.css('display', 'none');
	}
}