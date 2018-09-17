const SystemReasoningPanel = {
	margin: { top: 20, left: 35, bottom: 35, right: 20 },
	strokeColour: { top: '#b5a59b', bottom: '#b9b0c4' },
	fillColour: { top: '#e6beac', bottom: '#c7aee6' },

	svgGroup: null,
	tooltipTimer: null,

	init: function() {
		const self = this;

		self.initSvgGroup();
		self.installMouseenter();
		self.installNotClick();
	},
	initSvgGroup: function() {
		const self = this;

		self.svgGroup = d3.select('#system-reasoning-panel .distribution svg')
			.style('cursor', 'pointer');
		self.svgGroup = d3.select('#system-reasoning-panel .distribution svg')
			.append('g')
			.attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')');
	},
	adjustSVGGroupMargin: function(top, left, bottom, right) {
		const self = this;

		self.margin.top = top;
		self.margin.left = left;
		self.margin.bottom = bottom;
		self.margin.right = right;
		self.svgGroup.attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')');
	},
	installMouseenter: function() {
		const self = this;

		$('#system-reasoning-panel')
			.on('mouseenter', mouseenterSystemReasoningPanel);

		function mouseenterSystemReasoningPanel() {
			let hasTopDensityPlot = !d3.select(this).select('.top-distribution').empty();
			let hasBottomDensityPlot = !d3.select(this).select('.bottom-distribution').empty();
			let hasTopHistogram = !d3.select(this).select('.top.bar').empty();
			let hasBottomHistogram = !d3.select(this).select('.bottom.bar').empty();
			let showingDensityPlot = hasTopDensityPlot || hasBottomDensityPlot;
			let showingHistogram = hasTopHistogram || hasBottomHistogram;

			let currentAttribute = $('#system-reasoning-panel').attr('attribute-name');
			let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[currentAttribute] == 'numerical';

			let currentWindowPos = $(this).offset();
        	let currentWindowWidth = $(this).width();
        	let tooltipText = null;

        	if (isCurrentAttributeNumerical && showingDensityPlot)
        		tooltipText = 'Click to show histogram';
        	if (isCurrentAttributeNumerical && showingHistogram)
        		tooltipText = 'Click to show density plot';

        	if (isCurrentAttributeNumerical && (showingDensityPlot || showingHistogram)) {
        		$('#tooltip')
					.attr('data-tooltip', tooltipText)
					.css('top', currentWindowPos.top - 5)
					.css('left', currentWindowPos.left + currentWindowWidth / 2)
					.addClass('show')
					.removeClass('left');

				clearTimeout(self.tooltipTimer);
				self.tooltipTimer = setTimeout(function() {
					$('#tooltip').removeClass('show');
				}, 1500);
        	}
		}
	},
	installNotClick: function() {
		let systemReasoningPanelSelector = '#system-reasoning-panel';
		let resultPanelAttributeNameSelector = '#sidebar .result-panel .answer.content .attribute-list .attribute .name';
		let resultPanelAttributeChartSelector = '#sidebar .result-panel .answer.content .attribute-list .attribute .chart';

		Body.registerNotClickEvent(systemReasoningPanelSelector + ',' + resultPanelAttributeNameSelector + ',' + resultPanelAttributeChartSelector, notClickSystemReasoningPanel);

		function notClickSystemReasoningPanel() {
			SystemReasoningPanel.unstay();
			SystemReasoningPanel.hide();
		}
	},
	installClick: function() {
		const self = this;

		self.svgGroup.on('click', clickSVGGroup);

		function clickSVGGroup() {
			let hasTopDensityPlot = !d3.select(this).select('.top-distribution').empty();
			let hasBottomDensityPlot = !d3.select(this).select('.bottom-distribution').empty();
			let hasTopHistogram = !d3.select(this).select('.top.bar').empty();
			let hasBottomHistogram = !d3.select(this).select('.bottom.bar').empty();
			let showingDensityPlot = hasTopDensityPlot || hasBottomDensityPlot;
			let showingHistogram = hasTopHistogram || hasBottomHistogram;

			if (showingDensityPlot) {
				let attributeName = $('#system-reasoning-panel').attr('attribute-name');
				let topGroupProbDist = OperatorMediator.probDistPairForEachAttribute[attributeName].top;
				let bottomGroupProbDist = OperatorMediator.probDistPairForEachAttribute[attributeName].bottom;
				let numOfObjInTopGroup = OperatorMediator.numberOfObjects.top;
				let numOfObjInBottomGroup = OperatorMediator.numberOfObjects.bottom;
				let topGroupInfo = { probabilityDistribution: topGroupProbDist, numberOfObjects: numOfObjInTopGroup };
				let bottomGroupInfo = { probabilityDistribution: bottomGroupProbDist, numberOfObjects: numOfObjInBottomGroup };

				d3.select(this).selectAll('*').remove();
				SystemReasoningPanelHistogram.draw(attributeName, topGroupInfo, bottomGroupInfo);
				SystemReasoningPanelHistogram.installMouseenter();
			}
			
			if (showingHistogram) {
				let attributeName = $('#system-reasoning-panel').attr('attribute-name');
				let topGroupProbDist = OperatorMediator.probDistPairForEachAttribute[attributeName].top;
				let bottomGroupProbDist = OperatorMediator.probDistPairForEachAttribute[attributeName].bottom;
				let numOfObjInTopGroup = OperatorMediator.numberOfObjects.top;
				let numOfObjInBottomGroup = OperatorMediator.numberOfObjects.bottom;
				let topGroupInfo = { probabilityDistribution: topGroupProbDist, numberOfObjects: numOfObjInTopGroup };
				let bottomGroupInfo = { probabilityDistribution: bottomGroupProbDist, numberOfObjects: numOfObjInBottomGroup };

				d3.select(this).selectAll('*').remove();
				SystemReasoningPanelDensityPlot.draw(attributeName, topGroupInfo, bottomGroupInfo);
			}
		}
	},
	explainAttr: function(attributeName) {
		let isCurrentAttributeNumerical = Database.isCategoricalOrNumerical[attributeName] == 'numerical';
		let topGroupProbDist = OperatorMediator.probDistPairForEachAttribute[attributeName].top;
		let bottomGroupProbDist = OperatorMediator.probDistPairForEachAttribute[attributeName].bottom;
		let numOfObjInTopGroup = OperatorMediator.numberOfObjects.top;
		let numOfObjInBottomGroup = OperatorMediator.numberOfObjects.bottom;
		let topGroupInfo = { probabilityDistribution: topGroupProbDist, numberOfObjects: numOfObjInTopGroup };
		let bottomGroupInfo = { probabilityDistribution: bottomGroupProbDist, numberOfObjects: numOfObjInBottomGroup };

		// render explanations
		SystemReasoningPanel.clear();
		SystemReasoningPanelExplanation.generateForAttr(attributeName);
		SystemReasoningPanelExplanation.show();

		// draw chart
		if (isCurrentAttributeNumerical) {
			SystemReasoningPanel.showDistribution();
			SystemReasoningPanelDensityPlot.draw(attributeName, topGroupInfo, bottomGroupInfo);
			SystemReasoningPanel.installClick(); // remove on show
		}
		if (!isCurrentAttributeNumerical) {
			SystemReasoningPanel.showDistribution();
			SystemReasoningPanelBarChart.draw(attributeName, topGroupInfo, bottomGroupInfo);
			SystemReasoningPanelBarChart.installMouseenter();
		}
	},
	explainGroup: function(type) {
		// render explanations
		SystemReasoningPanel.clear();
		SystemReasoningPanelExplanation.generateForGroup(type);
		SystemReasoningPanelExplanation.show();

		// hide distribution
		SystemReasoningPanel.hideDistribution();
	},
	clear: function() {
		const self = this;

		$('#system-reasoning-panel .text').html('');
		self.svgGroup.selectAll('*').remove();
		$('#system-reasoning-panel .distribution .count').html('');
		$('#system-reasoning-panel .distribution .min').html('');
		$('#system-reasoning-panel .distribution .max').html('');
	},
	stay: function(attributeName) {
		$('#system-reasoning-panel').addClass('stay');
		$('#sidebar .result-panel .answer.content .attribute-list .attribute').removeClass('selected');
		$('#sidebar .result-panel .answer.content .attribute-list .attribute[attribute-name="' + attributeName + '"]').addClass('selected');
	},
	unstay: function() {
		$('#system-reasoning-panel').removeClass('stay');
		$('#sidebar .result-panel .answer.content .attribute-list .attribute').removeClass('selected');
	},
	show: function(top, right, attributeName = null) {
		const self = this;

		// restore height
		$('#system-reasoning-panel .distribution')
			.css('height', systemReasoningPanelDistributionHeight);

		// remove events
		self.svgGroup.on('click', null);

		// show
		$('#system-reasoning-panel')
			.attr('attribute-name', attributeName)
			.css('top', top)
			.css('right', right)
			.css('display', 'block');
	},
	hide: function() {
		$('#system-reasoning-panel').css('display', 'none');
	},
	hideDistribution: function() {
		$('#system-reasoning-panel .distribution').css('display', 'none');
	},
	showDistribution: function() {
		$('#system-reasoning-panel .distribution').css('display', '');
	},
	adjustPosition: function() {
		const self = this;
		let systemReasoningPanelHeight = $('#system-reasoning-panel').height();
		let systemReasoningPanelTop = $('#system-reasoning-panel').offset().top;
		let windowHeight = $(window).height();

		if (systemReasoningPanelTop + systemReasoningPanelHeight > windowHeight)
			$('#system-reasoning-panel').css('top', windowHeight - systemReasoningPanelHeight - 8)
	},
	setHeight: function(height) {
		$('#system-reasoning-panel .distribution')
			.css('height', height);
	},
	adjustHeight: function() {
		const self = this;
		let newSvgGroupHeight = self.svgGroup.node().getBoundingClientRect().height;
		let newPanelHeight = self.margin.top + newSvgGroupHeight + 1;

		$('#system-reasoning-panel .distribution')
			.css('height', newPanelHeight);
	},

	// helpers

	getIndexWithProbOne: function(probabilityDistribution) {
		let indexWithProbOne = -1;

		for (let i = 0; i < probabilityDistribution.length; i++) {
			if (probabilityDistribution[i] == 1) {
				indexWithProbOne = i;
				break;
			}
		}

		return indexWithProbOne;
	}
}