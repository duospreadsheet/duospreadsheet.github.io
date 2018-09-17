const Data = {
	processDataDone: null,
	trainClassifierDone: null,

	loadFromPath: function(path, classifierName) {
		const self = this;

		MenuBar.currentClassifierName = classifierName; // not saved yet
		self.processDataDone = false;
		self.trainClassifierDone = false;
		Table.showLoader();

		// tell server to train classifier
		WebAPI.trainClassifier(classifierName, function() {
			self.trainClassifierDone = true;

			// hide loader when done with everything
			if (self.trainClassifierDone && self.processDataDone)
				Table.hideLoader();
		});

		// data processing (heavy computation)
		setTimeout(function() {
			d3.csv(path).then(function(data) {
				Database.storeData(data);
				Database.processData();
				Table.show();
				self.processDataDone = true;

				// hide loader when done with everything
				if (self.trainClassifierDone && self.processDataDone)
					Table.hideLoader();
			});
		}, 10);
	},
	loadFromText: function(text, classifierName) {
		const self = this;

		self.processDataDone = false;
		self.trainClassifierDone = false;
		Table.showLoader();

		// tell server to train classifier
		WebAPI.trainClassifier(classifierName, function() {
			self.trainClassifierDone = true;

			// hide loader when done with everything
			if (self.trainClassifierDone && self.processDataDone)
				Table.hideLoader();
		});

		// data processing (heavy computation)
		setTimeout(function() {
		    let data = d3.csvParse(text);
	  		Database.storeData(data);
			Database.processData();
			Table.show();
			self.processDataDone = true;

			// hide loader when done with everything
			if (self.trainClassifierDone && self.processDataDone)
				Table.hideLoader();
		}, 10);
	}
}