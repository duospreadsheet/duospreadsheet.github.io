const SystemReasoningPanelHistogram = {
	draw: function(attributeName, topGroupInfo, bottomGroupInfo) {
		const self = this;
		let topGroupProbDist = topGroupInfo.probabilityDistribution;
		let bottomGroupProbDist = bottomGroupInfo.probabilityDistribution;
		let numOfObjInTopGroup = topGroupInfo.numberOfObjects;
		let numOfObjInBottomGroup = bottomGroupInfo.numberOfObjects;

		let topGroupMean = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].topGroupMean;
        let bottomGroupMean = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].bottomGroupMean;
		let numberOfBins = topGroupProbDist.length;
        let xScaleBin = null, xScaleOverallMinMax = null, xScaleCurrentMinMax = null, yScale = null, heightScale = null;
        let xAxisOverallMinMax = null, xAxisCurrentMinMax = null, yAxis = null;

        let bothGroupsHaveOneObject = (numOfObjInTopGroup == 1 && numOfObjInBottomGroup == 1);
        let topGroupHasMultipleObjectsAndBottomGroupHasOne = (numOfObjInTopGroup != 1 && numOfObjInBottomGroup == 1);
        let bottomGroupHasMultipleObjectsAndTopGroupHasOne = (numOfObjInBottomGroup != 1 && numOfObjInTopGroup == 1);
        let bothGroupsHaveMultipleObjects = (numOfObjInBottomGroup != 1 && numOfObjInTopGroup != 1);

        if (bothGroupsHaveOneObject) {
        	SystemReasoningPanel.setHeight(150);
        	SystemReasoningPanel.adjustSVGGroupMargin(20, 20, 50, 20); // no y axis
            [ xScaleBin, xScaleOverallMinMax, xScaleCurrentMinMax, yScale, heightScale, 
              xAxisOverallMinMax, xAxisCurrentMinMax, yAxis ] = self.prepareScalesAndAxes(attributeName, numberOfBins);

            self.drawBackground();
            self.drawTwoValues(topGroupMean, bottomGroupMean, xScaleOverallMinMax);
            self.drawAxis(attributeName, xAxisOverallMinMax);
            self.adjustXAxisLabels(topGroupMean, bottomGroupMean);
        }
        if (topGroupHasMultipleObjectsAndBottomGroupHasOne) {
        	SystemReasoningPanel.setHeight(230);
        	SystemReasoningPanel.adjustSVGGroupMargin(20, 35, 35, 20);
        	[ xScaleBin, xScaleOverallMinMax, xScaleCurrentMinMax, yScale, heightScale, 
              xAxisOverallMinMax, xAxisCurrentMinMax, yAxis ] = self.prepareScalesAndAxes(attributeName, numberOfBins);

            self.drawBackground();
            self.drawOneHistogram(topGroupProbDist, xScaleBin, yScale, heightScale, 'top', moveBarToCentre = true);
            self.drawTwoValues(topGroupMean, bottomGroupMean, xScaleCurrentMinMax, 'top');
            self.drawAxis(attributeName, xAxisCurrentMinMax, yAxis);
            self.adjustXAxisLabels(topGroupMean, bottomGroupMean);
            self.adjustAverageTags(topGroupMean, bottomGroupMean);
        }
        if (bottomGroupHasMultipleObjectsAndTopGroupHasOne) {
        	SystemReasoningPanel.setHeight(230);
        	SystemReasoningPanel.adjustSVGGroupMargin(20, 35, 35, 20);
        	[ xScaleBin, xScaleOverallMinMax, xScaleCurrentMinMax, yScale, heightScale, 
              xAxisOverallMinMax, xAxisCurrentMinMax, yAxis ] = self.prepareScalesAndAxes(attributeName, numberOfBins);

            self.drawBackground();
            self.drawOneHistogram(bottomGroupProbDist, xScaleBin, yScale, heightScale, 'bottom', moveBarToCentre = true);
            self.drawTwoValues(topGroupMean, bottomGroupMean, xScaleCurrentMinMax, 'bottom');
            self.drawAxis(attributeName, xAxisCurrentMinMax, yAxis);
            self.adjustXAxisLabels(topGroupMean, bottomGroupMean);
            self.adjustAverageTags(topGroupMean, bottomGroupMean);
        }
        if (bothGroupsHaveMultipleObjects) {
        	SystemReasoningPanel.setHeight(230);
        	SystemReasoningPanel.adjustSVGGroupMargin(20, 35, 35, 20);
        	[ xScaleBin, xScaleOverallMinMax, xScaleCurrentMinMax, yScale, heightScale, 
              xAxisOverallMinMax, xAxisCurrentMinMax, yAxis ] = self.prepareScalesAndAxes(attributeName, numberOfBins);

            self.drawBackground();
            self.drawOneHistogram(topGroupProbDist, xScaleBin, yScale, heightScale, 'top');
            self.drawOneHistogram(bottomGroupProbDist, xScaleBin, yScale, heightScale, 'bottom');
            self.drawTwoValues(topGroupMean, bottomGroupMean, xScaleCurrentMinMax, 'both');
            self.drawAxis(attributeName, xAxisCurrentMinMax, yAxis);
            self.adjustXAxisLabels(topGroupMean, bottomGroupMean);
            self.adjustAverageTags(topGroupMean, bottomGroupMean);
        }
	},
	prepareScalesAndAxes: function(attributeName, numberOfBins) {
		let svgWidth = $('#system-reasoning-panel .distribution').width();
        let svgHeight = $('#system-reasoning-panel .distribution').height();
        let chartWidth = svgWidth - SystemReasoningPanel.margin.left - SystemReasoningPanel.margin.right;
        let chartHeight = svgHeight - SystemReasoningPanel.margin.top - SystemReasoningPanel.margin.bottom;
        let overallMinValue = Database.metadata[attributeName].minValue;
        let overallMaxValue = Database.metadata[attributeName].maxValue;
        let currentMinValue = OperatorMediator.metadataForEachAttribute[attributeName].minValue;
        let currentMaxValue = OperatorMediator.metadataForEachAttribute[attributeName].maxValue;
		let binIndices = [];

		let topGroupMean = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].topGroupMean;
        let bottomGroupMean = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].bottomGroupMean;
        let largerMean = (topGroupMean > bottomGroupMean) ? topGroupMean : bottomGroupMean;
        let smallerMean = (topGroupMean < bottomGroupMean) ? topGroupMean : bottomGroupMean;

        let currentMinValueTwoDecimal = parseFloat(Math.round(currentMinValue * 100) / 100).toFixed(2);
        let currentMaxValueTwoDecimal = parseFloat(Math.round(currentMaxValue * 100) / 100).toFixed(2);
        let smallerMeanTwoDecimal = parseFloat(Math.round(smallerMean * 100) / 100).toFixed(2);
        let largerMeanTwoDecimal = parseFloat(Math.round(largerMean * 100) / 100).toFixed(2);

		for (let i = 0; i < numberOfBins; i++)
			binIndices.push(i);
		let xScaleBin = d3.scaleBand() // for rendering bars
			.domain(binIndices)
			.range([ 0, chartWidth ]);
		let xScaleOverallMinMax = d3.scaleLinear() // for rendering values (both objects)
            .domain([ overallMinValue, overallMaxValue ])
            .range([ 0, chartWidth ]);
        let xScaleCurrentMinMax = d3.scaleLinear() // for lines (at least one group)
            .domain([ currentMinValue, currentMaxValue ])
            .range([ 0, chartWidth ]);
		let yScale = d3.scaleLinear()
			.domain([ 0, 1 ])
			.range([ chartHeight, 0 ]);
		let heightScale = d3.scaleLinear()
			.domain([ 0, 1 ])
			.range([ 0, chartHeight ]);

		let xAxisOverallMinMax = d3.axisBottom(xScaleOverallMinMax)
            .tickValues([ overallMinValue, currentMinValueTwoDecimal, currentMaxValueTwoDecimal, overallMaxValue ])
            .tickFormat(function(d) { return d; });
        let xAxisCurrentMinMax = d3.axisBottom(xScaleCurrentMinMax)
            .tickValues([ currentMinValue, smallerMeanTwoDecimal, largerMeanTwoDecimal, currentMaxValue ])
            .tickFormat(function(d) { return d; });
        let yAxis = d3.axisLeft(yScale)
            .tickValues([0, 1])
            .tickFormat(function(d) { return d * 100 + '%'; });

        return [ xScaleBin, xScaleOverallMinMax, xScaleCurrentMinMax, yScale, heightScale, xAxisOverallMinMax, xAxisCurrentMinMax, yAxis ];
	},
	drawBackground: function() {
		SystemReasoningPanelDensityPlot.drawBackground()
	},
	drawOneHistogram: function(probabilityDistribution, xScaleBin, yScale, heightScale, shelfType, moveBarToCentre = false) {
		let strokeColour = SystemReasoningPanel.strokeColour[shelfType];
        let fillColour = SystemReasoningPanel.fillColour[shelfType];
        let className = shelfType + ' bar';
        let barSelector = '.' + shelfType + '.bar';
        let barWidth = moveBarToCentre ? xScaleBin.bandwidth() / 1.5 : xScaleBin.bandwidth() / 1.5 / 2;

		SystemReasoningPanel.svgGroup.selectAll(barSelector)
			.data(probabilityDistribution)
			.enter()
			.append('rect')
			.attr('class', className)
			.attr('x', function(d, i) {
				if (moveBarToCentre)
					return xScaleBin(i) + xScaleBin.bandwidth() / 2 - barWidth / 2;
				if (!moveBarToCentre && shelfType == 'top')
					return xScaleBin(i) + xScaleBin.bandwidth() / 2 - barWidth;
				if (!moveBarToCentre && shelfType == 'bottom')
					return xScaleBin(i) + xScaleBin.bandwidth() / 2;
			})
			.attr('y', function(d) {
				return yScale(d);
			})
			.attr('width', barWidth)
			.attr('height', function(d) {
				return heightScale(d);
			})
			.style('stroke', strokeColour)
			.style('fill', fillColour)
			.style('fill-opacity', 0.2)
			.style('cursor', 'pointer');
	},
	drawTwoValues: function(topGroupValue, bottomGroupValue, xScale, whichIsMean) {
		SystemReasoningPanelDensityPlot.drawTwoValues(topGroupValue, bottomGroupValue, xScale, whichIsMean);
	},
	drawAxis: function(attributeName, xAxis = null, yAxis = null) {
		SystemReasoningPanelDensityPlot.drawAxis(attributeName, xAxis, yAxis);
	},
	adjustXAxisLabels: function(topGroupMean, bottomGroupMean) {
		SystemReasoningPanelDensityPlot.adjustXAxisLabels(topGroupMean, bottomGroupMean);
	},
	adjustAverageTags: function(topGroupValue, bottomGroupValue) {
		SystemReasoningPanelDensityPlot.adjustAverageTags(topGroupValue, bottomGroupValue);
	},
	installMouseenter: function() {
		SystemReasoningPanel.svgGroup.selectAll('.top.bar') // seperate them to get the correct index
            .on('mouseenter', mouseenterBar)
            .on('mouseleave', mouseleaveBar);
	    SystemReasoningPanel.svgGroup.selectAll('.bottom.bar')
	     	.on('mouseenter', mouseenterBar)
			.on('mouseleave', mouseleaveBar);

		function mouseenterBar(d, i) {
			let currentBinIndex = i;
			let allTopBarEl = SystemReasoningPanel.svgGroup.selectAll('.top.bar').nodes();
			let allBottomBarEl = SystemReasoningPanel.svgGroup.selectAll('.bottom.bar').nodes();

			// highlight top bar if exist
			if (allTopBarEl.length != 0) {
				let currentTopBarEl = allTopBarEl[currentBinIndex];
				let currentTopBarBBox = currentTopBarEl.getBBox();
				let currentTopBarPercentText = Math.round(d3.select(currentTopBarEl).datum() * 100 * 100) / 100 + '%';
				let currentTopBarPercentColour = SystemReasoningPanel.fillColour.top;
				let currentTopBarPercentTextX = currentTopBarBBox.x + currentTopBarBBox.width - 1 - 3; // 3 is padding
            	let currentTopBarPercentTextY = currentTopBarBBox.y - 8;
            	let currentTopBarPercentTextAnchor = 'end';

            	// handle safari bug
				if (currentTopBarPercentTextX == 0 - 1 - 3) {
					let currentBottomBarEl = allBottomBarEl[currentBinIndex];
					let currentBottomBarBBox = currentBottomBarEl.getBBox();
					currentTopBarPercentTextX = currentBottomBarBBox.x - 1 - 3;
					currentTopBarPercentTextY = currentBottomBarBBox.y - 8;
				}

            	// adjust x if needed
				if (allBottomBarEl.length == 0) {
					currentTopBarPercentTextX = currentTopBarBBox.x + currentTopBarBBox.width / 2;
					currentTopBarPercentTextAnchor = 'middle';
				}

				// adjust y if needed
				if (allBottomBarEl.length != 0) {
					let currentBottomBarEl = allBottomBarEl[currentBinIndex];
					let currentBottomBarBBox = currentBottomBarEl.getBBox();

					if (currentTopBarBBox.y > currentBottomBarBBox.y && currentBottomBarBBox.y != 0) // handle safari bug
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

				// handle safari bug
				if (currentBottomBarPercentTextX == 0 + 1 + 3) {
					let currentTopBarEl = allTopBarEl[currentBinIndex];
					let currentTopBarBBox = currentTopBarEl.getBBox();
					currentBottomBarPercentTextX = currentTopBarBBox.x + currentTopBarBBox.width + 1 + 3;
					currentBottomBarPercentTextY = currentTopBarBBox.y - 8;
				}

				// adjust x if needed
				if (allTopBarEl.length == 0) {
					currentBottomBarPercentTextX = currentBottomBarBBox.x + currentBottomBarBBox.width / 2;
					currentBottomBarPercentTextAnchor = 'middle';
				}

				// adjust y if needed
				if (allTopBarEl.length != 0) {
					let currentTopBarEl = allTopBarEl[currentBinIndex];
					let currentTopBarBBox = currentTopBarEl.getBBox();

					if (currentBottomBarBBox.y > currentTopBarBBox.y && currentTopBarBBox.y != 0) // handle safari bug
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

			// draw range of bin
			let attributeName = $('#system-reasoning-panel').attr('attribute-name');
            let minValue = OperatorMediator.metadataForEachAttribute[attributeName].minValue;
            let maxValue = OperatorMediator.metadataForEachAttribute[attributeName].maxValue;
            let binSize = OperatorMediator.metadataForEachAttribute[attributeName].binSize;

			let lowerValue = Math.round((minValue + currentBinIndex * binSize) * 100) / 100;
            let upperValue = Math.round((lowerValue + binSize) * 100) / 100;
            let lowerValueX = null;
            let upperValueX = null;
            let lowerUpperValueY = '9px';
            let lowerUpperValueDy = '0.71em';

            if (allTopBarEl.length == 0 && allBottomBarEl.length != 0) { // only bottom
            	let currentBottomBarEl = allBottomBarEl[currentBinIndex];
				let currentBottomBarBBox = currentBottomBarEl.getBBox();
            	lowerValueX = currentBottomBarBBox.x;
            	upperValueX = currentBottomBarBBox.x + currentBottomBarBBox.width;
            }
            if (allTopBarEl.length != 0 && allBottomBarEl.length == 0) { // only top
            	let currentTopBarEl = allTopBarEl[currentBinIndex];
				let currentTopBarBBox = currentTopBarEl.getBBox();
            	lowerValueX = currentTopBarBBox.x;
            	upperValueX = currentTopBarBBox.x + currentTopBarBBox.width;
            }
            if (allTopBarEl.length != 0 && allBottomBarEl.length != 0) { // both exist
            	let currentBottomBarEl = allBottomBarEl[currentBinIndex];
				let currentBottomBarBBox = currentBottomBarEl.getBBox();
				let currentTopBarEl = allTopBarEl[currentBinIndex];
				let currentTopBarBBox = currentTopBarEl.getBBox();
				lowerValueX = currentTopBarBBox.x;
            	upperValueX = currentBottomBarBBox.x + currentBottomBarBBox.width;

            	// handle safari bug
            	if (lowerValueX == 0) lowerValueX = currentBottomBarBBox.x - currentBottomBarBBox.width;
            	if (upperValueX == 0) upperValueX = currentTopBarBBox.x + currentTopBarBBox.width * 2;
            }

			let lowerValueText = SystemReasoningPanel.svgGroup.select('.x.axis').append('text')
            	.attr('class', 'value')
				.attr('x', lowerValueX)
				.attr('y', lowerUpperValueY)
				.attr('dy', lowerUpperValueDy)
				.style('text-anchor', 'end')
				.style('fill', 'gray')
				.style('font-weight', 'bold')
				.style('font-size', 11)
				.text(lowerValue);
            let upperValueText = SystemReasoningPanel.svgGroup.select('.x.axis').append('text')
            	.attr('class', 'value')
				.attr('x', upperValueX)
				.attr('y', lowerUpperValueY)
				.attr('dy', lowerUpperValueDy)
				.style('text-anchor', 'start')
				.style('fill', 'gray')
				.style('font-weight', 'bold')
				.style('font-size', 11)
				.text(upperValue);

			// hide ticks on overlapping
			let lowerValueTextBBox = lowerValueText.node().getBoundingClientRect();
			let upperValueTextBBox = upperValueText.node().getBoundingClientRect();
			let lowerValueTextLeft = lowerValueTextBBox.x, lowerValueTextRight = lowerValueTextBBox.x + lowerValueTextBBox.width;
			let upperValueTextLeft = upperValueTextBBox.x, upperValueTextRight = upperValueTextBBox.x + upperValueTextBBox.width;

			SystemReasoningPanel.svgGroup.selectAll('.x.axis .tick text').each(function() {
				let currentTextBBox = this.getBoundingClientRect();
				let currentTextLeft = currentTextBBox.x;
				let currentTextRight = currentTextBBox.x + currentTextBBox.width;

				if (currentTextBBox.x < lowerValueTextBBox.x && 
					currentTextRight > lowerValueTextLeft) // left to lower
					d3.select(this).style('opacity', 0);

				else if (currentTextBBox.x > lowerValueTextBBox.x && 
						 lowerValueTextRight > currentTextLeft) // right to lower
					d3.select(this).style('opacity', 0);

				else if (currentTextBBox.x < upperValueTextBBox.x && 
						 currentTextRight > upperValueTextLeft) // left to upper
					d3.select(this).style('opacity', 0);

				else if (currentTextBBox.x > upperValueTextBBox.x && 
						 upperValueTextRight > currentTextLeft) // right to upper
					d3.select(this).style('opacity', 0)
			});
		}

		function mouseleaveBar(d, i) {
			let currentBinIndex = i;
			let allTopBarEl = SystemReasoningPanel.svgGroup.selectAll('.top.bar').nodes();
			let allBottomBarEl = SystemReasoningPanel.svgGroup.selectAll('.bottom.bar').nodes();

			if (allTopBarEl.length != 0)
	            d3.select(allTopBarEl[currentBinIndex])
	                .style('fill-opacity', 0.2);
	        if (allBottomBarEl.length != 0)
	            d3.select(allBottomBarEl[currentBinIndex])
	                .style('fill-opacity', 0.2);
            SystemReasoningPanel.svgGroup.selectAll('.x.axis .tick text')
				.style('opacity', null);
			SystemReasoningPanel.svgGroup.selectAll('.x.axis .tick text.hidden') // some are hidden due to overlapping
				.style('opacity', 0);
            SystemReasoningPanel.svgGroup.selectAll('.percent')
                  .remove();
            SystemReasoningPanel.svgGroup.selectAll('.value')
                  .remove();
		}
	}
}