const QuestionInputBoxAutocomplete = {
	HTML: '',
	matchedCategories: [],
	maxNumberOfMatch: 3,

	init: function() {
		const self = this;

		self.initWidth();
		self.installClickOutsideBehaviour();
		self.installClickInputBoxBehaviour();
	},
	initWidth: function() {
		let questionInputBoxInputBoxWidth = $('#sidebar .question-input-box .input-box').width() + 10 + 10;

		$('#question-input-box-autocomplete')
			.css('width', questionInputBoxInputBoxWidth);
	},
	installClickOutsideBehaviour: function() {
		const self = this;
		let questionInputBoxInputBoxSelector = '#sidebar .question-input-box .input-box';
		let autocompleteSelector = '#question-input-box-autocomplete';


		Body.registerNotClickEvent(questionInputBoxInputBoxSelector + ',' + autocompleteSelector, clickOutsideAutocomplete);

		function clickOutsideAutocomplete() {
			self.hide();
		}
	},
	installClickInputBoxBehaviour: function() { // handle autocomplete disappears after clicking outside
		const self = this;

		$('#sidebar .question-input-box .input-box').on('click', clickInputBox);

		function clickInputBox() {
			let inputBoxText = $(this).text();
			let inputBoxPosition = null, inputBoxBottom = null, inputBoxLeft = null, inputBoxHeight = null;
			let autocompleteTop = null, autocompleteLeft = null;

			if (inputBoxText !== '') {
				inputBoxPosition = $('#sidebar .question-input-box .input-box').offset();
				inputBoxHeight = $('#sidebar .question-input-box .input-box').height() + 10 + 10 + 4; // 10 is padding, 4 is border
				inputBoxBottom = inputBoxPosition.top + inputBoxHeight;
				inputBoxLeft = inputBoxPosition.left;
				autocompleteTop = inputBoxBottom - 2;
				autocompleteLeft = inputBoxLeft;

				self.show(autocompleteTop, autocompleteLeft);
			}
		}
	},
	installClickEntryBehaviour: function() {
		const self = this;

		$('#question-input-box-autocomplete .entry').on('click', clickEntry);

		function clickEntry() {
			let questionInputBoxInputBoxEl = $('#sidebar .question-input-box .input-box')[0];
			let currentQuery = $(questionInputBoxInputBoxEl).text();
			let categoryName = $(this).attr('category');
			let startingIndexOfReplaceInQuery = parseInt($(this).attr('starting-index-of-replace'));
			let endingIndexOfReplaceInQuery = parseInt($(this).attr('ending-index-of-replace'));
			let newQuery = currentQuery.substr(0, startingIndexOfReplaceInQuery)
						 + categoryName
						 + currentQuery.substr(endingIndexOfReplaceInQuery + 1, currentQuery.length);

			QuestionInputBoxAutocomplete.HTML = '';
			QuestionInputBoxAutocomplete.hide();
			$(questionInputBoxInputBoxEl).html(newQuery);
			setEndOfContenteditable(questionInputBoxInputBoxEl);
		}

		function setEndOfContenteditable(contentEditableElement) {
		    var range,selection;
		    if(document.createRange) { //Firefox, Chrome, Opera, Safari, IE 9+ 
		        range = document.createRange(); //Create a range (a range is a like the selection but invisible)
		        range.selectNodeContents(contentEditableElement); //Select the entire contents of the element with the range
		        range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
		        selection = window.getSelection(); //get the selection object (allows you to change selection)
		        selection.removeAllRanges(); //remove any selections already made
		        selection.addRange(range); //make the range you have just created the visible selection
		    }
		    else if(document.selection) { //IE 8 and lower
		        range = document.body.createTextRange(); //Create a range (a range is a like the selection but invisible)
		        range.moveToElementText(contentEditableElement); //Select the entire contents of the element with the range
		        range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
		        range.select(); //Select the range (make it the visible selection
		    }
		}
	},
	clear: function() {
		const self = this;

		self.HTML = '';
		self.matchedCategories = [];
	},
	findMatchedCategories: function(contextAroundEditWord) {
		const self = this;
		let wordBeforeEditedWordObject = contextAroundEditWord[0];
		let editedWordObject = contextAroundEditWord[1];
		let wordAfterEditedWordObject = contextAroundEditWord[2];
		let matchedCategories = [];
		let topMatchedCategories = [];
		let addedCategories = [];
		let bigramBeforeEditedWord = null, bigramAfterEditedWord = null, editedWordUnigram = null;

		// check bigramBeforeEditedWord
		if (wordBeforeEditedWordObject !== null && editedWordObject !== null) {
			bigramBeforeEditedWord = wordBeforeEditedWordObject.lowerCase + ' ' + editedWordObject.lowerCase;

			for (let i = 0; i < Database.vocabList.length; i++) {
				let lowerCaseCategoryName = Database.vocabList[i].lowerCase;
				let originalCategoryName = Database.vocabList[i].original;
				let startingIndexOfMatch = lowerCaseCategoryName.indexOf(bigramBeforeEditedWord);
				let endingIndexOfMatch = startingIndexOfMatch + bigramBeforeEditedWord.length - 1;
				let bigramFoundInCurrentCategory = (startingIndexOfMatch != -1);
				let previousCharIsSpace = false;
				let isCategoryAdded = (addedCategories.indexOf(lowerCaseCategoryName) != -1);

				if (bigramFoundInCurrentCategory)
					previousCharIsSpace = lowerCaseCategoryName.charAt(startingIndexOfMatch - 1) === ' ' || startingIndexOfMatch == 0;

				if (bigramFoundInCurrentCategory && previousCharIsSpace && !isCategoryAdded) {
					addedCategories.push(lowerCaseCategoryName);
					matchedCategories.push({
						categoryName: originalCategoryName,
						startingIndexOfMatchInCategory: startingIndexOfMatch,
						endingIndexOfMatchInCategory: endingIndexOfMatch,
						startingIndexOfReplaceInQuery: wordBeforeEditedWordObject.startingIndex,
						endingIndexOfReplaceInQuery: editedWordObject.endingIndex
					});
				}
			}
		}
		
		// check bigramAfterEditedWord
		if (editedWordObject !== null && wordAfterEditedWordObject !== null) {
			bigramAfterEditedWord = editedWordObject.lowerCase + ' ' + wordAfterEditedWordObject.lowerCase;

			for (let i = 0; i < Database.vocabList.length; i++) {
				let lowerCaseCategoryName = Database.vocabList[i].lowerCase;
				let originalCategoryName = Database.vocabList[i].original;
				let startingIndexOfMatch = lowerCaseCategoryName.indexOf(bigramAfterEditedWord);
				let endingIndexOfMatch = startingIndexOfMatch + bigramAfterEditedWord.length - 1;
				let bigramFoundInCurrentCategory = (startingIndexOfMatch != -1);
				let previousCharIsSpace = false;
				let isCategoryAdded = (addedCategories.indexOf(lowerCaseCategoryName) != -1);

				if (bigramFoundInCurrentCategory)
					previousCharIsSpace = lowerCaseCategoryName.charAt(startingIndexOfMatch - 1) === ' ' || startingIndexOfMatch == 0;

				if (bigramFoundInCurrentCategory && previousCharIsSpace && !isCategoryAdded) {
					addedCategories.push(lowerCaseCategoryName);
					matchedCategories.push({
						categoryName: originalCategoryName,
						startingIndexOfMatchInCategory: startingIndexOfMatch,
						endingIndexOfMatchInCategory: endingIndexOfMatch,
						startingIndexOfReplaceInQuery: editedWordObject.startingIndex,
						endingIndexOfReplaceInQuery: wordAfterEditedWordObject.endingIndex
					});
				}
			}
		}

		// check editedWord
		if (editedWordObject !== null) {
			editedWordUnigram = editedWordObject.lowerCase;

			for (let i = 0; i < Database.vocabList.length; i++) {
				let lowerCaseCategoryName = Database.vocabList[i].lowerCase;
				let originalCategoryName = Database.vocabList[i].original;
				let startingIndexOfMatch = lowerCaseCategoryName.indexOf(editedWordUnigram);
				let endingIndexOfMatch = startingIndexOfMatch + editedWordUnigram.length - 1;
				let unigramFoundInCurrentCategory = (startingIndexOfMatch != -1);
				let previousCharIsSpace = false;
				let isCategoryAdded = (addedCategories.indexOf(lowerCaseCategoryName) != -1);

				if (unigramFoundInCurrentCategory)
					previousCharIsSpace = lowerCaseCategoryName.charAt(startingIndexOfMatch - 1) === ' ' || startingIndexOfMatch == 0;

				if (unigramFoundInCurrentCategory && previousCharIsSpace && !isCategoryAdded) {
					addedCategories.push(lowerCaseCategoryName);
					matchedCategories.push({
						categoryName: originalCategoryName,
						startingIndexOfMatchInCategory: startingIndexOfMatch,
						endingIndexOfMatchInCategory: endingIndexOfMatch,
						startingIndexOfReplaceInQuery: editedWordObject.startingIndex,
						endingIndexOfReplaceInQuery: editedWordObject.endingIndex
					});
				}
			}
		}

		// save
		matchedCategories.sort(compare);

		for (let i = 0; i < matchedCategories.length && i < self.maxNumberOfMatch; i++)
			topMatchedCategories.push(matchedCategories[i]);

		self.matchedCategories = topMatchedCategories;

		function compare(a, b) {
			if (a.startingIndexOfMatchInCategory < b.startingIndexOfMatchInCategory)
		    	return -1;
		  	if (a.startingIndexOfMatchInCategory > b.startingIndexOfMatchInCategory)
		    	return 1;
		  	return 0;
		}
	},
	createHTML: function() {
		const self = this;
		let HTML = '';

		for (let i = 0; i < self.matchedCategories.length; i++) {
			let categoryName = self.matchedCategories[i].categoryName;
			let startingIndexOfMatchInCategory = self.matchedCategories[i].startingIndexOfMatchInCategory;
			let endingIndexOfMatchInCategory = self.matchedCategories[i].endingIndexOfMatchInCategory;
			let startingIndexOfReplaceInQuery = self.matchedCategories[i].startingIndexOfReplaceInQuery;
			let endingIndexOfReplaceInQuery = self.matchedCategories[i].endingIndexOfReplaceInQuery;

			let shortCategoryName = Helpers.generateShortName(categoryName, 28);
			let indexOfLastCharInShortName = (shortCategoryName.indexOf('...') == -1) ? shortCategoryName.length - 1 : shortCategoryName.length - 1 - 3;
			let currentHTML = '<div class="entry" category="' + categoryName + '" starting-index-of-replace="' + startingIndexOfReplaceInQuery + '" ending-index-of-replace="' + endingIndexOfReplaceInQuery + '">' +
							  '<span class="fa fa-level-up-alt"></span>' +
							  '<span class="category-name">';

			// adjust starting and ending index of match
			if (startingIndexOfMatchInCategory > indexOfLastCharInShortName)
				startingIndexOfMatchInCategory = -1;
			if (startingIndexOfMatchInCategory != -1 && endingIndexOfMatchInCategory > indexOfLastCharInShortName)
				endingIndexOfMatchInCategory = indexOfLastCharInShortName;
			if (startingIndexOfMatchInCategory == -1)
				endingIndexOfMatchInCategory = -1;

			// generate
			for (let i = 0; i < shortCategoryName.length; i++) {
				let currentChar = shortCategoryName.charAt(i);

				currentHTML += (i == startingIndexOfMatchInCategory) ? '<span class="matched-chars">' : '';
				currentHTML += currentChar;
				currentHTML += (i == endingIndexOfMatchInCategory) ? '</span>' : '';
			}

			// save
			currentHTML += '</span></div>';
			HTML += currentHTML;
		}

		self.HTML = HTML;
	},
	show: function(top, left) {
		const self = this;

		if (self.HTML != '')
			$('#question-input-box-autocomplete')
				.css('display', 'block')
				.css('top', top)
				.css('left', left)
				.html(self.HTML);
		if (self.HTML === '')
			self.hide();
	},
	hide: function() {
		$('#question-input-box-autocomplete')
			.css('display', 'none');
	}
}