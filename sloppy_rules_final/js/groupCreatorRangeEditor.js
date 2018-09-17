const GroupCreatorRangeEditor = new RangeEditor("#group-creator-range-editor");
GroupCreatorRangeEditor.confirmInputToUpdateSlider = confirmGroupCreatorRangeEditorInput;

//-- functions --//

function confirmGroupCreatorRangeEditorInput() {
	if ($("#group-creator-range-editor").css("display") == "none")
		return;

	let whichTextChanged = $("#group-creator-range-editor").attr("which-text-clicked");
	let originalValue = $("#group-creator-range-editor").attr("original-value");
	let currentValue = Math.round($("#group-creator-range-editor").val() * 100) / 100;
	let isInputEmpty = currentValue == "";

	let shelfType = $('#group-creator').attr('shelf-type');
	let selectedAttrName = $('#group-creator .numerical-attribute-value-pair.menu .attribute.content .container .dummy .attribute-name.selected').attr('attribute-name');
	let attributeValueObject = { lowerValue: null, upperValue: null };

	if (originalValue != currentValue && !isInputEmpty) {
		let value1 = null, value2 = null, newRange = null;

		if (whichTextChanged == "lower") {
			value1 = GroupCreatorNumericalMenu.Slider.el.bootstrapSlider("getValue")[1];
			value2 = parseFloat(currentValue);
			newRange = [ Math.min(value1, value2), Math.max(value1, value2) ];
		}
		if (whichTextChanged == "upper") {
			value1 = GroupCreatorNumericalMenu.Slider.el.bootstrapSlider("getValue")[0];
			value2 = parseFloat(currentValue);
			newRange = [ Math.min(value1, value2), Math.max(value1, value2) ];
		}

		GroupCreatorNumericalMenu.Slider.updateValues(newRange);
		GroupCreatorNumericalMenu.Slider.updateHandles();
		attributeValueObject.lowerValue = GroupCreatorNumericalMenu.Slider.el.bootstrapSlider('getValue')[0];
		attributeValueObject.upperValue = GroupCreatorNumericalMenu.Slider.el.bootstrapSlider('getValue')[1];
	}

	$("#group-creator-range-editor").css("display", "none");
	GroupCreatorInputBox.Rule.changeSelected(shelfType, selectedAttrName, attributeValueObject);
}