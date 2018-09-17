const DistributionPane = {
	histogramMargin: { top: 10, left: 10, bottom: 10, right: 10 },
	histogramSVGGroup: null,

	init: function() {
		const self = this;

		self.Histogram.init();
		self.AttributeValueList.init();
		self.AttributeValueSearchBox.install();
		self.installClickOutsideBehaviour();
	},
	installClickOutsideBehaviour: function() {
		const self = this;
		let seeDistButtonSelector = '#group-viewer .top-bar .column-index .fa-caret-square-down';
		let distPaneSelector = '#distribution-pane';

		Body.registerNotClickEvent(seeDistButtonSelector + ',' + distPaneSelector, clickOutsideDistPane);

		function clickOutsideDistPane() {
			self.hide();
		}
	},
	show: function(attributeName, topOrBottomViewer, top, left) { // store topOrBottom for checking horizontal scroll
		const self = this;

		self.recordTopOrBottomViewer(topOrBottomViewer);
		self.displayPane(attributeName, top, left);
		self.showContent(attributeName);
	},
	hide: function() {
		$('#group-viewer .top-bar .column-index .fa-caret-square-down')
			.removeClass('clicked')
			.css('color', 'white');
			
		$('#distribution-pane')
			.css('display', 'none');
	},
	recordTopOrBottomViewer: function(topOrBottomViewer) {
		$('#distribution-pane')
			.attr('viewer', topOrBottomViewer);
	},
	displayPane: function(attributeName, top, left) {
		$('#distribution-pane')
			.attr('attribute-name', attributeName)
			.css('display', 'block')
			.css('top', top)
			.css('left', left);
	},
	showContent: function(attributeName) {
		const self = this;
		let isAttributeNumerical = Database.isCategoricalOrNumerical[attributeName] == 'numerical';

		if (isAttributeNumerical) {
			self.Histogram.show();
			self.Histogram.render(attributeName);
		}
		if (!isAttributeNumerical) {
			self.AttributeValueList.show();
			self.AttributeValueList.displayList(attributeName);
			self.AttributeValueSearchBox.clear();
		}
	},
	Histogram: {
		margin: { top: 10, left: 20, bottom: 30, right: 20 },
		width: null,
		height: null,
		SVGGroup: null,

		init: function() {
			const self = DistributionPane;

			self.Histogram.width = distributionPaneWidth - self.Histogram.margin.left - self.Histogram.margin.right;
			self.Histogram.height = distributionPaneNumericalContentHeight - self.Histogram.margin.top - self.Histogram.margin.bottom;
			self.Histogram.SVGGroup = d3.select('#distribution-pane .numerical.content svg')
				.append('g')
				.attr('transform', 'translate(' + self.Histogram.margin.left + ',' + self.Histogram.margin.top + ')');
		},
		show: function() {
			$('#distribution-pane .numerical').css('display', 'block');
			$('#distribution-pane .categorical').css('display', 'none');
		},
		render: function(attributeName) {
			const self = DistributionPane;
			let [ minValue, maxValue, numberOfBins ] = self.Histogram.findMinMaxNumberOfBins(attributeName);
			let probabilityDistObject = self.Histogram.generateProbabilityDistObject(attributeName, minValue, maxValue, numberOfBins);
			let probabilityDistArray = self.Histogram.generateProbabilityDistArray(probabilityDistObject, minValue, maxValue, numberOfBins);

			self.Histogram.clear();
			self.Histogram.draw(probabilityDistArray, numberOfBins);
			self.Histogram.showMinMax(minValue, maxValue);
			self.Histogram.showMaxCount();
			self.Histogram.installMouseoverBarBehaviour();
		},
		clear: function() {
			const self = DistributionPane;

			self.Histogram.SVGGroup.selectAll('*').remove();
		},
		draw: function(probabilityDistArray, numberOfBins) {
			const self = DistributionPane;
			let maxCount = d3.max(probabilityDistArray, function(d) { return d.count; });
			let binIndices = [];

			// generate binIndices
			for (let i = 0; i < numberOfBins; i++)
				binIndices.push(i);

			// scales
			let xScale = d3.scaleBand()
				.domain(binIndices)
				.range([ 0, self.Histogram.width ]);
			let heightScale = d3.scaleLinear()
				.domain([ 0, maxCount ])
				.range([ 0, self.Histogram.height ]);

			// draw
			self.Histogram.SVGGroup.selectAll('.bar')
				.data(probabilityDistArray)
				.enter()
				.append('rect')
				.attr('class', 'bar')
				.attr('x', function(d) { return xScale(d.binIndex); })
				.attr('y', function(d) { return self.Histogram.height - heightScale(d.count); })
				.attr('rx', 3)
				.attr('ry', 3)
				.attr('width', xScale.bandwidth())
				.attr('height', function(d) { return heightScale(d.count); })
				.style('fill', '#a8c6e0')
				.style('stroke', 'white')
				.style('stroke-width', 2);
		},
		showMinMax: function(minValue, maxValue) {
			const self = DistributionPane;

			$('#distribution-pane .numerical.content .min')
				.html('min: ' + minValue)
				.attr('min-value', minValue)
				.css('top', self.Histogram.margin.top + self.Histogram.height + 5)
				.css('left', self.Histogram.margin.left);

			$('#distribution-pane .numerical.content .max')
				.html('max: ' + maxValue)
				.attr('max-value', maxValue)
				.css('top', self.Histogram.margin.top + self.Histogram.height + 5)
				.css('left', self.Histogram.margin.left + self.Histogram.width);
		},
		showMaxCount: function() {
			const self = DistributionPane;
			let contentPosition = $('#distribution-pane .numerical.content').offset();
			let tallestBarDimension = null;
			let tallestLeftPosition = null;
			let tallestTopPosition = null;
			let maxCount = -Infinity;

			self.Histogram.SVGGroup.selectAll('.bar').each(function(d) {
				if (d.count > maxCount) {
					maxCount = d.count;
					tallestBarDimension = this.getBoundingClientRect();
					tallestLeftPosition = tallestBarDimension.left - contentPosition.left;
					tallestTopPosition = tallestBarDimension.top - contentPosition.top;
				}
			});

			$('#distribution-pane .numerical.content .count')
				.html(maxCount)
				.attr('max-count', maxCount)
				.attr('top-pos', tallestTopPosition - 3)
				.attr('left-pos', tallestLeftPosition + tallestBarDimension.width / 2)
				.css('top', tallestTopPosition - 3)
				.css('left', tallestLeftPosition + tallestBarDimension.width / 2);
		},
		installMouseoverBarBehaviour: function() {
			const self = DistributionPane;

			self.Histogram.SVGGroup.selectAll('.bar')
				.on('mouseover', mouseoverBar)
				.on('mouseout', mouseoutBar);

			function mouseoverBar(d) {
				let barDimension = this.getBoundingClientRect();
				let contentPosition = $('#distribution-pane .numerical.content').offset();
				let barLeftPosition = barDimension.left - contentPosition.left;
				let barTopPosition = barDimension.top - contentPosition.top;
				let barRightPosition = barLeftPosition + barDimension.width;
				let barBottomPosition = barTopPosition + barDimension.height;

				d3.select(this)
					.style('fill', '#3874aa');
				$('#distribution-pane .numerical.content .min')
					.html(d.binMinValue)
					.css('transform', 'translateX(-100%)')
					.css('top', barBottomPosition)
					.css('left', barLeftPosition)
					.css('font-size', 13);
				$('#distribution-pane .numerical.content .max')
					.html(d.binMaxValue)
					.css('transform', 'translateX(0%)')
					.css('top', barBottomPosition)
					.css('left', barRightPosition)
					.css('font-size', 13);
				$('#distribution-pane .numerical.content .count')
					.html(d.count)
					.css('top', barTopPosition)
					.css('left', barLeftPosition + barDimension.width / 2)
					.css('font-size', 13);
			}

			function mouseoutBar(d) {
				let minValue = $('#distribution-pane .numerical.content .min').attr('min-value');
				let maxValue = $('#distribution-pane .numerical.content .max').attr('max-value');
				let maxCount = $('#distribution-pane .numerical.content .count').attr('max-count');
				let maxCountTopPos = parseFloat($('#distribution-pane .numerical.content .count').attr('top-pos'));
				let maxCountLeftPos = parseFloat($('#distribution-pane .numerical.content .count').attr('left-pos'));

				self.Histogram.SVGGroup.selectAll('.bar')
					.style('fill', '#a8c6e0');
				$('#distribution-pane .numerical.content .min')
					.html('min: ' + minValue)
					.css('transform', '')
					.css('font-size', '')
					.css('top', self.Histogram.margin.top + self.Histogram.height + 5)
					.css('left', self.Histogram.margin.left);
				$('#distribution-pane .numerical.content .max')
					.html('max: ' + maxValue)
					.css('transform', '')
					.css('font-size', '')
					.css('top', self.Histogram.margin.top + self.Histogram.height + 5)
					.css('left', self.Histogram.margin.left + self.Histogram.width);
				$('#distribution-pane .numerical.content .count')
					.html(maxCount)
					.css('font-size', '')
					.css('top', maxCountTopPos)
					.css('left', maxCountLeftPos);
			}
		},
		findMinMaxNumberOfBins: function(attributeName) {
			let topOrBottom = $('#distribution-pane').attr('viewer');
			let includedOrExcludedObjectsString = (topOrBottom == 'top') ? 'includedObjects' : 'excludedObjects';
			let includedOrExcludedObjects = GroupEditor.currentGroupObject[includedOrExcludedObjectsString];
			let maxValue = -Infinity, minValue = Infinity;
			let numberOfBins = Math.ceil(Math.sqrt(includedOrExcludedObjects.length));

			for (let i = 0; i < includedOrExcludedObjects.length; i++) {
				let currentAttributeValue = includedOrExcludedObjects[i].data[attributeName];
				let currentValueMissing = (currentAttributeValue === '');

				if (!currentValueMissing && currentAttributeValue > maxValue)
					maxValue = currentAttributeValue;
				if (!currentValueMissing && currentAttributeValue < minValue)
					minValue = currentAttributeValue;
			}
			
			return [ minValue, maxValue, numberOfBins ];
		},
		generateProbabilityDistObject: function(attributeName, minValue, maxValue, numberOfBins) {
			let topOrBottom = $('#distribution-pane').attr('viewer');
			let includedOrExcludedObjectsString = (topOrBottom == 'top') ? 'includedObjects' : 'excludedObjects';
			let includedOrExcludedObjects = GroupEditor.currentGroupObject[includedOrExcludedObjectsString];
			let binSize = (maxValue - minValue) / numberOfBins;
			let probabilityDistObject = {}; // { binIndex: count }

			// init probabilityDistObject
			for (let i = 0; i < numberOfBins; i++)
				probabilityDistObject[i] = 0;

			// count
			for (let i = 0; i < includedOrExcludedObjects.length; i++) {
				let currentAttributeValue = includedOrExcludedObjects[i].data[attributeName];
				let currentBinIndex = Math.floor((currentAttributeValue - minValue) / binSize);
				let currentValueMissing = (currentAttributeValue === '');

				if (currentBinIndex >= numberOfBins)
					currentBinIndex = numberOfBins - 1;

				if (!currentValueMissing)
					probabilityDistObject[currentBinIndex]++;
			}

			// save
			return probabilityDistObject;
		},
		generateProbabilityDistArray: function(probabilityDistObject, minValue, maxValue, numberOfBins) {
			let binSize = (maxValue - minValue) / numberOfBins;
			const probabilityDistArray = [];

			for (let i = 0; i < numberOfBins; i++) {
				let currentBinIndex = i;
				let currentBinMinValue = parseFloat(Math.round((minValue + binSize * currentBinIndex) * 100) / 100).toFixed(2);
				let currentBinMaxValue = parseFloat(Math.round((minValue + binSize * currentBinIndex + binSize) * 100) / 100).toFixed(2);
				let count = probabilityDistObject[currentBinIndex];

				probabilityDistArray.push({
					binIndex: currentBinIndex,
					binMinValue: currentBinMinValue,
					binMaxValue: currentBinMaxValue,
					count: count
				});
			}

			return probabilityDistArray;
		}
	},
	AttributeValueList: {
		clusterizeObject: null,

		init: function() {
			const self = DistributionPane;

			self.AttributeValueList.clusterizeObject = new Clusterize({
				rows: [],
				scrollId: 'distribution-value-scroll-area',
				contentId: 'distribution-value-content-area',
				no_data_text: ''
			});
		},
		show: function() {
			$('#distribution-pane .categorical').css('display', 'block');
			$('#distribution-pane .numerical').css('display', 'none');
		},
		displayList: function(attributeName) {
			const self = DistributionPane;
			let attributeValueCount = self.AttributeValueList.generateAttributeValueCount(attributeName);
			let attributeValueHTMLArray = self.AttributeValueList.generateClusterizeHTMLArray(attributeValueCount);

			self.AttributeValueList.clusterizeObject.clear();
			self.AttributeValueList.clusterizeObject.update(attributeValueHTMLArray);
		},
		generateAttributeValueCount: function(attributeName) {
			const attributeList = Database.metadata[attributeName].uniqueValues;
			const attributeValueCount = {};
			let topOrBottom = $('#distribution-pane').attr('viewer');
			let includedOrExcludedObjectsString = (topOrBottom == 'top') ? 'includedObjects' : 'excludedObjects';
			let includedOrExcludedObjects = GroupEditor.currentGroupObject[includedOrExcludedObjectsString];

			// init attributeValueCount
			for (let i = 0; i < attributeList.length; i++)
				attributeValueCount[attributeList[i]] = 0;

			// count
			for (let i = 0; i < includedOrExcludedObjects.length; i++) {
				let currentAttributeValue = includedOrExcludedObjects[i].data[attributeName];
				let currentValueMissing = (currentAttributeValue === '');

				if (!currentValueMissing)
					attributeValueCount[currentAttributeValue]++;
			}

			return attributeValueCount;
		},
		generateClusterizeHTMLArray: function(attributeValueCount, keyword = null) {
			const clusterizeHTMLArray = [];
			const sortedAttributeValueList = Object.keys(attributeValueCount);
			let filteredAttributeValueList = [];

			// create a sorted list
			sortedAttributeValueList.sort(function(a, b) {
				return attributeValueCount[b] - attributeValueCount[a];
			});

			// create a filtered list
			if (keyword !== null) {
				let lowerCaseKeyword = keyword.toLowerCase();

				for (let i = 0; i < sortedAttributeValueList.length; i++) {
					let currentAttributeValue = sortedAttributeValueList[i];
					let lowerCaseCurrentAttributeValue = currentAttributeValue.toLowerCase();
					let keywordFound = (lowerCaseCurrentAttributeValue.indexOf(lowerCaseKeyword) != -1);

					if (keywordFound)
						filteredAttributeValueList.push(currentAttributeValue);
				}
			}

			if (keyword === null)
				filteredAttributeValueList = sortedAttributeValueList;

			// generate HTML list for clusterize
			for (let i = 0; i < filteredAttributeValueList.length; i++) {
				let currentAttributeValue = filteredAttributeValueList[i];
				let count = attributeValueCount[currentAttributeValue];
				let rowHTML = '<div class="attribute-value">' + currentAttributeValue + ' (' + count + ' records)' + '</div>';
				clusterizeHTMLArray.push(rowHTML);
			}

			return clusterizeHTMLArray;
		}
	},
	AttributeValueSearchBox: {
		clear: function() {
			$('#distribution-pane .categorical.search-box input').val('');
		},
		install: function() {
			const self = DistributionPane;

			$('#distribution-pane .categorical.search-box input')
				.on('input', inputSearchBox);

			function inputSearchBox() {
				let keyword = $(this).val();
				let attributeName = $('#distribution-pane').attr('attribute-name');
				let attributeValueCount = self.AttributeValueList.generateAttributeValueCount(attributeName);
				let attributeValueHTMLArray = self.AttributeValueList.generateClusterizeHTMLArray(attributeValueCount, keyword);

				self.AttributeValueList.clusterizeObject.clear();
				self.AttributeValueList.clusterizeObject.update(attributeValueHTMLArray);
			}
		}
	}
}