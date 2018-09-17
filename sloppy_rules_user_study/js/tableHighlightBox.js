const TableHighlightBox = {
	show: function(width, height, top, left) {
		$('#table-highlight-box')
			.css('display', 'block')
			.css('width', width)
			.css('height', height)
			.css('top', top)
			.css('left', left);
	},
	hide: function() {
		$('#table-highlight-box')
			.css('display', 'none');
	}
}