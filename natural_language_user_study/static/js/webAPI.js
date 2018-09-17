const WebAPI = {
	trainClassifier: function(classifierName, callback) {
		let query = { classifierName: classifierName };

		$.ajax({
			type: "POST",
		  	url: "/trainClassifier/",
		  	data: JSON.stringify(query),
		  	contentType: "application/json; charset=utf-8",
		  	success: callback,
		});
	},
	classify: function(sentence, callback) {
		var query = { sentence: sentence };

		$.getJSON("/classify/", query, function(response) {
			callback(response);
		});
	}
}