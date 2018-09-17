const SystemReasoningPanelDensityPlot = {
	draw: function(attributeName, topGroupInfo, bottomGroupInfo) {
		const self = this;
		let topGroupProbDist = topGroupInfo.probabilityDistribution;
		let bottomGroupProbDist = bottomGroupInfo.probabilityDistribution;
		let numOfObjInTopGroup = topGroupInfo.numberOfObjects;
		let numOfObjInBottomGroup = bottomGroupInfo.numberOfObjects;

        let topGroupMean = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].topGroupMean;
        let bottomGroupMean = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].bottomGroupMean;
		let numberOfBins = topGroupProbDist.length;
        let xScaleOverallMinMax = null, xScaleCurrentMinMax = null, yScale = null, heightScale = null, area = null
        let xAxisOverallMinMax = null, xAxisCurrentMinMax = null, yAxis = null;

        let bothGroupsHaveOneObject = (numOfObjInTopGroup == 1 && numOfObjInBottomGroup == 1);
        let topGroupHasMultipleObjectsAndBottomGroupHasOne = (numOfObjInTopGroup != 1 && numOfObjInBottomGroup == 1);
        let bottomGroupHasMultipleObjectsAndTopGroupHasOne = (numOfObjInBottomGroup != 1 && numOfObjInTopGroup == 1);
        let bothGroupsHaveMultipleObjects = (numOfObjInBottomGroup != 1 && numOfObjInTopGroup != 1);

        if (bothGroupsHaveOneObject) {
            SystemReasoningPanel.setHeight(150);
            SystemReasoningPanel.adjustSVGGroupMargin(20, 20, 50, 20); // no y axis
            [ xScaleOverallMinMax, xScaleCurrentMinMax, yScale, heightScale, area, 
              xAxisOverallMinMax, xAxisCurrentMinMax, yAxis ] = self.prepareScalesAndAxes(attributeName, numberOfBins);
            
            self.drawBackground();
            self.drawTwoValues(topGroupMean, bottomGroupMean, xScaleOverallMinMax);
            self.drawAxis(attributeName, xAxisOverallMinMax);
            self.adjustXAxisLabels(topGroupMean, bottomGroupMean);
        }
        if (topGroupHasMultipleObjectsAndBottomGroupHasOne) {
            SystemReasoningPanel.setHeight(230);
            SystemReasoningPanel.adjustSVGGroupMargin(20, 35, 35, 20);
            [ xScaleOverallMinMax, xScaleCurrentMinMax, yScale, heightScale, area, 
              xAxisOverallMinMax, xAxisCurrentMinMax, yAxis ] = self.prepareScalesAndAxes(attributeName, numberOfBins);
            
            self.drawBackground();
            self.drawOneDensityPlot(topGroupProbDist, area, 'top');
            self.drawTwoValues(topGroupMean, bottomGroupMean, xScaleCurrentMinMax, 'top');
            self.drawAxis(attributeName, xAxisCurrentMinMax, yAxis);
            self.adjustXAxisLabels(topGroupMean, bottomGroupMean);
            self.adjustAverageTags(topGroupMean, bottomGroupMean);
        }
        if (bottomGroupHasMultipleObjectsAndTopGroupHasOne) {
            SystemReasoningPanel.setHeight(230);
            SystemReasoningPanel.adjustSVGGroupMargin(20, 35, 35, 20);
            [ xScaleOverallMinMax, xScaleCurrentMinMax, yScale, heightScale, area, 
              xAxisOverallMinMax, xAxisCurrentMinMax, yAxis ] = self.prepareScalesAndAxes(attributeName, numberOfBins);
            
            self.drawBackground();
            self.drawOneDensityPlot(bottomGroupProbDist, area, 'bottom');
            self.drawTwoValues(topGroupMean, bottomGroupMean, xScaleCurrentMinMax, 'bottom');
            self.drawAxis(attributeName, xAxisCurrentMinMax, yAxis);
            self.adjustXAxisLabels(topGroupMean, bottomGroupMean);
            self.adjustAverageTags(topGroupMean, bottomGroupMean);
        }
        if (bothGroupsHaveMultipleObjects) {
            SystemReasoningPanel.setHeight(230);
            SystemReasoningPanel.adjustSVGGroupMargin(20, 35, 35, 20);
            [ xScaleOverallMinMax, xScaleCurrentMinMax, yScale, heightScale, area, 
              xAxisOverallMinMax, xAxisCurrentMinMax, yAxis ] = self.prepareScalesAndAxes(attributeName, numberOfBins);
            
            self.drawBackground();
            self.drawOneDensityPlot(topGroupProbDist, area, 'top');
            self.drawOneDensityPlot(bottomGroupProbDist, area, 'bottom');
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

        let topGroupMean = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].topGroupMean;
        let bottomGroupMean = OperatorMediator.meanInfoForEachNumericalAttribute[attributeName].bottomGroupMean;
        let largerMean = (topGroupMean > bottomGroupMean) ? topGroupMean : bottomGroupMean;
        let smallerMean = (topGroupMean < bottomGroupMean) ? topGroupMean : bottomGroupMean;

        let currentMinValueTwoDecimal = parseFloat(Math.round(currentMinValue * 100) / 100).toFixed(2);
        let currentMaxValueTwoDecimal = parseFloat(Math.round(currentMaxValue * 100) / 100).toFixed(2);
        let smallerMeanTwoDecimal = parseFloat(Math.round(smallerMean * 100) / 100).toFixed(2);
        let largerMeanTwoDecimal = parseFloat(Math.round(largerMean * 100) / 100).toFixed(2);

        let xScaleOverallMinMax = d3.scaleLinear()
            .domain([ overallMinValue, overallMaxValue ])
            .range([ 0, chartWidth ]);
        let xScaleCurrentMinMax = d3.scaleLinear()
            .domain([ currentMinValue, currentMaxValue ])
            .range([ 0, chartWidth ]);
        let yScale = d3.scaleLinear()
            .domain([ 0, 1 ])
            .range([ chartHeight, 0 ]);
        let heightScale = d3.scaleLinear()
            .domain([ 0, 1 ])
            .range([ 0, chartHeight ]);

        let area = d3.area()
            .x(function(d, i) {
                let binIndex = i;
                let newBinSize = (currentMaxValue - currentMinValue) / (numberOfBins - 1);
                let xValue = currentMinValue + newBinSize * binIndex;

                return xScaleCurrentMinMax(xValue);
            })
            .y0(function(d) {
                return yScale(d);
            })
            .y1(chartHeight)
            .curve(d3.curveMonotoneX);

        let xAxisOverallMinMax = d3.axisBottom(xScaleOverallMinMax)
            .tickValues([ overallMinValue, currentMinValueTwoDecimal, currentMaxValueTwoDecimal, overallMaxValue ])
            .tickFormat(function(d) { return d; });
        let xAxisCurrentMinMax = d3.axisBottom(xScaleCurrentMinMax)
            .tickValues([ currentMinValue, smallerMeanTwoDecimal, largerMeanTwoDecimal, currentMaxValue ])
            .tickFormat(function(d) { return d; });
        let yAxis = d3.axisLeft(yScale)
            .tickValues([0, 1])
            .tickFormat(function(d) { return d * 100 + '%'; });

        return [ xScaleOverallMinMax, xScaleCurrentMinMax, yScale, heightScale, area, xAxisOverallMinMax, xAxisCurrentMinMax, yAxis ];
    },
    drawBackground: function() {
        let svgWidth = $('#system-reasoning-panel .distribution').width();
        let svgHeight = $('#system-reasoning-panel .distribution').height();

        // draw background for clicking
        SystemReasoningPanel.svgGroup.append('rect')
            .attr('x', - SystemReasoningPanel.margin.left)
            .attr('y', - SystemReasoningPanel.margin.top)
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .style('fill', 'white');
    },
    drawTwoValues: function(topGroupValue, bottomGroupValue, xScale, whichIsMean) {
        let isTopAndBottomGroupValueTheSame = (topGroupValue == bottomGroupValue);
        let svgWidth = $('#system-reasoning-panel .distribution').width();
        let svgHeight = $('#system-reasoning-panel .distribution').height();
        let chartHeight = svgHeight - SystemReasoningPanel.margin.top - SystemReasoningPanel.margin.bottom;
        let lineStartY = -5;
        let lineEndY = chartHeight - 10;
        let circleRadius = 3;

        if (isTopAndBottomGroupValueTheSame) {
            let lineNormalX = xScale(topGroupValue);
            let pathData = 'M ' + lineNormalX + ' ' + lineEndY + ' h -6 l 6 6 l 6 -6 z';

            // draw top group line
            if (whichIsMean == 'top' || whichIsMean == 'both') {
                let averageTag = SystemReasoningPanel.svgGroup.append('g')
                    .attr('class', 'top line avg tag');
                let averageBackground = averageTag.append('rect')
                    .attr('rx', 3)
                    .attr('ry', 3)
                    .style('stroke', SystemReasoningPanel.strokeColour.top)
                    .style('fill', 'white')
                    .style('fill-opacity', 0.2);
                let averageText = averageTag.append('text')
                    .attr('x', lineNormalX + 20)
                    .attr('y', lineStartY)
                    .style('text-anchor', 'middle')
                    .style('alignment-baseline', 'alphabetic')
                    .style('font-size', 9)
                    .style('fill', SystemReasoningPanel.strokeColour.top)
                    .text('AVG');

                let averageTextBBox = averageText.node().getBBox();
                averageBackground
                    .attr('x', averageTextBBox.x - 3)
                    .attr('y', averageTextBBox.y)
                    .attr('width', averageTextBBox.width + 6)
                    .attr('height', averageTextBBox.height);
            }
            else {
                SystemReasoningPanel.svgGroup.append('circle')
                    .attr('class', 'top line tag')
                    .attr('cx', lineNormalX + 20)
                    .attr('cy', lineStartY)
                    .attr('r', circleRadius)
                    .style('stroke', SystemReasoningPanel.strokeColour.top)
                    .style('fill', SystemReasoningPanel.fillColour.top)
                    .style('fill-opacity', 0.2);
            }

            SystemReasoningPanel.svgGroup.append('line')
                .attr('class', 'top line')
                .attr('x1', lineNormalX + 20)
                .attr('x2', lineNormalX)
                .attr('y1', lineStartY + circleRadius)
                .attr('y2', lineEndY)
                .style('stroke', SystemReasoningPanel.strokeColour.top)
                .style('stroke-dasharray', '5, 5');

            // draw bottom group line
            if (whichIsMean == 'bottom' || whichIsMean == 'both') {
                let averageTag = SystemReasoningPanel.svgGroup.append('g')
                    .attr('class', 'bottom line avg tag');
                let averageBackground = averageTag.append('rect')
                    .attr('rx', 3)
                    .attr('ry', 3)
                    .style('stroke', SystemReasoningPanel.strokeColour.bottom)
                    .style('fill', 'white')
                    .style('fill-opacity', 0.2);
                let averageText = averageTag.append('text')
                    .attr('x', lineNormalX - 20)
                    .attr('y', lineStartY)
                    .style('text-anchor', 'middle')
                    .style('alignment-baseline', 'alphabetic')
                    .style('font-size', 9)
                    .style('fill', SystemReasoningPanel.strokeColour.bottom)
                    .text('AVG');

                let averageTextBBox = averageText.node().getBBox();
                averageBackground
                    .attr('x', averageTextBBox.x - 3)
                    .attr('y', averageTextBBox.y)
                    .attr('width', averageTextBBox.width + 6)
                    .attr('height', averageTextBBox.height);
            }
            else {
                SystemReasoningPanel.svgGroup.append('circle')
                    .attr('class', 'bottom line tag')
                    .attr('cx', lineNormalX - 20)
                    .attr('cy', lineStartY)
                    .attr('r', circleRadius)
                    .style('stroke', SystemReasoningPanel.strokeColour.bottom)
                    .style('fill', SystemReasoningPanel.fillColour.bottom)
                    .style('fill-opacity', 0.2);
            }

            SystemReasoningPanel.svgGroup.append('line')
                .attr('class', 'bottom line')
                .attr('x1', lineNormalX - 20)
                .attr('x2', lineNormalX)
                .attr('y1', lineStartY + circleRadius)
                .attr('y2', lineEndY)
                .style('stroke', SystemReasoningPanel.strokeColour.bottom)
                .style('stroke-dasharray', '5, 5');

            // draw arrow
            SystemReasoningPanel.svgGroup.append('path')
                .attr('class', 'top bottom line')
                .attr('d', pathData)
                .style('stroke', 'gray')
                .style('fill', 'gray')
                .style('fill-opacity', 0.2);
        }

        if (!isTopAndBottomGroupValueTheSame) {
            let topGroupLineX = xScale(topGroupValue);
            let bottomGroupLineX = xScale(bottomGroupValue);
            let topPathData = 'M ' + topGroupLineX + ' ' + lineEndY + ' h -3 l 3 3 l 3 -3 z';
            let bottomPathData = 'M ' + bottomGroupLineX + ' ' + lineEndY + ' h -3 l 3 3 l 3 -3 z';

            // draw top group line
            if (whichIsMean == 'top' || whichIsMean == 'both') {
                let averageTag = SystemReasoningPanel.svgGroup.append('g')
                    .attr('class', 'top line avg tag');
                let averageBackground = averageTag.append('rect')
                    .attr('rx', 3)
                    .attr('ry', 3)
                    .style('stroke', SystemReasoningPanel.strokeColour.top)
                    .style('fill', 'white')
                    .style('fill-opacity', 0.2);
                let averageText = averageTag.append('text')
                    .attr('x', topGroupLineX)
                    .attr('y', lineStartY)
                    .style('text-anchor', 'middle')
                    .style('alignment-baseline', 'alphabetic')
                    .style('font-size', 9)
                    .style('fill', SystemReasoningPanel.strokeColour.top)
                    .text('AVG');

                let averageTextBBox = averageText.node().getBBox();
                averageBackground
                    .attr('x', averageTextBBox.x - 3)
                    .attr('y', averageTextBBox.y)
                    .attr('width', averageTextBBox.width + 6)
                    .attr('height', averageTextBBox.height);
            }
            else {
                SystemReasoningPanel.svgGroup.append('circle')
                    .attr('class', 'top line tag')
                    .attr('cx', topGroupLineX)
                    .attr('cy', lineStartY)
                    .attr('r', circleRadius)
                    .style('stroke', SystemReasoningPanel.strokeColour.top)
                    .style('fill', SystemReasoningPanel.fillColour.top)
                    .style('fill-opacity', 0.2);
            }

            SystemReasoningPanel.svgGroup.append('line')
                .attr('class', 'top line')
                .attr('x1', topGroupLineX)
                .attr('x2', topGroupLineX)
                .attr('y1', lineStartY + circleRadius)
                .attr('y2', lineEndY)
                .style('stroke', SystemReasoningPanel.strokeColour.top)
                .style('stroke-dasharray', '5, 5');
            SystemReasoningPanel.svgGroup.append('path')
                .attr('class', 'bottom line')
                .attr('d', topPathData)
                .style('stroke', SystemReasoningPanel.strokeColour.top)
                .style('fill', SystemReasoningPanel.fillColour.top)
                .style('fill-opacity', 0.2);

            // draw bottom group line
            if (whichIsMean == 'bottom' || whichIsMean == 'both') {
                let averageTag = SystemReasoningPanel.svgGroup.append('g')
                    .attr('class', 'bottom line avg tag');
                let averageBackground = averageTag.append('rect')
                    .attr('rx', 3)
                    .attr('ry', 3)
                    .style('stroke', SystemReasoningPanel.strokeColour.bottom)
                    .style('fill', 'white')
                    .style('fill-opacity', 0.2);
                let averageText = averageTag.append('text')
                    .attr('x', bottomGroupLineX)
                    .attr('y', lineStartY)
                    .style('text-anchor', 'middle')
                    .style('alignment-baseline', 'alphabetic')
                    .style('font-size', 9)
                    .style('fill', SystemReasoningPanel.strokeColour.bottom)
                    .text('AVG');

                let averageTextBBox = averageText.node().getBBox();
                averageBackground
                    .attr('x', averageTextBBox.x - 3)
                    .attr('y', averageTextBBox.y)
                    .attr('width', averageTextBBox.width + 6)
                    .attr('height', averageTextBBox.height);
            }
            else {
                SystemReasoningPanel.svgGroup.append('circle')
                    .attr('class', 'bottom line tag')
                    .attr('cx', bottomGroupLineX)
                    .attr('cy', lineStartY)
                    .attr('r', circleRadius)
                    .style('stroke', SystemReasoningPanel.strokeColour.bottom)
                    .style('fill', SystemReasoningPanel.fillColour.bottom)
                    .style('fill-opacity', 0.2);
            }

            SystemReasoningPanel.svgGroup.append('line')
                .attr('class', 'bottom line')
                .attr('x1', bottomGroupLineX)
                .attr('x2', bottomGroupLineX)
                .attr('y1', lineStartY + circleRadius)
                .attr('y2', lineEndY)
                .style('stroke', SystemReasoningPanel.strokeColour.bottom)
                .style('stroke-dasharray', '5, 5');
            SystemReasoningPanel.svgGroup.append('path')
                .attr('class', 'bottom line')
                .attr('d', bottomPathData)
                .style('stroke', SystemReasoningPanel.strokeColour.bottom)
                .style('fill', SystemReasoningPanel.fillColour.bottom)
                .style('fill-opacity', 0.2);
        }
    },
    drawOneDensityPlot: function(probabilityDistribution, area, shelfType) {
        let strokeColour = SystemReasoningPanel.strokeColour[shelfType];
        let fillColour = SystemReasoningPanel.fillColour[shelfType];
        let className = shelfType + '-distribution';

        SystemReasoningPanel.svgGroup.append('path')
            .datum(probabilityDistribution)
            .attr('class', className)
            .attr('d', function(d) { return area(d); })
            .style('fill-opacity', 0.2)
            .style('stroke', strokeColour)
            .style('fill', fillColour);
    },
    drawAxis: function(attributeName, xAxis = null, yAxis = null) {
        let svgWidth = $('#system-reasoning-panel .distribution').width();
        let svgHeight = $('#system-reasoning-panel .distribution').height();
        let chartWidth = svgWidth - SystemReasoningPanel.margin.left - SystemReasoningPanel.margin.right;
        let chartHeight = svgHeight - SystemReasoningPanel.margin.top - SystemReasoningPanel.margin.bottom;

        if (xAxis !== null) {
            SystemReasoningPanel.svgGroup.append('g')
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
            SystemReasoningPanel.svgGroup.append('g')
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
    adjustAverageTags: function(topGroupValue, bottomGroupValue) {
        let topGroupAverageTagEl = SystemReasoningPanel.svgGroup.select('.top.tag').node();
        let bottomGroupAverageTagEl = SystemReasoningPanel.svgGroup.select('.bottom.tag').node();
        let topGroupAverageTagBBox = topGroupAverageTagEl.getBBox();
        let bottomGroupAverageTagBBox = bottomGroupAverageTagEl.getBBox();
        let leftAverageTagEl = (topGroupValue < bottomGroupValue) ? topGroupAverageTagEl : bottomGroupAverageTagEl;
        let rightAverageTagEl = (topGroupValue < bottomGroupValue) ? bottomGroupAverageTagEl : topGroupAverageTagEl;
        let leftAverageTagBBox = (topGroupValue < bottomGroupValue) ? topGroupAverageTagBBox : bottomGroupAverageTagBBox;
        let rightAverageTagBBox = (topGroupValue < bottomGroupValue) ? bottomGroupAverageTagBBox : topGroupAverageTagBBox;
        let hasOverlapping = leftAverageTagBBox.x + leftAverageTagBBox.width > rightAverageTagBBox.x;

        if (hasOverlapping) {
            let leftAverageTagHasText = !d3.select(leftAverageTagEl).select('text').empty();
            let rightAverageTagHasText = !d3.select(rightAverageTagEl).select('text').empty();

            if (leftAverageTagHasText) {
                let leftAverageTag = d3.select(leftAverageTagEl).select('text')
                    .attr('dx', -2)
                    .style('text-anchor', 'end');
                let leftAverageTagNewBBox = leftAverageTag.node().getBBox();
                let leftAverageTagBackground = d3.select(leftAverageTagEl).select('rect')
                    .attr('x', leftAverageTagNewBBox.x - 3)
                    .attr('y', leftAverageTagNewBBox.y)
                    .attr('width', leftAverageTagNewBBox.width + 6)
                    .attr('height', leftAverageTagNewBBox.height);
            }
            if (rightAverageTagHasText) {
                let rightAverageTag = d3.select(rightAverageTagEl).select('text')
                    .attr('dx', 2)
                    .style('text-anchor', 'start');
                let rightAverageTagNewBBox = rightAverageTag.node().getBBox();
                let rightAverageTagBackground = d3.select(rightAverageTagEl).select('rect')
                    .attr('x', rightAverageTagNewBBox.x - 3)
                    .attr('y', rightAverageTagNewBBox.y)
                    .attr('width', rightAverageTagNewBBox.width + 6)
                    .attr('height', rightAverageTagNewBBox.height);
            }
        }
    },
    adjustXAxisLabels: function(topGroupMean, bottomGroupMean) {
        let allLabels = SystemReasoningPanel.svgGroup.selectAll('.x.axis .tick text').nodes();
        let firstLabelEl = allLabels[0];
        let secondLabelEl = allLabels[1];
        let thirdLabelEl = allLabels[2];
        let fourthLabelEl = allLabels[3];
        let secondLabelText = topGroupMean;
        let thirdLabelText = bottomGroupMean;
        let firstLabelBBox = firstLabelEl.getBoundingClientRect();
        let secondLabelBBox = secondLabelEl.getBoundingClientRect();
        let thirdLabelBBox = thirdLabelEl.getBoundingClientRect();
        let fourthLabelBBox = fourthLabelEl.getBoundingClientRect();

        // highlight the center two
        d3.select(secondLabelEl).style('font-weight', 'bold');
        d3.select(thirdLabelEl).style('font-weight', 'bold');

        // adjust on overlapping
        if (secondLabelText == thirdLabelText) {
            d3.select(thirdLabelEl)
                .attr('class', 'hidden')
                .style('opacity', 0);
        }
        if (secondLabelText != thirdLabelText && thirdLabelBBox.x - (secondLabelBBox.x + secondLabelBBox.width) < 3) {
            d3.select(secondLabelEl)
                .attr('dx', -2)
                .style('text-anchor', 'end');
            d3.select(thirdLabelEl)
                .attr('dx', 2)
                .style('text-anchor', 'start');

            secondLabelBBox = secondLabelEl.getBoundingClientRect();
            thirdLabelBBox = thirdLabelEl.getBoundingClientRect();
        }

        // hide first and last label if needed
        if (secondLabelBBox.x - (firstLabelBBox.x + firstLabelBBox.width) < 3) {
            d3.select(firstLabelEl)
                .attr('class', 'hidden')
                .style('opacity', 0);
        }
        if (fourthLabelBBox.x - (thirdLabelBBox.x + thirdLabelBBox.width) < 3) {
            d3.select(fourthLabelEl)
                .attr('class', 'hidden')
                .style('opacity', 0);
        }
    }
}