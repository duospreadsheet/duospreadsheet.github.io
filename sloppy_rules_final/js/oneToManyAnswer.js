const OneToManyAnswer = {
	HTML: null,
	minListLength: { similar: 3, different: 3 },

	generateHTML: function() {
		const self = this;
		let similarHTML = self.generateOneListHTML('similar');
		let differentHTML = self.generateOneListHTML('different');

		self.HTML = similarHTML + differentHTML;
	},
	generateOneListHTML: function(type) { // type = similar, different
		const self = this;
		let minListLength = self.minListLength[type];
		let rankedGroupListName = (type == 'similar') ? 'groupsRankedByNumberOfSimilarAttr' : 'groupsRankedByNumberOfDiffAttr';
		let header = (type == 'similar') ? 'More Similar To Less Similar' : 'More Different To Less Different';
		let attributeString = (type == 'similar') ? 'Similar Attributes' : 'Different Attributes';
		let rankedGroupList = OneToManyOperator[rankedGroupListName];
		let HTML = '';

		// add header
		if (rankedGroupList.length <= minListLength) { // no more icon
			HTML += '<div class="' + type + ' group-list">';
			HTML += '<div class="header">' + 
						'<span class="container">' +
							'<span class="title">' + header + '</span>' +
						'</span>' +
					'</div>';
		}
		if (rankedGroupList.length > minListLength) { // has more icon
			HTML += '<div class="' + type + ' group-list">';
			HTML += '<div class="header">' + 
						'<span class="container">' +
							'<span class="title">' + header + '</span>' +
							'<span class="more-icon">' +
								'<i class="fas fa-angle-double-down"></i>' +
								'<span class="more-text">Show more</span>' +
							'</span>' +
						'</span>' +
					'</div>';
		}

		// add group names
		for (let i = 0; i < rankedGroupList.length; i++) {
			let currentNumberOfAttributes = rankedGroupList[i].numberOfAttributes;
			let currentBottomShelfGroupIndex = rankedGroupList[i].bottomShelfGroupIndex;
			let currentLongGroupName = rankedGroupList[i].groupName;
			let currentShortGroupName = Helpers.generateShortName(currentLongGroupName, 31);
			let currentNumberOfObjects = OneToManyOperator.numberOfObjectsForEachPair[currentBottomShelfGroupIndex].bottom;
			let recordString = (currentNumberOfObjects > 1) ? 'records' : 'record';

			if (i < minListLength)
				HTML += '<div class="' + type + ' group always-show" bottom-group-index="' + currentBottomShelfGroupIndex + '">' +
							'<div class="name">' + currentShortGroupName + ' <span class="number-of-objects">(' + currentNumberOfObjects + ' ' + recordString + ')</span></div>' +
							'<div class="number-of-attributes">' + currentNumberOfAttributes + ' ' + attributeString + '</div>' +
						'</div>';

			if (i >= minListLength)
				HTML += '<div class="' + type + ' group" bottom-group-index="' + currentBottomShelfGroupIndex + '" style="display:none">' +
							'<div class="name">' + currentShortGroupName + ' <span class="number-of-objects">(' + currentNumberOfObjects + ' ' + recordString + ')</span></div>' +
							'<div class="number-of-attributes">' + currentNumberOfAttributes + ' ' + attributeString + '</div>' +
						'</div>';
		}

		// store
		HTML += '</div>'
		return HTML;
	},
	installClickHeaderBehaviour: function() {
		$('#sidebar .result-panel .answer.content .group-list .header')
			.on('click', clickHeader)

		function clickHeader() {
			let headerEl = this;
			let groupListEl = this.parentNode;
			let isCurrentlyExpanded = $(headerEl).hasClass('expanded');

			// collapse
			if (isCurrentlyExpanded) {
				$(headerEl)
					.removeClass('expanded');
				$(headerEl).find('.more-text')
					.html('Show more');
				$(groupListEl).find('.group').not('.always-show')
					.css('display', 'block')
					.fadeOut(200);
				$(groupListEl).find('.attribute-list').not('.always-show')
					.css('display', 'block')
					.fadeOut(200);
			}

			// expand
			if (!isCurrentlyExpanded) {
				$(headerEl)
					.addClass('expanded');
				$(headerEl).find('.more-text')
					.html('Show less');
				$(groupListEl).find('.group').not('.always-show')
					.css('display', 'none')
					.fadeTo(300, 1);
				$(groupListEl).find('.attribute-list').not('.always-show')
					.css('display', 'none')
					.fadeTo(300, 1);
			}
		}
	},
	installMouseenterGroupNameBehaviour: function() {
		$('#sidebar .result-panel .answer.content .group-list .group')
			.on('mouseenter', mouseenterGroupName)
			.on('mouseleave', mouseleaveGroupName);

		function mouseenterGroupName() {
			let needToStay = $('#system-reasoning-panel').hasClass('stay');
			let type = $(this).closest('.similar.group-list').length != 0 ? 'similar' : 'different';
			let bottomShelfGroupIndex = parseInt($(this).attr('bottom-group-index'));
			let panelTop = $('#sidebar .result-panel .answer.header').offset().top;
			let panelRight = sidebarWidth + 18;

			if (!needToStay) {
				OneToManyOperator.pushDataToMediator(bottomShelfGroupIndex);
				SystemReasoningPanel.show(panelTop, panelRight);
				SystemReasoningPanel.explainGroup(type);
				SystemReasoningPanel.adjustPosition();
			}
		}

		function mouseleaveGroupName() {
			let needToStay = $('#system-reasoning-panel').hasClass('stay');

			if (!needToStay)
				SystemReasoningPanel.hide();
		}
	},
	installClickGroupNameBehaviour: function() {
		const self = this;

		$('#sidebar .result-panel .answer.content .group-list .group')
			.on('click', clickGroupName);

		function clickGroupName() {
			let isExpanded = $(this).hasClass('expanded');
			let needToAlwaysShow = $(this).hasClass('always-show');
			let type = $(this).closest('.similar.group-list').length != 0 ? 'similar' : 'different';
			let bottomShelfGroupIndex = parseInt($(this).attr('bottom-group-index'));
			let currentAttributeList = OneToManyOperator.similarAndDifferentAttrForEachPair[bottomShelfGroupIndex][type];
			let HTML = needToAlwaysShow 
					 ? '<div class="' + type + ' attribute-list always-show" bottom-group-index="' + bottomShelfGroupIndex + '">'
					 : '<div class="' + type + ' attribute-list" bottom-group-index="' + bottomShelfGroupIndex + '">';

			if (isExpanded) {
				// remove list and class
				$(this).next('.attribute-list').remove();
				$(this).removeClass('expanded');
			}

			if (!isExpanded) {
				// add attributes to HTML
				for (let i = 0; i < currentAttributeList.length; i++) {
					let currentAttributeLongName = currentAttributeList[i].attributeName;
					let currentAttributeShortName = Helpers.generateShortName(currentAttributeLongName, 27);

					HTML += '<div class="' + type + ' attribute" attribute-name="' + currentAttributeLongName + '">' +
								'<span class="chart"><svg></svg></span>' +
								'<span class="name">' + currentAttributeShortName + '</span>' +
							'</div>';
				}
				HTML += '</div>';

				// append list and add class
				$(HTML).insertAfter(this);
				$(this).next('.attribute-list').css('display', 'none').fadeTo(400, 1);
				self.drawDistributions(this);
				self.installMouseenterAttributeNameBehaviour(this);
				self.installClickAttributeNameBehaviour(this);
				$(this).addClass('expanded');
			}
		}
	},
	installMouseenterAttributeNameBehaviour: function(selectedGroupNameEl) {
		$(selectedGroupNameEl).next('.attribute-list').find('.attribute .name')
			.on('mouseenter', mouseenterAttributeName)
			.on('mouseleave', mouseleaveAttributeName);
		$(selectedGroupNameEl).next('.attribute-list').find('.attribute .chart')
			.on('mouseenter', mouseenterAttributeName)
			.on('mouseleave', mouseleaveAttributeName);

		function mouseenterAttributeName() {
			let needToStay = $('#system-reasoning-panel').hasClass('stay');
			let attributeName = $(this.parentNode).attr('attribute-name');
			let panelTop = $('#sidebar .result-panel .answer.header').offset().top;
			let panelRight = sidebarWidth + 18;
			let bottomShelfGroupIndex = parseInt($(this.parentNode.parentNode).attr('bottom-group-index'));

			if (!needToStay) {
				OneToManyOperator.pushDataToMediator(bottomShelfGroupIndex);
				SystemReasoningPanel.show(panelTop, panelRight, attributeName);
				SystemReasoningPanel.explainAttr(attributeName);
				SystemReasoningPanel.adjustPosition();
			}
		}

		function mouseleaveAttributeName() {
			let needToStay = $('#system-reasoning-panel').hasClass('stay');

			if (!needToStay)
				SystemReasoningPanel.hide();
		}
	},
	installClickAttributeNameBehaviour: function(selectedGroupNameEl) {
		$(selectedGroupNameEl).next('.attribute-list').find('.attribute .name')
			.on('click', clickAttributeName);
		$(selectedGroupNameEl).next('.attribute-list').find('.attribute .chart')
			.on('click', clickAttributeName);

		function clickAttributeName() {
			let attributeName = $(this.parentNode).attr('attribute-name');
			let panelTop = $('#sidebar .result-panel .answer.header').offset().top;
			let panelRight = sidebarWidth + 18;
			let bottomShelfGroupIndex = parseInt($(this.parentNode.parentNode).attr('bottom-group-index'));

			SystemReasoningPanel.stay(attributeName);
			OneToManyOperator.pushDataToMediator(bottomShelfGroupIndex);
			SystemReasoningPanel.show(panelTop, panelRight, attributeName);
			SystemReasoningPanel.explainAttr(attributeName);
			SystemReasoningPanel.adjustPosition();
		}
	},
	drawDistributions: function(selectedGroupNameEl) {
		let bottomShelfGroupIndex = parseInt($(selectedGroupNameEl).attr('bottom-group-index'));
		let meanInfoForEachNumericalAttribute = OneToManyOperator.meanInfoForEachNumericalAttrForEachPair[bottomShelfGroupIndex];
		let probDistPairForEachAttribute = OneToManyOperator.probDistPairForEachAttrForEachPair[bottomShelfGroupIndex];
		let metadataForEachAttribute = OneToManyOperator.metadataForEachAttrForEachPair[bottomShelfGroupIndex];
		let numberOfObjects = OneToManyOperator.numberOfObjectsForEachPair[bottomShelfGroupIndex];
		
		$(selectedGroupNameEl).next('.attribute-list').find('.attribute').each(function() {
			let SVGEl = d3.select(this).select('.chart svg').node();
			let currentAttribute = $(this).attr('attribute-name');
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[currentAttribute] == 'numerical';
			let topGroupProbDist = probDistPairForEachAttribute[currentAttribute].top;
			let bottomGroupProbDist = probDistPairForEachAttribute[currentAttribute].bottom;

			let numOfObjInTopGroup = numberOfObjects.top;
			let numOfObjInBottomGroup = numberOfObjects.bottom;
			let bothGroupsHaveOneObject = (numOfObjInTopGroup == 1 && numOfObjInBottomGroup == 1);
        	let topGroupHasMultipleObjectsAndBottomGroupHasOne = (numOfObjInTopGroup != 1 && numOfObjInBottomGroup == 1);
        	let bottomGroupHasMultipleObjectsAndTopGroupHasOne = (numOfObjInBottomGroup != 1 && numOfObjInTopGroup == 1);
        	let bothGroupsHaveMultipleObjects = (numOfObjInBottomGroup != 1 && numOfObjInTopGroup != 1);

			if (isCurrentAttributeNumerical && bothGroupsHaveMultipleObjects) {
				OneToOneAnswer.drawDensityPlotAbove(topGroupProbDist, bottomGroupProbDist, SVGEl, 'top');
				OneToOneAnswer.drawDensityPlotBelow(topGroupProbDist, bottomGroupProbDist, SVGEl, 'bottom');
			}
			if (isCurrentAttributeNumerical && bothGroupsHaveOneObject) {
				let overallMinValue = Database.metadata[currentAttribute].minValue;
        		let overallMaxValue = Database.metadata[currentAttribute].maxValue;
        		let topGroupValue = meanInfoForEachNumericalAttribute[currentAttribute].topGroupMean;
        		let bottomGroupValue = meanInfoForEachNumericalAttribute[currentAttribute].bottomGroupMean;
        		let topGroupData = { currentValue: topGroupValue, minValue: overallMinValue, maxValue: overallMaxValue };
        		let bottomGroupData = { currentValue: bottomGroupValue, minValue: overallMinValue, maxValue: overallMaxValue };

				OneToOneAnswer.drawLine(SVGEl);
				OneToOneAnswer.drawDotAbove(topGroupData, SVGEl);
				OneToOneAnswer.drawDotBelow(bottomGroupData, SVGEl);
			}
			if (isCurrentAttributeNumerical && topGroupHasMultipleObjectsAndBottomGroupHasOne) {
				let currentMinValue = metadataForEachAttribute[currentAttribute].minValue;
        		let currentMaxValue = metadataForEachAttribute[currentAttribute].maxValue;
        		let bottomGroupValue = meanInfoForEachNumericalAttribute[currentAttribute].bottomGroupMean;
        		let bottomGroupData = { currentValue: bottomGroupValue, minValue: currentMinValue, maxValue: currentMaxValue };

				OneToOneAnswer.drawDensityPlotAbove(topGroupProbDist, bottomGroupProbDist, SVGEl, 'top');
				OneToOneAnswer.drawDotBelow(bottomGroupData, SVGEl);
			}
			if (isCurrentAttributeNumerical && bottomGroupHasMultipleObjectsAndTopGroupHasOne) {
				let currentMinValue = metadataForEachAttribute[currentAttribute].minValue;
        		let currentMaxValue = metadataForEachAttribute[currentAttribute].maxValue;
        		let topGroupValue = meanInfoForEachNumericalAttribute[currentAttribute].topGroupMean;
        		let topGroupData = { currentValue: topGroupValue, minValue: currentMinValue, maxValue: currentMaxValue };

        		OneToOneAnswer.drawDotAbove(topGroupData, SVGEl);
				OneToOneAnswer.drawDensityPlotBelow(topGroupProbDist, bottomGroupProbDist, SVGEl, 'bottom');
			}
			if (!isCurrentAttributeNumerical && bothGroupsHaveMultipleObjects) {
				OneToOneAnswer.drawLine(SVGEl);
				OneToOneAnswer.drawBarChartAbove(topGroupProbDist, bottomGroupProbDist, SVGEl, 'top');
				OneToOneAnswer.drawBarChartBelow(topGroupProbDist, bottomGroupProbDist, SVGEl, 'bottom');
			}
			if (!isCurrentAttributeNumerical && bothGroupsHaveOneObject) {
        		let numberOfBins = topGroupProbDist.length;
        		let allCategories = metadataForEachAttribute[currentAttribute].uniqueValues;
        		let topGroupCategory = metadataForEachAttribute[currentAttribute].topGroupUniqueValues[0];
        		let bottomGroupCategory = metadataForEachAttribute[currentAttribute].bottomGroupUniqueValues[0];
        		let topGroupBinIndex = allCategories.indexOf(topGroupCategory);
        		let bottomGroupBinIndex = allCategories.indexOf(bottomGroupCategory);
        		let topGroupData = { currentIndex: topGroupBinIndex, numberOfBins: numberOfBins };
        		let bottomGroupData = { currentIndex: bottomGroupBinIndex, numberOfBins: numberOfBins };

				OneToOneAnswer.drawLine(SVGEl);
				OneToOneAnswer.drawDotAbove(topGroupData, SVGEl);
				OneToOneAnswer.drawDotBelow(bottomGroupData, SVGEl);
			}
			if (!isCurrentAttributeNumerical && topGroupHasMultipleObjectsAndBottomGroupHasOne) {
				let numberOfBins = topGroupProbDist.length;
        		let allCategories = metadataForEachAttribute[currentAttribute].uniqueValues;
        		let bottomGroupCategory = metadataForEachAttribute[currentAttribute].bottomGroupUniqueValues[0];
        		let bottomGroupBinIndex = allCategories.indexOf(bottomGroupCategory);
        		let bottomGroupData = { currentIndex: bottomGroupBinIndex, numberOfBins: numberOfBins };

				OneToOneAnswer.drawLine(SVGEl);
				OneToOneAnswer.drawBarChartAbove(topGroupProbDist, bottomGroupProbDist, SVGEl, 'top');
				OneToOneAnswer.drawDotBelow(bottomGroupData, SVGEl);
			}
			if (!isCurrentAttributeNumerical && bottomGroupHasMultipleObjectsAndTopGroupHasOne) {
				let numberOfBins = topGroupProbDist.length;
        		let allCategories = metadataForEachAttribute[currentAttribute].uniqueValues;
        		let topGroupCategory = metadataForEachAttribute[currentAttribute].topGroupUniqueValues[0];
        		let topGroupBinIndex = allCategories.indexOf(topGroupCategory);
        		let topGroupData = { currentIndex: topGroupBinIndex, numberOfBins: numberOfBins };

				OneToOneAnswer.drawLine(SVGEl);
				OneToOneAnswer.drawDotAbove(topGroupData, SVGEl);
				OneToOneAnswer.drawBarChartBelow(topGroupProbDist, bottomGroupProbDist, SVGEl, 'bottom');
			}
		});
	}
}