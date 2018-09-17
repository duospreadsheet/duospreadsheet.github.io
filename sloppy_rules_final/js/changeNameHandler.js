const ChangeNameHandler = {
	connectGroupObjectToTextNode() {
		let topShelfGroups = Shelf.data.top;
		let bottomShelfGroups = Shelf.data.bottom;
		let isResultGenerated = topShelfGroups.length > 0 && bottomShelfGroups.length > 0;

		if (isResultGenerated) {
			let topShelfGroup = topShelfGroups[0];
			let bottomShelfHasOneGroup = bottomShelfGroups.length == 1;
			let bottomShelfHasManyGroups = bottomShelfGroups.length > 1;
			let currentTextEl = null;

			// connect topShelfGroup to question (one to one or one to many)
			topShelfGroup.textObjects = [];
			currentTextEl = $('#sidebar .result-panel .question.content .top-group-name')[0];
			topShelfGroup.textObjects.push({ textEl: currentTextEl, isGroupNameHTML: true });

			// connect unique bottomShelfGroup to question (one to one)
			if (bottomShelfHasOneGroup) {
				bottomShelfGroups[0].textObjects = [];
				currentTextEl = $('#sidebar .result-panel .question.content .bottom-group-name')[0];
				bottomShelfGroups[0].textObjects.push({ textEl: currentTextEl, isGroupNameHTML: true });
			}

			// connection bottomShelfGroups to answer (one to many)
			if (bottomShelfHasManyGroups) {
				for (let i = 0; i < bottomShelfGroups.length; i++) {
					bottomShelfGroups[i].textObjects = [];
					currentTextEl = $('#sidebar .result-panel .answer.content .similar.group[bottom-group-index="' + i + '"] .name')[0];
					bottomShelfGroups[i].textObjects.push({ textEl: currentTextEl, isGroupNameHTML: false });
					currentTextEl = $('#sidebar .result-panel .answer.content .different.group[bottom-group-index="' + i + '"] .name')[0];
					bottomShelfGroups[i].textObjects.push({ textEl: currentTextEl, isGroupNameHTML: false });
				}
			}
		}
	},
	changeTextNode: function(groupObject) {
		let newName = groupObject.name;
		let newGroupNameHTML = TextGenerator.generateGroupNameHTML(groupObject);

		if (!('textObjects' in groupObject))
			return;

		for (let i = 0; i < groupObject.textObjects.length; i++) {
			let currentTextEl = groupObject.textObjects[i].textEl;
			let isGroupNameHTML = groupObject.textObjects[i].isGroupNameHTML;

			if (!isGroupNameHTML)
				$(currentTextEl).html(newName);
			if (isGroupNameHTML)
				$(currentTextEl).html(newGroupNameHTML);
		}
	}
}