const MenuBar = {
	currentClassifierName: null,

	init: function() {
		const self = this;

		self.initLoadFileButton();
	},
	initLoadFileButton: function() {
		self = this;
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
		  	QuestionInputBox.clear();
			Data.loadFromText(contents, self.currentClassifierName);
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
			let classifierName = fileName.replace('.csv', '');
			let data = this.files[0];

			if (fileName !== "") {
				self.currentClassifierName = classifierName;
				reader.readAsText(data); // trigger load event
			}
		}
	}
}