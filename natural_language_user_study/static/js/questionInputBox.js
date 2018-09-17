const QuestionInputBox = {
	init: function() {
		const self = this;

		self.installInputBehaviour();
		self.installRemoveButtonBehavioiur();
	},
	clear: function() {
		$('#sidebar .question-input-box .input-box').text('');
	},
	installInputBehaviour: function() {
		const self = this;
		let previousQuery = '';

		$('#sidebar .question-input-box .input-box').on('keydown', function (event) {
			const ENTER = 13, UP = 38, DOWN = 40, LEFT = 37, RIGHT = 39;
			let queryBeforeKeyUp = $(this).text();
			let isAutocompleteShown = $('#question-input-box-autocomplete').css('display') == 'block';
			let hasSelectedEntry = $('#question-input-box-autocomplete .entry.selected').length != 0;
			let selectedEntryEl = null, prevEntryEl = null, nextEntryEl = null;

			if (hasSelectedEntry) {
				selectedEntryEl = $('#question-input-box-autocomplete .entry.selected')[0];
				prevEntryEl = ($(selectedEntryEl).prev().length == 0) ? $(selectedEntryEl)[0] : $(selectedEntryEl).prev()[0];
				nextEntryEl = ($(selectedEntryEl).next().length == 0) ? $(selectedEntryEl)[0] : $(selectedEntryEl).next()[0];
			}
			if (!hasSelectedEntry) {
				selectedEntryEl = $('#question-input-box-autocomplete .entry').first()[0];
				prevEntryEl = selectedEntryEl;
				nextEntryEl = selectedEntryEl;
			}

			// prevent creating a new line on pressing enter
		    if (event.keyCode == ENTER || event.keyCode == UP || event.keyCode == DOWN)
		        event.preventDefault();

		    // store previous query
		    if (event.keyCode != ENTER && 
		    	event.keyCode != UP && event.keyCode != DOWN &&
		    	event.keyCode != LEFT && event.keyCode != RIGHT)
		    	previousQuery = queryBeforeKeyUp;

		    // handle pressing UP
		    if (event.keyCode == UP && isAutocompleteShown) {
		    	$('#question-input-box-autocomplete .entry').removeClass('selected');
		    	$(prevEntryEl).addClass('selected');
		    }

		    // handle pressing DOWN
		    if (event.keyCode == DOWN && isAutocompleteShown) {
		    	$('#question-input-box-autocomplete .entry').removeClass('selected');
		    	$(nextEntryEl).addClass('selected');
		    }
		});

		$('#sidebar .question-input-box .input-box').on('keyup', function (event) {
			const ENTER = 13, UP = 38, DOWN = 40, LEFT = 37, RIGHT = 39;
			let currentQuery = $(this).text();
			let isCurrentTextBoxEmpty = (currentQuery === '');
			let editedWordIndex = self.getEditedWordIndex(previousQuery, currentQuery);
			let contextAroundEditedWord = self.extractContextAroundEditedWord(currentQuery, editedWordIndex);
			let editedWordHasAtLeastTwoChar = contextAroundEditedWord[1] !== null && contextAroundEditedWord[1].lowerCase.length >= 2;
			let isAutocompleteShown = $('#question-input-box-autocomplete').css('display') == 'block';
			let hasSelectedEntry = $('#question-input-box-autocomplete .entry.selected').length != 0;

			let inputBoxPosition = null, inputBoxBottom = null, inputBoxLeft = null, inputBoxHeight = null;
			let autocompleteTop = null, autocompleteLeft = null;

			// handle special keys
			if (event.keyCode == ENTER && isAutocompleteShown && hasSelectedEntry) {
				let questionInputBoxInputBoxEl = $('#sidebar .question-input-box .input-box')[0];
				let currentQuery = $(questionInputBoxInputBoxEl).text();
				let categoryName = $('#question-input-box-autocomplete .entry.selected').attr('category');
				let startingIndexOfReplaceInQuery = parseInt($('#question-input-box-autocomplete .entry.selected').attr('starting-index-of-replace'));
				let endingIndexOfReplaceInQuery = parseInt($('#question-input-box-autocomplete .entry.selected').attr('ending-index-of-replace'));
				let newQuery = currentQuery.substr(0, startingIndexOfReplaceInQuery)
							 + categoryName
							 + currentQuery.substr(endingIndexOfReplaceInQuery + 1, currentQuery.length);

				$(questionInputBoxInputBoxEl).html(newQuery);
				QuestionInputBoxAutocomplete.HTML = '';
				QuestionInputBoxAutocomplete.hide();
				setEndOfContenteditable(questionInputBoxInputBoxEl);
		    	return;
			}
			if (event.keyCode == ENTER && (!isAutocompleteShown || !hasSelectedEntry) && !isCurrentTextBoxEmpty) {
				self.sendQueryToServer(currentQuery);
		    	QuestionInputBoxAutocomplete.hide();
		    	$(this).blur();
		    	return;
			}
			if (event.keyCode == UP || event.keyCode == DOWN ||
		    	event.keyCode == LEFT || event.keyCode == RIGHT) // already handle when keydown
		    	return;

		    // handle normal typing
			if (editedWordHasAtLeastTwoChar) {
				inputBoxPosition = $('#sidebar .question-input-box .input-box').offset();
				inputBoxHeight = $('#sidebar .question-input-box .input-box').height() + 10 + 10 + 4; // 10 is padding, 4 is border
				inputBoxBottom = inputBoxPosition.top + inputBoxHeight;
				inputBoxLeft = inputBoxPosition.left;
				autocompleteTop = inputBoxBottom - 2;
				autocompleteLeft = inputBoxLeft;
				
				QuestionInputBoxAutocomplete.clear();
				QuestionInputBoxAutocomplete.findMatchedCategories(contextAroundEditedWord);
				QuestionInputBoxAutocomplete.createHTML();
				QuestionInputBoxAutocomplete.show(autocompleteTop, autocompleteLeft);
				QuestionInputBoxAutocomplete.installClickEntryBehaviour();
			}
			if (!editedWordHasAtLeastTwoChar)
				QuestionInputBoxAutocomplete.hide();
		    if (isCurrentTextBoxEmpty)
				self.hideRemoveButton();
			if (!isCurrentTextBoxEmpty)
				self.showRemoveButton();

			ResultPanel.resize();
		});

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
	getEditedWordIndex: function(previousQuery, currentQuery) {
		let editedWordIndex = -1;
		let wordsInPreviousQuery = trimWhiteSpace(previousQuery).split(' ');
		let wordsInCurrentQuery = trimWhiteSpace(currentQuery).split(' ');

		if (wordsInCurrentQuery.length - wordsInPreviousQuery.length > 1) // handle copy and paste bug
			return -1;

		for (let i = 0; i < wordsInCurrentQuery.length; i++) {
			let currentWord = wordsInCurrentQuery[i];
			let currentWordFoundInPreviousQuery = (wordsInPreviousQuery.indexOf(currentWord) != -1);

			if (!currentWordFoundInPreviousQuery) {
				editedWordIndex = i;
				break;
			}
		}

		return editedWordIndex;

		function trimWhiteSpace(x) {
		    return x.replace(/^\s+|\s+$/gm,'');
		}
	},
	extractContextAroundEditedWord: function(currentQuery, editedWordIndex) {
		const self = this;
		let wordsInCurrentQuery = trimWhiteSpace(currentQuery).split(' ');
		let wordBeforeEditedWordIndex = (editedWordIndex == 0 || editedWordIndex == -1) ? -1 : editedWordIndex - 1;
		let wordAfterEditedWordIndex = (editedWordIndex == wordsInCurrentQuery.length - 1 || editedWordIndex == -1) ? -1 : editedWordIndex + 1;
		let contextAroundEditWord = [ null, null, null ];

		if (wordBeforeEditedWordIndex != -1) {
			let wordBeforeEditedWord = wordsInCurrentQuery[wordBeforeEditedWordIndex];
			let currentStartingIndex = self.findStartingIndexOfCurrentWord(wordsInCurrentQuery, wordBeforeEditedWordIndex);
			let currentEndingIndex = currentStartingIndex + wordBeforeEditedWord.length - 1;

			contextAroundEditWord[0] = {
				startingIndex: currentStartingIndex,
				endingIndex: currentEndingIndex,
				lowerCase: wordBeforeEditedWord.toLowerCase()
			}
		}

		if (editedWordIndex != -1) {
			let editedWord = wordsInCurrentQuery[editedWordIndex];
			let currentStartingIndex = self.findStartingIndexOfCurrentWord(wordsInCurrentQuery, editedWordIndex);
			let currentEndingIndex = currentStartingIndex + editedWord.length - 1;

			contextAroundEditWord[1] = {
				startingIndex: currentStartingIndex,
				endingIndex: currentEndingIndex,
				lowerCase: editedWord.toLowerCase()
			}
		}

		if (wordAfterEditedWordIndex != -1) {
			let wordAfterEditedWord = wordsInCurrentQuery[wordAfterEditedWordIndex];
			let currentStartingIndex = self.findStartingIndexOfCurrentWord(wordsInCurrentQuery, wordAfterEditedWordIndex);
			let currentEndingIndex = currentStartingIndex + wordAfterEditedWord.length - 1;

			contextAroundEditWord[2] = {
				startingIndex: currentStartingIndex,
				endingIndex: currentEndingIndex,
				lowerCase: wordAfterEditedWord.toLowerCase()
			}
		}

		return contextAroundEditWord;

		function trimWhiteSpace(x) {
		    return x.replace(/^\s+|\s+$/gm,'');
		}
	},
	findStartingIndexOfCurrentWord: function(wordsInCurrentQuery, indexInArray) {
		let startingIndex = 0;

		for (let i = 0; i < wordsInCurrentQuery.length; i++) {
			if (i == indexInArray)
				break;
			if (i != indexInArray)
				startingIndex += wordsInCurrentQuery[i].length + 1;
		}

		return startingIndex;
	},
	sendQueryToServer: function(query) {
		WebAPI.classify(query, afterClassification);

		function afterClassification(response) {
			let hasAllRequiredTokens = response.hasAllRequiredTokens;
			let predictedProb = response.predictedProb;
			let predictedQuestion = response.predictedQuestion;
			let rulesMissed = response.rulesMissed;
			let classifierName = MenuBar.currentClassifierName;

			console.log(hasAllRequiredTokens, predictedProb, predictedQuestion, rulesMissed);

			if (predictedProb >= 0.7 && hasAllRequiredTokens) {
				Shelf.load(classifierName, predictedQuestion);
				ResultPanel.showLoader();
				setTimeout(function() { // handle heavy computation
					Shelf.update();
					ResultPanel.update(correctAnswer = true);
					ResultPanel.removeLoader();
				}, 10);	
			}

			if (predictedProb >= 0.7 && !hasAllRequiredTokens) {
				Shelf.load(classifierName, predictedQuestion, rulesMissed);
				ResultPanel.showLoader();
				setTimeout(function() { // handle heavy computation
					Shelf.update();
					ResultPanel.update(correctAnswer = false);
					ResultPanel.removeLoader();
				}, 10);
			}

			if (predictedProb < 0.7) {
				ResultPanel.removeLoader();
				ResultPanel.removeQuestion();
				ResultPanel.removeAnswer();
				ResultPanel.displayCannotUnderstand();
			}
		}
	},
	installRemoveButtonBehavioiur: function() {
		const self = this;

		$('#sidebar .question-input-box .fa-times-circle').on('click', function () {
			self.clear();
			self.hideRemoveButton();
			ResultPanel.resize();
			ResultPanel.removeLoader();
			ResultPanel.removeQuestion();
			ResultPanel.removeAnswer();
		});
	},
	showRemoveButton: function() {
		$('#sidebar .question-input-box .fa-times-circle')
			.css('display', 'block');
	},
	hideRemoveButton: function() {
		$('#sidebar .question-input-box .fa-times-circle')
			.css('display', 'none');
	}
}