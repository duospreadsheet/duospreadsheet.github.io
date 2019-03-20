const OneToOneAnswer = {
	HTML: null,
	svgWidth: 50,
	svgHeight: 25,
	minListLength: { similar: 3, different: 3, neither: 0 },

	generateHTML: function() {
		const self = this;
		let similarHTML = self.generateOneListHTML('similar');
		let differentHTML = self.generateOneListHTML('different');
		let neitherHTML = self.generateOneListHTML('neither');

		self.HTML = similarHTML + differentHTML + neitherHTML;
	},
	generateOneListHTML: function(type) { // type = similar, different, neither
		const self = this;
		let attributeList = OneToOneOperator.similarAndDifferentAttributes[type];
		let attributeString = (attributeList.length > 1) ? 'Attributes' : 'Attribute';
		let minListLength = self.minListLength[type];
		let header = null;
		let HTML = '';

		// if there is no attribute of this type, return empty string
		if (attributeList.length == 0)
			return HTML;

		// add header
		if (type == 'similar')
			header = 'Highly Similar ' + attributeString + ' (' + attributeList.length + ')';
		else if (type == 'different')
			header = 'Highly Different ' + attributeString + ' (' + attributeList.length + ')';
		else if (type == 'neither')
			header = 'Other ' + attributeString + ' (' + attributeList.length + ')';

		if (attributeList.length <= minListLength) { // no more icon
			HTML += '<div class="' + type + ' attribute-list">'
			HTML += '<div class="header">' + 
						'<span class="container">' +
							'<span class="title">' + header + '</span>' +
						'</span>' +
					'</div>';
		}
		if (attributeList.length > minListLength) { // has more icon
			HTML += '<div class="' + type + ' attribute-list">'
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

		// add attributes
		for (let i = 0; i < attributeList.length; i++) {
			let currentAttributeLongName = attributeList[i].attributeName;
			let currentAttributeShortName = Helpers.generateShortName(currentAttributeLongName, 27);

			if (i < minListLength)
				HTML += '<div class="' + type + ' attribute always-show" attribute-name="' + currentAttributeLongName + '">' +
							'<span class="chart"><svg></svg></span>' +
							'<span class="name">' + currentAttributeShortName + '</span>' +
						'</div>';

			if (i >= minListLength)
				HTML += '<div class="' + type + ' attribute" attribute-name="' + currentAttributeLongName + '" style="display:none">' +
							'<span class="chart"><svg></svg></span>' +
							'<span class="name">' + currentAttributeShortName + '</span>' +
						'</div>';
		}

		// store
		HTML += '</div>';
		return HTML;
	},
	drawDistributions: function() {
		const self = this;

		$('#sidebar .result-panel .answer.content .attribute-list .attribute').each(function() {
			let SVGEl = d3.select(this).select('.chart svg').node();
			let currentAttribute = $(this).attr('attribute-name');
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[currentAttribute] == 'numerical';
			let topGroupProbDist = OneToOneOperator.probDistPairForEachAttribute[currentAttribute].top;
			let bottomGroupProbDist = OneToOneOperator.probDistPairForEachAttribute[currentAttribute].bottom;

			let numOfObjInTopGroup = OneToOneOperator.numberOfObjects.top;
			let numOfObjInBottomGroup = OneToOneOperator.numberOfObjects.bottom;
			let bothGroupsHaveOneObject = (numOfObjInTopGroup == 1 && numOfObjInBottomGroup == 1);
        	let topGroupHasMultipleObjectsAndBottomGroupHasOne = (numOfObjInTopGroup != 1 && numOfObjInBottomGroup == 1);
        	let bottomGroupHasMultipleObjectsAndTopGroupHasOne = (numOfObjInBottomGroup != 1 && numOfObjInTopGroup == 1);
        	let bothGroupsHaveMultipleObjects = (numOfObjInBottomGroup != 1 && numOfObjInTopGroup != 1);

			if (isCurrentAttributeNumerical && bothGroupsHaveMultipleObjects) {
				self.drawDensityPlotAbove(topGroupProbDist, bottomGroupProbDist, SVGEl, 'top');
				self.drawDensityPlotBelow(topGroupProbDist, bottomGroupProbDist, SVGEl, 'bottom');
			}
			if (isCurrentAttributeNumerical && bothGroupsHaveOneObject) {
				let overallMinValue = Database.metadata[currentAttribute].minValue;
        		let overallMaxValue = Database.metadata[currentAttribute].maxValue;
        		let topGroupValue = OneToOneOperator.meanInfoForEachNumericalAttribute[currentAttribute].topGroupMean;
        		let bottomGroupValue = OneToOneOperator.meanInfoForEachNumericalAttribute[currentAttribute].bottomGroupMean;
        		let topGroupData = { currentValue: topGroupValue, minValue: overallMinValue, maxValue: overallMaxValue };
        		let bottomGroupData = { currentValue: bottomGroupValue, minValue: overallMinValue, maxValue: overallMaxValue };

				self.drawLine(SVGEl);
				self.drawDotAbove(topGroupData, SVGEl);
				self.drawDotBelow(bottomGroupData, SVGEl);
			}
			if (isCurrentAttributeNumerical && topGroupHasMultipleObjectsAndBottomGroupHasOne) {
				let currentMinValue = OneToOneOperator.metadataForEachAttribute[currentAttribute].minValue;
        		let currentMaxValue = OneToOneOperator.metadataForEachAttribute[currentAttribute].maxValue;
        		let bottomGroupValue = OneToOneOperator.meanInfoForEachNumericalAttribute[currentAttribute].bottomGroupMean;
        		let bottomGroupData = { currentValue: bottomGroupValue, minValue: currentMinValue, maxValue: currentMaxValue };

				self.drawDensityPlotAbove(topGroupProbDist, bottomGroupProbDist, SVGEl, 'top');
				self.drawDotBelow(bottomGroupData, SVGEl);
			}
			if (isCurrentAttributeNumerical && bottomGroupHasMultipleObjectsAndTopGroupHasOne) {
				let currentMinValue = OneToOneOperator.metadataForEachAttribute[currentAttribute].minValue;
        		let currentMaxValue = OneToOneOperator.metadataForEachAttribute[currentAttribute].maxValue;
        		let topGroupValue = OneToOneOperator.meanInfoForEachNumericalAttribute[currentAttribute].topGroupMean;
        		let topGroupData = { currentValue: topGroupValue, minValue: currentMinValue, maxValue: currentMaxValue };

        		self.drawDotAbove(topGroupData, SVGEl);
				self.drawDensityPlotBelow(topGroupProbDist, bottomGroupProbDist, SVGEl, 'bottom');
			}
			if (!isCurrentAttributeNumerical && bothGroupsHaveMultipleObjects) {
				self.drawLine(SVGEl);
				self.drawBarChartAbove(topGroupProbDist, bottomGroupProbDist, SVGEl, 'top');
				self.drawBarChartBelow(topGroupProbDist, bottomGroupProbDist, SVGEl, 'bottom');
			}
			if (!isCurrentAttributeNumerical && bothGroupsHaveOneObject) {
        		let numberOfBins = topGroupProbDist.length;
        		let allCategories = OneToOneOperator.metadataForEachAttribute[currentAttribute].uniqueValues;
        		let topGroupCategory = OneToOneOperator.metadataForEachAttribute[currentAttribute].topGroupUniqueValues[0];
        		let bottomGroupCategory = OneToOneOperator.metadataForEachAttribute[currentAttribute].bottomGroupUniqueValues[0];
        		let topGroupBinIndex = allCategories.indexOf(topGroupCategory);
        		let bottomGroupBinIndex = allCategories.indexOf(bottomGroupCategory);
        		let topGroupData = { currentIndex: topGroupBinIndex, numberOfBins: numberOfBins };
        		let bottomGroupData = { currentIndex: bottomGroupBinIndex, numberOfBins: numberOfBins };

				self.drawLine(SVGEl);
				self.drawDotAbove(topGroupData, SVGEl);
				self.drawDotBelow(bottomGroupData, SVGEl);
			}
			if (!isCurrentAttributeNumerical && topGroupHasMultipleObjectsAndBottomGroupHasOne) {
				let numberOfBins = topGroupProbDist.length;
        		let allCategories = OneToOneOperator.metadataForEachAttribute[currentAttribute].uniqueValues;
        		let bottomGroupCategory = OneToOneOperator.metadataForEachAttribute[currentAttribute].bottomGroupUniqueValues[0];
        		let bottomGroupBinIndex = allCategories.indexOf(bottomGroupCategory);
        		let bottomGroupData = { currentIndex: bottomGroupBinIndex, numberOfBins: numberOfBins };

				self.drawLine(SVGEl);
				self.drawBarChartAbove(topGroupProbDist, bottomGroupProbDist, SVGEl, 'top');
				self.drawDotBelow(bottomGroupData, SVGEl);
			}
			if (!isCurrentAttributeNumerical && bottomGroupHasMultipleObjectsAndTopGroupHasOne) {
				let numberOfBins = topGroupProbDist.length;
        		let allCategories = OneToOneOperator.metadataForEachAttribute[currentAttribute].uniqueValues;
        		let topGroupCategory = OneToOneOperator.metadataForEachAttribute[currentAttribute].topGroupUniqueValues[0];
        		let topGroupBinIndex = allCategories.indexOf(topGroupCategory);
        		let topGroupData = { currentIndex: topGroupBinIndex, numberOfBins: numberOfBins };

				self.drawLine(SVGEl);
				self.drawDotAbove(topGroupData, SVGEl);
				self.drawBarChartBelow(topGroupProbDist, bottomGroupProbDist, SVGEl, 'bottom');
			}
		});
	},
	drawLine: function(SVGEl) {
		const self = this;

		d3.select(SVGEl).append('line')
			.attr('x1', 2)
			.attr('x2', self.svgWidth - 2)
			.attr('y1', self.svgHeight / 2)
			.attr('y2', self.svgHeight / 2)
			.style('stroke', '#d3d3d3');
	},
	drawDotAbove: function(data, SVGEl) {
		const self = this;
		let currentValue = null, minValue = null, maxValue = null;
		let currentIndex = null, numberOfBins = null, binIndices = [];
		let xScale = null;

		if ('currentValue' in data) { // numerical
			currentValue = data.currentValue;
			minValue = data.minValue;
			maxValue = data.maxValue;

			xScale = d3.scaleLinear()
				.domain([ minValue, maxValue ])
				.range([ 3, self.svgWidth - 3 ]);

			d3.select(SVGEl)
	      		.append('circle')
	      		.attr('class', 'top-dot')
	      		.attr('cx', xScale(currentValue))
	      		.attr('cy', self.svgHeight / 2 - 5)
	      		.attr('r', 2)
	      		.style('stroke', '#b5a59b')
	      		.style('fill', '#fff6f2');
		}

		if ('currentIndex' in data) {
			currentIndex = data.currentIndex;
			numberOfBins = data.numberOfBins;

			for (let i = 0; i < numberOfBins; i++)
				binIndices.push(i);
			xScale = d3.scaleBand()
				.domain(binIndices)
				.range([ 3, self.svgWidth - 3 ]);

			d3.select(SVGEl)
	      		.append('circle')
	      		.attr('class', 'top-dot')
	      		.attr('cx', xScale(currentIndex) + xScale.bandwidth() / 2)
	      		.attr('cy', self.svgHeight / 2 - 5)
	      		.attr('r', 2)
	      		.style('stroke', '#b5a59b')
	      		.style('fill', '#fff6f2');
		}
	},
	drawDotBelow: function(data, SVGEl) {
		const self = this;
		let currentValue = null, minValue = null, maxValue = null;
		let currentIndex = null, numberOfBins = null, binIndices = [];
		let xScale = null;

		if ('currentValue' in data) { // numerical
			currentValue = data.currentValue;
			minValue = data.minValue;
			maxValue = data.maxValue;

			xScale = d3.scaleLinear()
				.domain([ minValue, maxValue ])
				.range([ 3, self.svgWidth - 3 ]);

			d3.select(SVGEl)
	      		.append('circle')
	      		.attr('class', 'top-dot')
	      		.attr('cx', xScale(currentValue))
	      		.attr('cy', self.svgHeight / 2 + 5)
	      		.attr('r', 2)
	      		.style('stroke', '#b9b0c4')
      			.style('fill', '#f9f4ff');
		}

		if ('currentIndex' in data) {
			currentIndex = data.currentIndex;
			numberOfBins = data.numberOfBins;

			for (let i = 0; i < numberOfBins; i++)
				binIndices.push(i);
			xScale = d3.scaleBand()
				.domain(binIndices)
				.range([ 3, self.svgWidth - 3 ]);

			d3.select(SVGEl)
	      		.append('circle')
	      		.attr('class', 'top-dot')
	      		.attr('cx', xScale(currentIndex) + xScale.bandwidth() / 2)
	      		.attr('cy', self.svgHeight / 2 + 5)
	      		.attr('r', 2)
	      		.style('stroke', '#b9b0c4')
      			.style('fill', '#f9f4ff');
		}
	},
	drawDensityPlotAbove: function(topGroupProbDist, bottomGroupProbDist, SVGEl, whichToDraw) {
		const self = this;
		let topGroupMaxProb = d3.max(topGroupProbDist);
		let bottomGroupMaxProb = d3.max(bottomGroupProbDist);
		let maxProbability = (topGroupMaxProb > bottomGroupMaxProb) ? topGroupMaxProb : bottomGroupMaxProb;
		let numberOfBins = topGroupProbDist.length;
		let probDistForDrawing = (whichToDraw == 'top') ? topGroupProbDist : bottomGroupProbDist;

		let xScale = d3.scaleLinear()
			.domain([ 0, numberOfBins - 1 ])
			.range([ 3, self.svgWidth - 3 ]);
		let topYScale = d3.scaleLinear()
			.domain([ 0, maxProbability ])
			.range([ self.svgHeight / 2, 2.5 ]);
		let topArea = d3.area()
      		.x(function(d, i) { return xScale(i); })
      		.y0(function(d) { return topYScale(d); })
      		.y1(self.svgHeight / 2)
      		.curve(d3.curveCardinal);

      	d3.select(SVGEl)
      		.append('path')
      		.attr('class', 'top-distribution')
      		.attr('d', topArea(probDistForDrawing))
      		.style('stroke', '#b5a59b')
      		.style('fill', '#fff6f2');
	},
	drawDensityPlotBelow: function(topGroupProbDist, bottomGroupProbDist, SVGEl, whichToDraw) {
		const self = this;
		let topGroupMaxProb = d3.max(topGroupProbDist);
		let bottomGroupMaxProb = d3.max(bottomGroupProbDist);
		let maxProbability = (topGroupMaxProb > bottomGroupMaxProb) ? topGroupMaxProb : bottomGroupMaxProb;
		let numberOfBins = topGroupProbDist.length;
		let probDistForDrawing = (whichToDraw == 'top') ? topGroupProbDist : bottomGroupProbDist;

		let xScale = d3.scaleLinear()
			.domain([ 0, numberOfBins - 1 ])
			.range([ 3, self.svgWidth - 3 ]);
		let bottomYScale = d3.scaleLinear()
			.domain([ 0, maxProbability ])
			.range([ self.svgHeight / 2, self.svgHeight - 2.5 ]);
		let bottomArea = d3.area()
      		.x(function(d, i) { return xScale(i); })
      		.y0(self.svgHeight / 2)
      		.y1(function(d) { return bottomYScale(d); })
      		.curve(d3.curveCardinal);

      	d3.select(SVGEl)
      		.append('path')
      		.attr('class', 'bottom-distribution')
      		.attr('d', bottomArea(bottomGroupProbDist))
      		.style('stroke', '#b9b0c4')
      		.style('fill', '#f9f4ff');
	},
	drawBarChartAbove: function(topGroupProbDist, bottomGroupProbDist, SVGEl, whichToDraw) {
		const self = this;
		let topGroupMaxProb = d3.max(topGroupProbDist);
		let bottomGroupMaxProb = d3.max(bottomGroupProbDist);
		let maxProbability = (topGroupMaxProb > bottomGroupMaxProb) ? topGroupMaxProb : bottomGroupMaxProb;
		let numberOfBins = topGroupProbDist.length;
		let binIndices = [];
		let probDistForDrawing = (whichToDraw == 'top') ? topGroupProbDist : bottomGroupProbDist;

		for (let i = 0; i < numberOfBins; i++)
			binIndices.push(i);
		let xScale = d3.scaleBand()
			.domain(binIndices)
			.range([ 3, self.svgWidth - 3 ]);
		let topYScale = d3.scaleLinear()
			.domain([ 0, maxProbability ])
			.range([ self.svgHeight / 2, 2.5 ]);
		let heightScale = d3.scaleLinear()
			.domain([ 0, maxProbability ])
			.range([ 0, self.svgHeight / 2 - 2.5 ]);

		d3.select(SVGEl).selectAll('.top-bar')
			.data(probDistForDrawing)
			.enter()
			.append('rect')
			.attr('class', 'top-bar')
			.attr('x', function(d, i) { return xScale(i) + xScale.bandwidth() / 2 - xScale.bandwidth() / 3; })
			.attr('y', function(d) { return topYScale(d); })
			.attr('width', xScale.bandwidth() / 1.5)
			.attr('height', function(d) { return heightScale(d); })
			.style('stroke', 'none')
			.style('fill', '#b5a59b');
	},
	drawBarChartBelow: function(topGroupProbDist, bottomGroupProbDist, SVGEl, whichToDraw) {
		const self = this;
		let topGroupMaxProb = d3.max(topGroupProbDist);
		let bottomGroupMaxProb = d3.max(bottomGroupProbDist);
		let maxProbability = (topGroupMaxProb > bottomGroupMaxProb) ? topGroupMaxProb : bottomGroupMaxProb;
		let numberOfBins = topGroupProbDist.length;
		let binIndices = [];
		let probDistForDrawing = (whichToDraw == 'top') ? topGroupProbDist : bottomGroupProbDist;

		for (let i = 0; i < numberOfBins; i++)
			binIndices.push(i);
		let xScale = d3.scaleBand()
			.domain(binIndices)
			.range([ 3, self.svgWidth - 3 ]);
		let heightScale = d3.scaleLinear()
			.domain([ 0, maxProbability ])
			.range([ 0, self.svgHeight / 2 - 2.5 ]);

		d3.select(SVGEl).selectAll('.bottom-bar')
			.data(bottomGroupProbDist)
			.enter()
			.append('rect')
			.attr('class', 'bottom-bar')
			.attr('x', function(d, i) { return xScale(i) + xScale.bandwidth() / 2 - xScale.bandwidth() / 3; })
			.attr('y', self.svgHeight / 2)
			.attr('width', xScale.bandwidth() / 1.5)
			.attr('height', function(d) { return heightScale(d); })
			.style('stroke', 'none')
			.style('fill', '#b9b0c4');
	},
	installClickHeaderBehaviour: function() {
		$('#sidebar .result-panel .answer.content .attribute-list .header')
			.on('click', clickHeader)

		function clickHeader() {
			let headerEl = this;
			let attributeListEl = this.parentNode;
			let isCurrentlyExpanded = $(headerEl).hasClass('expanded');

			// collapse
			if (isCurrentlyExpanded) {
				$(headerEl)
					.removeClass('expanded');
				$(headerEl).find('.more-text')
					.html('Show more');
				$(attributeListEl).find('.attribute').not('.always-show')
					.css('display', 'block')
					.fadeOut(200);
			}

			// expand
			if (!isCurrentlyExpanded) {
				$(headerEl)
					.addClass('expanded');
				$(headerEl).find('.more-text')
					.html('Show less');
				$(attributeListEl).find('.attribute').not('.always-show')
					.css('display', 'none')
					.fadeTo(300, 1);
			}
		}
	},
	installMouseenterAttributeNameBehaviour: function() {
		$('#sidebar .result-panel .answer.content .attribute-list .attribute .name')
			.on('mouseenter', mouseenterAttributeName)
			.on('mouseleave', mouseleaveAttributeName);
		$('#sidebar .result-panel .answer.content .attribute-list .attribute .chart')
			.on('mouseenter', mouseenterAttributeName)
			.on('mouseleave', mouseleaveAttributeName);

		function mouseenterAttributeName() {
			let needToStay = $('#system-reasoning-panel').hasClass('stay');
			let attributeName = $(this.parentNode).attr('attribute-name');
			let panelTop = $('#sidebar .result-panel .answer.header').offset().top;
			let panelRight = sidebarWidth + 18;

			if (!needToStay) {
				OneToOneOperator.pushDataToMediator();
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
	installClickAttributeNameBehaviour: function() { // not click already installed in SystemReasoningPanel
		$('#sidebar .result-panel .answer.content .attribute-list .attribute .name')
			.on('click', clickAttributeName);
		$('#sidebar .result-panel .answer.content .attribute-list .attribute .chart')
			.on('click', clickAttributeName);

		function clickAttributeName() {
			let attributeName = $(this.parentNode).attr('attribute-name');
			let panelTop = $('#sidebar .result-panel .answer.header').offset().top;
			let panelRight = sidebarWidth + 18;

			SystemReasoningPanel.stay(attributeName);
			OneToOneOperator.pushDataToMediator();
			SystemReasoningPanel.show(panelTop, panelRight, attributeName);
			SystemReasoningPanel.explainAttr(attributeName);
			SystemReasoningPanel.adjustPosition();
		}
	}
}