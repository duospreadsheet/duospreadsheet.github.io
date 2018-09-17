let FilterRangeEditor = new RangeEditor('#filter-range-editor');
FilterRangeEditor.confirmInputToUpdateSlider = confirmFilterRangeEditorInput;

//-- functions --//

function confirmFilterRangeEditorInput() {
	if ($('#filter-range-editor').css('display') == 'none')
		return;

	var whichTextChanged = $('#filter-range-editor').attr('which-text-clicked');
	var originalValue = $('#filter-range-editor').attr('original-value');
	var currentValue = Math.round($('#filter-range-editor').val() * 100) / 100;
	var isInputEmpty = currentValue == '';

	if (originalValue != currentValue && !isInputEmpty) {
		var value1 = null, value2 = null, newRange = null;

		if (whichTextChanged == 'lower') {
			value1 = FilterMenu.Slider.el.bootstrapSlider('getValue')[1];
			value2 = parseFloat(currentValue);
			newRange = [ Math.min(value1, value2), Math.max(value1, value2) ];
		}
		if (whichTextChanged == 'upper') {
			value1 = FilterMenu.Slider.el.bootstrapSlider('getValue')[0];
			value2 = parseFloat(currentValue);
			newRange = [ Math.min(value1, value2), Math.max(value1, value2) ];
		}

		FilterMenu.Slider.updateValues(newRange);
		FilterMenu.Slider.updateHandles();
	}

	$('#filter-range-editor').css('display', 'none');
}