var ResultPanel = {
	update: function(correctAnswer = false) {
		const self = this;

		ResultPanel.updateQuestion(correctAnswer);
		ResultPanel.updateAnswer();
		ChangeNameHandler.connectGroupObjectToTextNode();
		SystemReasoningPanel.hide();
	},
	resize: function() {
		let newTopShelfHeight = $('#sidebar .shelves .top-group').height();
		let newBottomShelfHeight = $('#sidebar .shelves .bottom-group').height();
		let newAttributeShelfHeight = $('#sidebar .shelves .attributes').height();
		let newShelfContainerHeight = 8 + newTopShelfHeight + 8 + newBottomShelfHeight + 8 + newAttributeShelfHeight + 8 + 1;
		let newResultPanelHeight = 'calc(100% - ' + newShelfContainerHeight + 'px)';

		$('#sidebar .result-panel')
			.css('height', newResultPanelHeight);
	},
	showLoader: function() {
		$('#sidebar .result-panel .loader')
			.css('display', 'block');
	},
	removeLoader: function() {
		$('#sidebar .result-panel .loader')
			.css('display', 'none');
	},
	updateQuestion: function(correctAnswer = false) {
		const self = this;
		let topShelfGroups = Shelf.data.top;
		let bottomShelfGroups = Shelf.data.bottom;
		let specifiedAttributes = Shelf.data.attribute;
		let oneGroupOnTopShelf = (topShelfGroups.length == 1);
		let oneGroupOnBottomShelf = (bottomShelfGroups.length == 1);
		let manyGroupsOnBottomShelf = (bottomShelfGroups.length > 1);
		let userSpecifiesAttributes = (specifiedAttributes.length >= 1);

		if (oneGroupOnTopShelf && oneGroupOnBottomShelf && !userSpecifiesAttributes) {
			let topShelfGroup = topShelfGroups[0];
			let bottomShelfGroup = bottomShelfGroups[0];
			let questionHTML = TextGenerator.generateCompareOneAndOneQuestionHTML(topShelfGroup, bottomShelfGroup);
			self.displayQuestion(questionHTML, correctAnswer);
		}
		else if (oneGroupOnTopShelf && oneGroupOnBottomShelf && userSpecifiesAttributes) {
			let topShelfGroup = topShelfGroups[0];
			let bottomShelfGroup = bottomShelfGroups[0];
			let attributeList = specifiedAttributes;
			let questionHTML = TextGenerator.generateCompareAttrOfOneAndOneQuestionHTML(topShelfGroup, bottomShelfGroup, attributeList);
			self.displayQuestion(questionHTML, correctAnswer);
		}
		else if (oneGroupOnTopShelf && manyGroupsOnBottomShelf && !userSpecifiesAttributes) {
			let topShelfGroup = topShelfGroups[0];
			let questionHTML = TextGenerator.generateCompareOneAndManyQuestionHTML(topShelfGroup, bottomShelfGroups);
			self.displayQuestion(questionHTML, correctAnswer);
		}
		else if (oneGroupOnTopShelf && manyGroupsOnBottomShelf && userSpecifiesAttributes) {
			let topShelfGroup = topShelfGroups[0];
			let attributeList = specifiedAttributes;
			let questionHTML = TextGenerator.generateCompareAttrOfOneAndManyQuestionHTML(topShelfGroup, bottomShelfGroups, attributeList);
			self.displayQuestion(questionHTML, correctAnswer);
		}
		else {
			self.removeQuestion();
		}
	},
	displayQuestion: function(questionHTML, correctAnswer = false) {
		if (correctAnswer)
			$('#sidebar .result-panel .question.header')
				.html('YOU GOT IT RIGHT!')
				.css('display', 'none')
				.fadeIn();
		if (!correctAnswer)
			$('#sidebar .result-panel .question.header')
				.html('Question')
				.css('display', 'none')
				.fadeIn();
		$('#sidebar .result-panel .question.content')
			.html(questionHTML)
			.css('display', 'none')
			.css('border-bottom', '1px solid #efefef')
			.fadeIn();
	},
	removeQuestion: function() {
		$('#sidebar .result-panel .question.header')
			.html('')
			.css('display', 'none');
		$('#sidebar .result-panel .question.content')
			.html('')
			.css('display', 'none')
			.css('border-bottom', '');
	},
	updateAnswer: function() {
		const self = this;
		let topShelfGroups = Shelf.data.top;
		let bottomShelfGroups = Shelf.data.bottom;
		let specifiedAttributes = Shelf.data.attribute;
		let oneGroupOnTopShelf = (topShelfGroups.length == 1);
		let oneGroupOnBottomShelf = (bottomShelfGroups.length == 1);
		let manyGroupsOnBottomShelf = (bottomShelfGroups.length > 1);
		let userSpecifiesAttributes = (specifiedAttributes.length >= 1);

		if (oneGroupOnTopShelf && oneGroupOnBottomShelf && !userSpecifiesAttributes) {
			let topShelfObjects = Shelf.data.top[0].includedObjects;
			let bottomShelfObjects = Shelf.data.bottom[0].includedObjects;
			let allAttributes = Database.data.columns;
			let attributeList = self.removeRedundantAttributes(allAttributes, topShelfObjects, bottomShelfObjects);
			
			OneToOneOperator.clear();
			OneToOneOperator.compute(topShelfObjects, bottomShelfObjects, attributeList);
			OneToOneOperator.classify();
			OneToOneAnswer.generateHTML();
			ResultPanel.displayAnswer(OneToOneAnswer.HTML);
			OneToOneAnswer.drawDistributions();
			OneToOneAnswer.installClickHeaderBehaviour();
			OneToOneAnswer.installMouseenterAttributeNameBehaviour();
			OneToOneAnswer.installClickAttributeNameBehaviour();
		}
		else if (oneGroupOnTopShelf && oneGroupOnBottomShelf && userSpecifiesAttributes) {
			let topShelfObjects = Shelf.data.top[0].includedObjects;
			let bottomShelfObjects = Shelf.data.bottom[0].includedObjects;
			let attributeList = self.removeRedundantAttributes(specifiedAttributes, topShelfObjects, bottomShelfObjects);

			OneToOneOperator.clear();
			OneToOneOperator.compute(topShelfObjects, bottomShelfObjects, attributeList);
			OneToOneOperator.classify();
			OneToOneAnswer.generateHTML();
			ResultPanel.displayAnswer(OneToOneAnswer.HTML);
			OneToOneAnswer.drawDistributions();
			OneToOneAnswer.installClickHeaderBehaviour();
			OneToOneAnswer.installMouseenterAttributeNameBehaviour();
			OneToOneAnswer.installClickAttributeNameBehaviour();
		}
		else if (oneGroupOnTopShelf && manyGroupsOnBottomShelf && !userSpecifiesAttributes) {
			let topShelfGroup = Shelf.data.top[0];
			let bottomShelfGroups = Shelf.data.bottom;
			let allAttributes = Database.data.columns;

			OneToManyOperator.clear();
			OneToManyOperator.forEachBottomGroup(function(topShelfObjects, bottomShelfObjects, attributeList) {
				OneToOneOperator.clear();
				OneToOneOperator.compute(topShelfObjects, bottomShelfObjects, attributeList);
				OneToOneOperator.classify();
				OneToOneOperator.pushDataToOneToManyOperator();
			}, topShelfGroup, bottomShelfGroups, allAttributes);
			OneToManyOperator.rankGroups();
			OneToManyAnswer.generateHTML();
			ResultPanel.displayAnswer(OneToManyAnswer.HTML);
			OneToManyAnswer.installClickHeaderBehaviour();
			OneToManyAnswer.installClickGroupNameBehaviour();
		}
		else if (oneGroupOnTopShelf && manyGroupsOnBottomShelf && userSpecifiesAttributes) {
			let topShelfGroup = Shelf.data.top[0];
			let bottomShelfGroups = Shelf.data.bottom;

			OneToManyOperator.clear();
			OneToManyOperator.forEachBottomGroup(function(topShelfObjects, bottomShelfObjects, attributeList) {
				OneToOneOperator.clear();
				OneToOneOperator.compute(topShelfObjects, bottomShelfObjects, attributeList);
				OneToOneOperator.classify();
				OneToOneOperator.pushDataToOneToManyOperator();
			}, topShelfGroup, bottomShelfGroups, specifiedAttributes);
			OneToManyOperator.rankGroups();
			OneToManyAnswer.generateHTML();
			ResultPanel.displayAnswer(OneToManyAnswer.HTML);
			OneToManyAnswer.installClickHeaderBehaviour();
			OneToManyAnswer.installClickGroupNameBehaviour();
		}
		else {
			self.removeAnswer();
		}
	},
	displayAnswer: function(answerHTML) {
		let questionHeaderHeight = $('#sidebar .result-panel .question.header').height() + 20; // 20 is padding
		let questionContentHeight = $('#sidebar .result-panel .question.content').height() + 10; // 10 is padding
		let answerHeaderHeight = $('#sidebar .result-panel .question.header').height() + 15; // 15 is padding
		let answerContentHeight = 'calc(100% - ' + (questionHeaderHeight + questionContentHeight + answerHeaderHeight + 1) + 'px)';

		$('#sidebar .result-panel .answer.header')
			.html('Answer')
			.css('display', 'none')
			.fadeIn();
		$('#sidebar .result-panel .answer.content')
			.html(answerHTML)
			.css('display', 'none')
			.css('height', answerContentHeight) 
			.fadeIn();
	},
	removeAnswer: function() {
		$('#sidebar .result-panel .answer.header')
			.html('')
			.css('display', 'none');
		$('#sidebar .result-panel .answer.content')
			.html('')
			.css('display', 'none');
	},
	resizeAnswer: function() {
		let questionHeaderHeight = $('#sidebar .result-panel .question.header').height() + 15; // 15 is padding
		let questionContentHeight = $('#sidebar .result-panel .question.content').height() + 10; // 10 is padding
		let answerHeaderHeight = questionHeaderHeight;
		let answerContentHeight = 'calc(100% - ' + (questionHeaderHeight + questionContentHeight + answerHeaderHeight + 1) + 'px)';

		$('#sidebar .result-panel .answer.content')
			.css('height', answerContentHeight);
	},
	removeRedundantAttributes: function(attributeList, topShelfObjects, bottomShelfObjects) {
		let filteredAttributeList = [];

		// remove if one of the two group only have missing values for the attribute
		for (let i = 0; i < attributeList.length; i++) {
			let currentAttribute = attributeList[i];
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[currentAttribute] == 'numerical';
			let currentAttributeHasTooManyValues = Database.isCategoricalOrNumerical[currentAttribute] == 'manyUniques';
			let isAllAttrValueMissingFromTopGroup = true, isAllAttrValueMissingFromBottomGroup = true;

			for (let j = 0; j < topShelfObjects.length; j++) {
				let currentValue = topShelfObjects[j].data[currentAttribute];
				let isCurrentValueMissing = (currentValue === '');

				if (!isCurrentValueMissing) {
					isAllAttrValueMissingFromTopGroup = false;
					break;
				}
			}

			for (let j = 0; j < bottomShelfObjects.length; j++) {
				let currentValue = bottomShelfObjects[j].data[currentAttribute];
				let isCurrentValueMissing = (currentValue === '');

				if (!isCurrentValueMissing) {
					isAllAttrValueMissingFromBottomGroup = false;
					break;
				}
			}

			if ((isCurrentAttributeNumerical && !(isAllAttrValueMissingFromTopGroup || isAllAttrValueMissingFromBottomGroup)) || 
				(!isCurrentAttributeNumerical && !currentAttributeHasTooManyValues && !(isAllAttrValueMissingFromTopGroup || isAllAttrValueMissingFromBottomGroup)))
				filteredAttributeList.push(currentAttribute);
		}

		return filteredAttributeList;
	}
}