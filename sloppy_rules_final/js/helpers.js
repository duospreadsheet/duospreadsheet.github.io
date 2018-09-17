const Helpers = {
	shuffle: function(a) {
	    for (let i = a.length - 1; i > 0; i--) {
	        const j = Math.floor(Math.random() * (i + 1));
	        [a[i], a[j]] = [a[j], a[i]];
	    }
	    
	    return a;
	},
	generateShortName: function(longName, length) {
		let shortName = longName.length > length ? longName.substring(0, length) + '...' : longName;

		return shortName;
	},
	getAttributeValueHTMLArray: function(attributeValueList) {
		const attributeValueHTMLArray = [];

		for (let i = 0; i < attributeValueList.length; i++)
			attributeValueHTMLArray.push('<div class="attribute-value" attribute-value="' + attributeValueList[i] + '">' + attributeValueList[i] + '</div>');

		return attributeValueHTMLArray;
	},
	getNumberOfDecimals: function(numericalAttrName) {
		let numberOfDecimals = null;

		for (let i = 0; i < Database.data.length; i++) {
			if (Database.data[i][numericalAttrName] !== '') { // check decimal only for the first 
				let actualNumberOfDecimals = Database.data[i][numericalAttrName].countDecimals();

				numberOfDecimals = (actualNumberOfDecimals > 2) ? 2 : actualNumberOfDecimals;
				break;
			}
		}

		return numberOfDecimals;
	},
	sortNumbers: function(numberArray) {
		numberArray.sort(function(a, b){return a - b});
	},
	parseAttributeName: function(rule) {
		let isAttributeNameOnly = rule.indexOf('=') == -1;
		let isNumerical = rule.indexOf('<=') != -1;
		let attributeName = '';
		let equalIndex = null;
		let firstLessThanIndex = null;
		let secondLessThanIndex = null;

		if (!isAttributeNameOnly && isNumerical) { // numerical attribute
			firstLessThanIndex = rule.indexOf('<=');
			secondLessThanIndex = rule.lastIndexOf('<=');
			attributeName = rule.substring(firstLessThanIndex + 2, secondLessThanIndex);
		}

		if (!isAttributeNameOnly && !isNumerical) { // categorical attribute or partial specification
			equalIndex = rule.indexOf('=');
			attributeName = rule.substring(0, equalIndex);
		}

		if (isAttributeNameOnly) // attribute only
			attributeName = rule

		return attributeName;
	},
	parseAttributeValue: function(rule) {
		const attributeValue = {};
		let isAttributeNameOnly = rule.indexOf('=') == -1;
		let isNumerical = rule.indexOf('<=') != -1;
		let category = '';
		let lowerValue = null;
		let upperValue = null;
		let firstLessThanIndex = null;
		let secondLessThanIndex = null;

		if (!isAttributeNameOnly && isNumerical) { // numerical attribute
			firstLessThanIndex = rule.indexOf('<=');
			secondLessThanIndex = rule.lastIndexOf('<=');
			lowerValue = rule.substring(0, firstLessThanIndex);
			upperValue = rule.substring(secondLessThanIndex + 2);
			attributeValue.lowerValue = +lowerValue;
			attributeValue.upperValue = +upperValue;
		}
		
		if (!isAttributeNameOnly && !isNumerical) { // categorical attribute or partial specification
			equalIndex = rule.indexOf('=');
			category = rule.substring(equalIndex + 1);
			attributeValue.category = category;
		}

		return attributeValue;
	}
}