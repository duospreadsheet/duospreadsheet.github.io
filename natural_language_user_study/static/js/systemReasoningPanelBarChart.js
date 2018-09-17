SystemReasoningPanelBarChart = {
	draw: function(attributeName, topGroupInfo, bottomGroupInfo) {
		const self = this;
		let topGroupProbDist = topGroupInfo.probabilityDistribution;
		let bottomGroupProbDist = bottomGroupInfo.probabilityDistribution;
		let numOfObjInTopGroup = topGroupInfo.numberOfObjects;
		let numOfObjInBottomGroup = bottomGroupInfo.numberOfObjects;
		let numberOfBins = topGroupProbDist.length;
		let xScale = null, yScale = null, heightScale = null, xAxis = null, yAxis = null;

		let bothGroupsHaveOneObject = (numOfObjInTopGroup == 1 && numOfObjInBottomGroup == 1);
		let topGroupHasMultipleObjectsAndBottomGroupHasOne = (numOfObjInTopGroup != 1 && numOfObjInBottomGroup == 1);
		let bottomGroupHasMultipleObjectsAndTopGroupHasOne = (numOfObjInBottomGroup != 1 && numOfObjInTopGroup == 1);
		let bothGroupsHaveMultipleObjects = (numOfObjInBottomGroup != 1 && numOfObjInTopGroup != 1);
		
		if (bothGroupsHaveOneObject) {
			SystemReasoningPanel.setHeight(150);
			SystemReasoningPanel.adjustSVGGroupMargin(20, 20, 50, 20); // no y axis
			[ xScale, yScale, heightScale, xAxis, yAxis ] = self.prepareScalesAndAxes(attributeName, numberOfBins);

			self.drawForTwoObjects(topGroupProbDist, bottomGroupProbDist, xScale);
			self.drawAxis(attributeName, xAxis);
      		self.adjustLabelIfOverlapped(attributeName);
		}
		if (topGroupHasMultipleObjectsAndBottomGroupHasOne) {
			SystemReasoningPanel.setHeight(230);
			SystemReasoningPanel.adjustSVGGroupMargin(20, 35, 35, 20);
			[ xScale, yScale, heightScale, xAxis, yAxis ] = self.prepareScalesAndAxes(attributeName, numberOfBins);

      		self.drawForOneGroupOneObject(topGroupProbDist, bottomGroupProbDist, xScale, yScale, heightScale, 'top');
      		self.drawAxis(attributeName, xAxis, yAxis);
      		self.adjustLabelIfOverlapped(attributeName);
		}
      	if (bottomGroupHasMultipleObjectsAndTopGroupHasOne) {
      		SystemReasoningPanel.setHeight(230);
      		SystemReasoningPanel.adjustSVGGroupMargin(20, 35, 35, 20);
      		[ xScale, yScale, heightScale, xAxis, yAxis ] = self.prepareScalesAndAxes(attributeName, numberOfBins);

      		self.drawForOneGroupOneObject(bottomGroupProbDist, topGroupProbDist, xScale, yScale, heightScale, 'bottom');
      		self.drawAxis(attributeName, xAxis, yAxis);
      		self.adjustLabelIfOverlapped(attributeName);
      	}
      	if (bothGroupsHaveMultipleObjects) {
      		SystemReasoningPanel.setHeight(230);
      		SystemReasoningPanel.adjustSVGGroupMargin(20, 35, 35, 20);
      		[ xScale, yScale, heightScale, xAxis, yAxis ] = self.prepareScalesAndAxes(attributeName, numberOfBins);

      		self.drawForTwoGroups(topGroupProbDist, bottomGroupProbDist, xScale, yScale, heightScale);
      		self.drawAxis(attributeName, xAxis, yAxis);
      		self.adjustLabelIfOverlapped(attributeName);
      	}
	},
	drawForTwoObjects: function(topGroupProbDist, bottomGroupProbDist, xScale) {
		let topGroupBinIndexWithProbOne = SystemReasoningPanel.getIndexWithProbOne(topGroupProbDist);
		let bottomGroupBinIndexWithProbOne = SystemReasoningPanel.getIndexWithProbOne(bottomGroupProbDist);

		let isBinIndexWithProbOneTheSame = (topGroupBinIndexWithProbOne == bottomGroupBinIndexWithProbOne);
		let svgHeight = $('#system-reasoning-panel .distribution').height();
		let chartHeight = svgHeight - SystemReasoningPanel.margin.top - SystemReasoningPanel.margin.bottom;
		let lineStartY = -5;
		let lineEndY = chartHeight - 10;
		let circleRadius = 3;
		
		if (isBinIndexWithProbOneTheSame) {
			let lineNormalX = xScale(bottomGroupBinIndexWithProbOne) + xScale.bandwidth() / 2;
			let pathData = 'M ' + lineNormalX + ' ' + lineEndY + ' h -6 l 6 6 l 6 -6 z';

			// draw bottom group line
			SystemReasoningPanel.svgGroup.append('circle')
				.attr('class', 'bottom line')
				.attr('cx', lineNormalX - 20)
				.attr('cy', lineStartY)
				.attr('r', circleRadius)
				.style('stroke', SystemReasoningPanel.strokeColour.bottom)
	      		.style('fill', SystemReasoningPanel.fillColour.bottom)
	      		.style('fill-opacity', 0.2);
			SystemReasoningPanel.svgGroup.append('line')
				.attr('class', 'bottom line')
				.attr('x1', lineNormalX - 20)
				.attr('x2', lineNormalX)
				.attr('y1', lineStartY + circleRadius)
				.attr('y2', lineEndY)
				.style('stroke', SystemReasoningPanel.strokeColour.bottom)
				.style('stroke-dasharray', '5, 5');

			// draw top group line
			SystemReasoningPanel.svgGroup.append('line')
				.attr('class', 'top line')
				.attr('x1', lineNormalX + 20)
				.attr('x2', lineNormalX)
				.attr('y1', lineStartY + circleRadius)
				.attr('y2', lineEndY)
				.style('stroke', SystemReasoningPanel.strokeColour.top)
				.style('stroke-dasharray', '5, 5');
	   		SystemReasoningPanel.svgGroup.append('circle')
				.attr('class', 'top line')
				.attr('cx', lineNormalX + 20)
				.attr('cy', lineStartY)
				.attr('r', circleRadius)
				.style('stroke', SystemReasoningPanel.strokeColour.top)
	      		.style('fill', SystemReasoningPanel.fillColour.top)
	      		.style('fill-opacity', 0.2);

	      	// draw arrow
	      	SystemReasoningPanel.svgGroup.append('path')
				.attr('class', 'top bottom line')
				.attr('d', pathData)
				.style('stroke', 'gray')
	      		.style('fill', 'gray')
	      		.style('fill-opacity', 0.2);
		}

		if (!isBinIndexWithProbOneTheSame) {
			let topGroupLineX = xScale(topGroupBinIndexWithProbOne) + xScale.bandwidth() / 2;
			let bottomGroupLineX = xScale(bottomGroupBinIndexWithProbOne) + xScale.bandwidth() / 2;
			let topPathData = 'M ' + topGroupLineX + ' ' + lineEndY + ' h -3 l 3 3 l 3 -3 z';
      		let bottomPathData = 'M ' + bottomGroupLineX + ' ' + lineEndY + ' h -3 l 3 3 l 3 -3 z';

      		// draw top group line
	      	SystemReasoningPanel.svgGroup.append('line')
				.attr('class', 'top line')
				.attr('x1', topGroupLineX)
				.attr('x2', topGroupLineX)
				.attr('y1', lineStartY + circleRadius)
				.attr('y2', lineEndY)
				.style('stroke', SystemReasoningPanel.strokeColour.top)
				.style('stroke-dasharray', '5, 5');
	   		SystemReasoningPanel.svgGroup.append('circle')
				.attr('class', 'top line')
				.attr('cx', topGroupLineX)
				.attr('cy', lineStartY)
				.attr('r', circleRadius)
				.style('stroke', SystemReasoningPanel.strokeColour.top)
	      		.style('fill', SystemReasoningPanel.fillColour.top)
	      		.style('fill-opacity', 0.2);
	      	SystemReasoningPanel.svgGroup.append('path')
				.attr('class', 'bottom line')
				.attr('d', topPathData)
				.style('stroke', SystemReasoningPanel.strokeColour.top)
	      		.style('fill', SystemReasoningPanel.fillColour.top)
	      		.style('fill-opacity', 0.2);

      		// draw bottom group line
      		SystemReasoningPanel.svgGroup.append('line')
				.attr('class', 'bottom line')
				.attr('x1', bottomGroupLineX)
				.attr('x2', bottomGroupLineX)
				.attr('y1', lineStartY + circleRadius)
				.attr('y2', lineEndY)
				.style('stroke', SystemReasoningPanel.strokeColour.bottom)
				.style('stroke-dasharray', '5, 5');
	      	SystemReasoningPanel.svgGroup.append('circle')
				.attr('class', 'bottom line')
				.attr('cx', bottomGroupLineX)
				.attr('cy', lineStartY)
				.attr('r', circleRadius)
				.style('stroke', SystemReasoningPanel.strokeColour.bottom)
	      		.style('fill', SystemReasoningPanel.fillColour.bottom)
	      		.style('fill-opacity', 0.2);
	      	SystemReasoningPanel.svgGroup.append('path')
				.attr('class', 'bottom line')
				.attr('d', bottomPathData)
				.style('stroke', SystemReasoningPanel.strokeColour.bottom)
	      		.style('fill', SystemReasoningPanel.fillColour.bottom)
	      		.style('fill-opacity', 0.2);
		}
	},
	drawForTwoGroups: function(topGroupProbDist, bottomGroupProbDist, xScale, yScale, heightScale) {
		SystemReasoningPanel.svgGroup.selectAll('.top.bar')
			.data(topGroupProbDist)
			.enter()
			.append('rect')
			.attr('class', 'top bar')
			.attr('x', function(d, i) { return xScale(i) + xScale.bandwidth() / 2 - xScale.bandwidth() / 1.5 / 2; })
			.attr('y', function(d) { return yScale(d); })
			.attr('width', xScale.bandwidth() / 1.5 / 2)
			.attr('height', function(d) { return heightScale(d); })
			.style('stroke', SystemReasoningPanel.strokeColour.top)
      		.style('fill', SystemReasoningPanel.fillColour.top)
      		.style('fill-opacity', 0.2)
      		.style('cursor', 'pointer');
		SystemReasoningPanel.svgGroup.selectAll('.bottom.bar')
			.data(bottomGroupProbDist)
			.enter()
			.append('rect')
			.attr('class', 'bottom bar')
			.attr('x', function(d, i) { return xScale(i) + xScale.bandwidth() / 2; })
			.attr('y', function(d) { return yScale(d); })
			.attr('width', xScale.bandwidth() / 1.5 / 2)
			.attr('height', function(d) { return heightScale(d); })
			.style('stroke', SystemReasoningPanel.strokeColour.bottom)
      		.style('fill', SystemReasoningPanel.fillColour.bottom)
      		.style('fill-opacity', 0.2)
      		.style('cursor', 'pointer');
	},
	drawForOneGroupOneObject: function(groupProbDist, objectProbDist, xScale, yScale, heightScale, groupType) { // groupType = top/bottom
		let svgHeight = $('#system-reasoning-panel .distribution').height();
		let chartHeight = svgHeight - SystemReasoningPanel.margin.top - SystemReasoningPanel.margin.bottom;
		let groupBinIndexWithProbOne = SystemReasoningPanel.getIndexWithProbOne(groupProbDist);
		let objectBinIndexWithProbOne = SystemReasoningPanel.getIndexWithProbOne(objectProbDist);

		let groupProbAtObjectValue = groupProbDist[objectBinIndexWithProbOne];
      	let groupBarHeight = heightScale(groupProbAtObjectValue);
      	let lineStartY = (groupProbAtObjectValue == 1) ? -15 : -5;
      	let lineEndY = chartHeight - groupBarHeight - 3 - 5;
      	let circleRadius = 3;
      	let lineX = xScale(objectBinIndexWithProbOne) + xScale.bandwidth() / 2
      	let pathData = 'M ' + lineX + ' ' + lineEndY + ' h -3 l 3 3 l 3 -3 z';

      	let groupStrokeColour = (groupType == 'top') ? SystemReasoningPanel.strokeColour.top : SystemReasoningPanel.strokeColour.bottom;
      	let groupFillColour = (groupType == 'top') ? SystemReasoningPanel.fillColour.top : SystemReasoningPanel.fillColour.bottom;
      	let objectStrokeColour = (groupType == 'top') ? SystemReasoningPanel.strokeColour.bottom : SystemReasoningPanel.strokeColour.top;
      	let objectFillColour = (groupType == 'top') ? SystemReasoningPanel.fillColour.bottom : SystemReasoningPanel.fillColour.top;

      	SystemReasoningPanel.svgGroup.selectAll('.' + groupType + '.bar')
			.data(groupProbDist)
			.enter()
			.append('rect')
			.attr('class', groupType + ' bar')
			.attr('x', function(d, i) { return xScale(i) + xScale.bandwidth() / 2 - xScale.bandwidth() / 1.5 / 2; })
			.attr('y', function(d) { return yScale(d); })
			.attr('width', xScale.bandwidth() / 1.5)
			.attr('height', function(d) { return heightScale(d); })
			.style('stroke', groupStrokeColour)
      		.style('fill', groupFillColour)
      		.style('fill-opacity', 0.2)
      		.style('cursor', 'pointer');

      	SystemReasoningPanel.svgGroup.append('line')
			.attr('class', 'bottom line')
			.attr('x1', lineX)
			.attr('x2', lineX)
			.attr('y1', lineStartY + circleRadius)
			.attr('y2', lineEndY)
			.style('stroke', objectStrokeColour)
			.style('stroke-dasharray', '5, 5');
      	SystemReasoningPanel.svgGroup.append('circle')
			.attr('class', 'bottom line')
			.attr('cx', lineX)
			.attr('cy', lineStartY)
			.attr('r', circleRadius)
			.style('stroke', objectStrokeColour)
      		.style('fill', objectFillColour)
      		.style('fill-opacity', 0.2);
      	SystemReasoningPanel.svgGroup.append('path')
			.attr('class', 'bottom line')
			.attr('d', pathData)
			.style('stroke', objectStrokeColour)
      		.style('fill', objectFillColour)
      		.style('fill-opacity', 0.2);
	},
	prepareScalesAndAxes: function(attributeName, numberOfBins) {
		let svgWidth = $('#system-reasoning-panel .distribution').width();
		let svgHeight = $('#system-reasoning-panel .distribution').height();
		let chartWidth = svgWidth - SystemReasoningPanel.margin.left - SystemReasoningPanel.margin.right;
		let chartHeight = svgHeight - SystemReasoningPanel.margin.top - SystemReasoningPanel.margin.bottom;
		let categories = OperatorMediator.metadataForEachAttribute[attributeName].uniqueValues;
		let binIndices = [];

		for (let i = 0; i < numberOfBins; i++)
			binIndices.push(i);
		let xScale = d3.scaleBand()
			.domain(binIndices)
			.range([ 0, chartWidth ]);
		let yScale = d3.scaleLinear()
			.domain([ 0, 1 ])
			.range([ chartHeight, 0 ]);
		let heightScale = d3.scaleLinear()
			.domain([ 0, 1 ])
			.range([ 0, chartHeight ]);
		let xAxis = d3.axisBottom(xScale)
			.tickFormat(function(d) { return categories[d]; });
      	let yAxis = d3.axisLeft(yScale)
      		.tickValues([0, 1])
      		.tickFormat(function(d) { return d * 100 + '%'; });

      	return [ xScale, yScale, heightScale, xAxis, yAxis ];
	},
	drawAxis: function(attributeName, xAxis = null, yAxis = null) {
		let svgWidth = $('#system-reasoning-panel .distribution').width();
		let svgHeight = $('#system-reasoning-panel .distribution').height();
		let chartWidth = svgWidth - SystemReasoningPanel.margin.left - SystemReasoningPanel.margin.right;
		let chartHeight = svgHeight - SystemReasoningPanel.margin.top - SystemReasoningPanel.margin.bottom;

		if (xAxis !== null) {
			SystemReasoningPanel.svgGroup
	      		.append('g')
	      		.attr('class', 'x axis')
	      		.attr('transform', 'translate(0,' + chartHeight + ')')
	      		.style('font-family', 'PT Sans Narrow')
	      		.style('font-size', 9)
	      		.call(xAxis);
	      	SystemReasoningPanel.svgGroup.select('.x.axis').append('text')
	      		.attr('class', 'label')
	      		.attr('x', chartWidth / 2)
	      		.attr('y', SystemReasoningPanel.margin.bottom - 10)
	      		.style('text-anchor', 'middle')
	      		.style('font-size', 12)
	      		.style('alignment-baseline', 'middle')
	      		.text(attributeName);
		}
      	if (yAxis !== null) {
      		SystemReasoningPanel.svgGroup
	      		.append('g')
	      		.attr('class', 'y axis')
	      		.style('font-family', 'PT Sans Narrow')
	      		.style('font-size', 9)
	      		.call(yAxis);
	      	SystemReasoningPanel.svgGroup.select('.y.axis').append('text')
	      		.attr('class', 'label')
	      		.attr('x', 0)
	      		.attr('y', chartHeight / 2)
	      		.attr('transform', 'translate(-23,' + (chartHeight / 2) + ') rotate(-90) translate(0,' + (- chartHeight / 2) + ')')
	      		.style('text-anchor', 'middle')
	      		.style('font-size', 12)
	      		.style('alignment-baseline', 'middle')
	      		.text('Percentage');
      	}

      	SystemReasoningPanel.svgGroup.selectAll('.axis').selectAll('text')
      		.style('fill', 'gray');
      	SystemReasoningPanel.svgGroup.selectAll('.axis').selectAll('path')
      		.style('stroke', 'gray');
      	SystemReasoningPanel.svgGroup.selectAll('.axis').selectAll('line')
      		.style('stroke', 'gray');
    },
    adjustLabelIfOverlapped: function(attributeName) {
		let hasOverlappedLabels = false;
		let previousLabelRight = -Infinity;
		let newXAxisHeight = null;

		SystemReasoningPanel.svgGroup.selectAll('.x.axis .tick text').each(function() {
			let currentLabelBBox = this.getBoundingClientRect();
			let currentLabelLeft = currentLabelBBox.x;
			let currentLabelRight = currentLabelLeft + currentLabelBBox.width;

			if (currentLabelLeft > previousLabelRight)
				previousLabelRight = currentLabelRight
			else if (currentLabelLeft <= previousLabelRight) {
				hasOverlappedLabels = true;
				return false;
			}
		});

		if (hasOverlappedLabels) {
			SystemReasoningPanel.svgGroup.selectAll('.x.axis .tick text')
				.attr('y', 0)
				.attr('dy', 8)
				.attr('dx', -8)
      			.attr('transform', 'rotate(-45)')
      			.style('text-anchor', 'end');
      		SystemReasoningPanel.svgGroup.select('.x.axis .label') // remove text before compute height
      			.text('');
      		newXAxisHeight = SystemReasoningPanel.svgGroup.select('.x.axis').node()
      			.getBoundingClientRect().height;
      		SystemReasoningPanel.svgGroup.select('.x.axis .label')
      			.attr('y', newXAxisHeight)
      			.text(attributeName);
      		SystemReasoningPanel.adjustHeight();
		}
	},
	installMouseenter: function() {
		SystemReasoningPanel.svgGroup.selectAll('.top.bar') // seperate them to get the correct index
			.on('mouseenter', mouseenterBar)
			.on('mouseleave', mouseleaveBar);
		SystemReasoningPanel.svgGroup.selectAll('.bottom.bar')
			.on('mouseenter', mouseenterBar)
			.on('mouseleave', mouseleaveBar);
		SystemReasoningPanel.svgGroup.selectAll('.x.axis .tick text')
			.on('mouseenter', mouseenterBar)
			.on('mouseleave', mouseleaveBar);

		function mouseenterBar(d, i) {
			let currentBinIndex = i;
			let allTopBarEl = SystemReasoningPanel.svgGroup.selectAll('.top.bar').nodes();
			let allBottomBarEl = SystemReasoningPanel.svgGroup.selectAll('.bottom.bar').nodes();
			let xAxisTextEl = SystemReasoningPanel.svgGroup.selectAll('.x.axis .tick text').nodes()[currentBinIndex];

			// highlight text
			d3.select(xAxisTextEl)
				.style('font-weight', 'bold')
				.style('font-size', 11);

			// highlight top bar if exist
			if (allTopBarEl.length != 0) {
				let currentTopBarEl = allTopBarEl[currentBinIndex];
				let currentTopBarBBox = currentTopBarEl.getBBox();
				let currentTopBarPercentText = Math.round(d3.select(currentTopBarEl).datum() * 100 * 100) / 100 + '%';
				let currentTopBarPercentColour = SystemReasoningPanel.fillColour.top;
				let currentTopBarPercentTextX = currentTopBarBBox.x + currentTopBarBBox.width - 1 - 3; // 3 is padding
				let currentTopBarPercentTextY = currentTopBarBBox.y - 8;
				let currentTopBarPercentTextAnchor = 'end';

				// adjust x if needed
				if (allBottomBarEl.length == 0) {
					currentTopBarPercentTextX = currentTopBarBBox.x + currentTopBarBBox.width / 2;
					currentTopBarPercentTextAnchor = 'middle';
				}

				// adjust y if needed
				if (allBottomBarEl.length != 0) {
					let currentBottomBarEl = allBottomBarEl[currentBinIndex];
					let currentBottomBarBBox = currentBottomBarEl.getBBox();

					if (currentTopBarBBox.y > currentBottomBarBBox.y) 
						currentTopBarPercentTextY = currentBottomBarBBox.y - 8;
				}

				// highlight
				let currentTopBar = d3.select(currentTopBarEl)
					.style('fill-opacity', 0.6);
				let currentTopBarPercentGroup = SystemReasoningPanel.svgGroup.append('g')
					.attr('class', 'percent');
				let currentTopBarPercentGroupText = currentTopBarPercentGroup.append('text')
					.attr('x', currentTopBarPercentTextX)
					.attr('y', currentTopBarPercentTextY)
					.style('fill', currentTopBarPercentColour)
					.style('text-anchor', currentTopBarPercentTextAnchor)
					.style('font-size', 11)
					.text(currentTopBarPercentText);
				let currentTopBarPercentGroupTextBBox = currentTopBarPercentGroupText.node().getBBox();
				let currentTopBarPercentGroupBackground = currentTopBarPercentGroup.insert('rect', 'text')
					.attr('x', currentTopBarPercentGroupTextBBox.x - 3)
					.attr('y', currentTopBarPercentGroupTextBBox.y)
					.attr('rx', 2)
					.attr('ry', 2)
					.attr('width', currentTopBarPercentGroupTextBBox.width + 6)
					.attr('height', currentTopBarPercentGroupTextBBox.height)
					.style('stroke', currentTopBarPercentColour)
					.style('fill', 'white');
			}

			// highlight bottom bar if exist
			if (allBottomBarEl.length != 0) {
				let currentBottomBarEl = allBottomBarEl[currentBinIndex];
				let currentBottomBarBBox = currentBottomBarEl.getBBox();
				let currentBottomBarPercentText = Math.round(d3.select(currentBottomBarEl).datum() * 100 * 100) / 100 + '%';
				let currentBottomBarPercentColour = SystemReasoningPanel.fillColour.bottom;
				let currentBottomBarPercentTextX = currentBottomBarBBox.x + 1 + 3; // 3 is padding
				let currentBottomBarPercentTextY = currentBottomBarBBox.y - 8;
				let currentBottomBarPercentTextAnchor = 'start';

				// adjust x if needed
				if (allTopBarEl.length == 0) {
					currentBottomBarPercentTextX = currentBottomBarBBox.x + currentBottomBarBBox.width / 2;
					currentBottomBarPercentTextAnchor = 'middle';
				}

				// adjust y if needed
				if (allTopBarEl.length != 0) {
					let currentTopBarEl = allTopBarEl[currentBinIndex];
					let currentTopBarBBox = currentTopBarEl.getBBox();

					if (currentBottomBarBBox.y > currentTopBarBBox.y) 
						currentBottomBarPercentTextY = currentTopBarBBox.y - 8;
				}

				// highlight
				let currentBottomBar = d3.select(currentBottomBarEl)
					.style('fill-opacity', 0.6);
				let currentBottomBarPercentGroup = SystemReasoningPanel.svgGroup.append('g')
					.attr('class', 'percent');
				let currentBottomBarPercentGroupText = currentBottomBarPercentGroup.append('text')
					.attr('x', currentBottomBarPercentTextX)
					.attr('y', currentBottomBarPercentTextY)
					.style('fill', currentBottomBarPercentColour)
					.style('text-anchor', currentBottomBarPercentTextAnchor)
					.style('font-size', 11)
					.text(currentBottomBarPercentText);
				let currentBottomBarPercentGroupTextBBox = currentBottomBarPercentGroupText.node().getBBox();
				let currentBottomBarPercentGroupBackground = currentBottomBarPercentGroup.insert('rect', 'text')
					.attr('x', currentBottomBarPercentGroupTextBBox.x - 3)
					.attr('y', currentBottomBarPercentGroupTextBBox.y)
					.attr('rx', 2)
					.attr('ry', 2)
					.attr('width', currentBottomBarPercentGroupTextBBox.width + 6)
					.attr('height', currentBottomBarPercentGroupTextBBox.height)
					.style('stroke', currentBottomBarPercentColour)
					.style('fill', 'white');
			}
		}

		function mouseleaveBar(d, i) {
			let currentBinIndex = i;
			let allTopBarEl = SystemReasoningPanel.svgGroup.selectAll('.top.bar').nodes();
			let allBottomBarEl = SystemReasoningPanel.svgGroup.selectAll('.bottom.bar').nodes();
			let xAxisTextEl = SystemReasoningPanel.svgGroup.selectAll('.x.axis .tick text').nodes()[currentBinIndex];

			d3.select(xAxisTextEl)
				.style('font-weight', null)
				.style('font-size', null);
			SystemReasoningPanel.svgGroup.selectAll('.percent')
				.remove()
			if (allTopBarEl.length != 0)
				d3.select(allTopBarEl[currentBinIndex])
					.style('fill-opacity', 0.2);
			if (allBottomBarEl.length != 0)
				d3.select(allBottomBarEl[currentBinIndex])
					.style('fill-opacity', 0.2);
		}
	}
}