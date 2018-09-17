const RuleInputBoxRangeEditor = new RangeEditor("#rule-input-range-editor");
RuleInputBoxRangeEditor.confirmInputToUpdateSlider = confirmRuleInputBoxRangeEditorInput;

//-- functions --//

function confirmRuleInputBoxRangeEditorInput() {
	if ($("#rule-input-range-editor").css("display") == "none")
		return;

	var whichTextChanged = $("#rule-input-range-editor").attr("which-text-clicked");
	var originalValue = $("#rule-input-range-editor").attr("original-value");
	var currentValue = Math.round($("#rule-input-range-editor").val() * 100) / 100;
	var isInputEmpty = currentValue == "";

	let shelfType = $('#rule-input-box').attr('shelf-type');
	let selectedAttrName = $('#rule-input-box .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name.selected').attr('attribute-name');
	var attributeValueObject = { lowerValue: null, upperValue: null };

	if (originalValue != currentValue && !isInputEmpty) {
		var value1 = null, value2 = null, newRange = null;

		if (whichTextChanged == "lower") {
			value1 = RuleInputBoxNumericalMenu.Slider.el.bootstrapSlider("getValue")[1];
			value2 = parseFloat(currentValue);
			newRange = [ Math.min(value1, value2), Math.max(value1, value2) ];
		}
		if (whichTextChanged == "upper") {
			value1 = RuleInputBoxNumericalMenu.Slider.el.bootstrapSlider("getValue")[0];
			value2 = parseFloat(currentValue);
			newRange = [ Math.min(value1, value2), Math.max(value1, value2) ];
		}

		RuleInputBoxNumericalMenu.Slider.updateValues(newRange);
		RuleInputBoxNumericalMenu.Slider.updateHandles();
		attributeValueObject.lowerValue = RuleInputBoxNumericalMenu.Slider.el.bootstrapSlider('getValue')[0];
		attributeValueObject.upperValue = RuleInputBoxNumericalMenu.Slider.el.bootstrapSlider('getValue')[1];
	}

	$("#rule-input-range-editor").css("display", "none");
	RuleInputBoxInputInputBox.Rule.add(shelfType, selectedAttrName, attributeValueObject);
}