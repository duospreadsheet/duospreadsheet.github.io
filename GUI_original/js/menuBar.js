const MenuBar = {
	init: function() {
		const self = this;

		self.initLoadFileButton();
	},
	initLoadFileButton: function() {
		let fileSelectorEl = document.getElementById("file-selector");
		let reader = new FileReader();

		// file reader setting
		reader.onload = function(e) {
			let contents = e.target.result;

			Shelf.clearShelfData('top');
		  	Shelf.clearShelfData('bottom');
		  	Shelf.clearShelfData('attribute');
		  	Shelf.update();
		  	ResultPanel.update();
		  	GroupEditor.hide();
			GroupViewer.hide();
			Data.loadFromText(contents);
	  	};

	  	// highlight the label on click
	  	fileSelectorEl.onclick = function() {
			$('#menu-bar .load-file-button').addClass("selected");
		}

		// remove label highlight on return focus to document
		document.body.onfocus = function() {
			$('#menu-bar .load-file-button').removeClass("selected");
		}

		// when load button is clicked
		fileSelectorEl.onchange = function(e) {
			let fileName = e.target.value.split( '\\' ).pop();

			if (fileName !== "") // trigger load event
				reader.readAsText(this.files[0]);
		}
	}
}