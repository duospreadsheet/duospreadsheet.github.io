const Data = {
	loadFromPath: function(path, classifierName) {
		MenuBar.currentClassifierName = classifierName; // not saved yet
		Table.showLoader();

		// heavy computation
		setTimeout(function() {
			d3.csv(path).then(function(data) {
				Database.storeData(data);
				Database.processData();
				Table.show();
				Table.hideLoader();
			});
		}, 10);
	},
	loadFromText: function(text, classifierName) {
		Table.showLoader();

		// heavy computation
		setTimeout(function() {
		    let data = d3.csvParse(text);
	  		Database.storeData(data);
			Database.processData();
			Table.show();
			Table.hideLoader();
		}, 10);
	}
}