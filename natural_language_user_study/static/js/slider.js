function Slider(selector, parentSelector, sliderRangeEditorSelector, id) {
	this.el = null;
	this.densityPlot = { group: null, width: null, height: null, data: null };
	this.selector = selector;
	this.parentSelector = parentSelector;
	this.sliderRangeEditorSelector = sliderRangeEditorSelector;
	this.id = id; // no #
}

Slider.prototype.show = function() {}

Slider.prototype.initSlider = initSlider;
Slider.prototype.initHandleValues = initSliderHandleValues;
Slider.prototype.initDensityPlot = initSliderDensityPlot;

Slider.prototype.installClickHandleText = installClickSliderHandleText;
Slider.prototype.installDragSlider = function() {};

Slider.prototype.clearDensityPlot = clearSliderDensityPlot;
Slider.prototype.generateDensityPlotData = generateSliderDensityPlotData;
Slider.prototype.drawDensityPlot = drawSliderDensityPlot;

Slider.prototype.updateMinMax = updateSliderMinMax;
Slider.prototype.updateStep = updateSliderStep;
Slider.prototype.updateValues = updateSliderValues;
Slider.prototype.updateHandles = updateSliderHandles;
Slider.prototype.updateMinMaxText = updateSliderMinMaxText;

//-- functions --//

function initSlider() {
	const self = this;

	self.el = $(self.selector)
		.bootstrapSlider({
			tooltip: 'hide',
			min: 0,
			max: 10,
			value: [2, 8]
		});
}

function initSliderHandleValues() {
	const self = this;
	var minHandleLeft = $(self.selector + ' .min-slider-handle').position().left;
	var minHandleValue = self.el.bootstrapSlider('getValue')[0];
	var maxHandleLeft = $(self.selector + ' .max-slider-handle').position().left;
	var maxHandleValue = self.el.bootstrapSlider('getValue')[1];

	// add the lines and the values
	$(self.selector).prepend('<div class="min-handle-line"></div>');
	$(self.selector).prepend('<div class="max-handle-line"></div>');
	$(self.selector).prepend('<span class="min-handle-text"></span>');
	$(self.selector).prepend('<span class="max-handle-text"></span>');

	// init position
	$(self.parentSelector + ' .min-handle-line').css('left', minHandleLeft);
	$(self.parentSelector + ' .max-handle-line').css('left', maxHandleLeft);
	$(self.parentSelector + ' .min-handle-text').css('left', minHandleLeft);
	$(self.parentSelector + ' .max-handle-text').css('left', maxHandleLeft);

	// init values
	$(self.parentSelector + ' .max-handle-text').html(maxHandleValue);
	$(self.parentSelector + ' .min-handle-text').html(minHandleValue);
}

function initSliderDensityPlot() {
	const self = this;
	let sliderPosition = $(self.parentSelector + ' div#' + self.id).position();
	let sliderWidth = $(self.parentSelector + ' div#' + self.id).width();
	let sliderTrackPosition = $(self.selector + ' .slider-track').position();
	let sliderTrackHeight = $(self.selector + ' .slider-track').height();
	let svgWidth = sliderWidth;
	let svgLeft = sliderPosition.left + sliderTrackPosition.left;
	let svgTop = sliderPosition.top + sliderTrackPosition.top - filterMenuFilterRangeContentSVGHeight - sliderTrackHeight / 2 + 1;

	$(self.parentSelector + ' svg')
		.css('left', svgLeft)
		.css('top', svgTop)
		.css('width', svgWidth);

	self.densityPlot.group = d3.select(self.parentSelector + ' svg g');
	self.densityPlot.width = svgWidth;
	self.densityPlot.height = filterMenuFilterRangeContentSVGHeight;
}

function installClickSliderHandleText() {
	const self = this;
	let minHandleTextSelector = self.parentSelector + ' .min-handle-text';
	let maxHandleTextSelector = self.parentSelector + ' .max-handle-text';
	let handleTextSelector = minHandleTextSelector + ', ' + maxHandleTextSelector;
	let slideRangeEditorSelector = self.sliderRangeEditorSelector;

	Body.registerClickEvent(handleTextSelector, clickHandleText, slideRangeEditorSelector);
	Body.registerNotClickEvent(slideRangeEditorSelector, updateSlider);

	function clickHandleText(event) {
		var clickedLowerText = $(event.target).hasClass('min-handle-text');
		var handleTextBbox = event.target.getBoundingClientRect();
		var handleTextValue = clickedLowerText ? self.el.bootstrapSlider('getValue')[0] : self.el.bootstrapSlider('getValue')[1];
		var whichTextClicked = clickedLowerText ? 'lower' : 'upper';

		$(slideRangeEditorSelector)
			.attr('which-text-clicked', whichTextClicked)
			.attr('original-value', handleTextValue)
			.css('display', 'block')
			.css('min-width', handleTextBbox.width)
			.css('width', handleTextBbox.width)
			.css('height', handleTextBbox.height)
			.css('top', handleTextBbox.top)
			.css('left', handleTextBbox.left)
			.val(handleTextValue);

		$(slideRangeEditorSelector)
			.select();
	}

	function updateSlider(event) {
		if ($(slideRangeEditorSelector).css('display') == 'none')
			return;

		var whichTextChanged = $(slideRangeEditorSelector).attr('which-text-clicked');
		var originalValue = $(slideRangeEditorSelector).attr('original-value');
		var currentValue = Math.round($(slideRangeEditorSelector).val() * 100) / 100;
		var isInputEmpty = currentValue == '';

		if (originalValue != currentValue && !isInputEmpty) {
			var value1 = null, value2 = null, newRange = null;

			if (whichTextChanged == 'lower') {
				value1 = self.el.bootstrapSlider('getValue')[1];
				value2 = parseFloat(currentValue);
				newRange = [ Math.min(value1, value2), Math.max(value1, value2) ];
			}
			if (whichTextChanged == 'upper') {
				value1 = self.el.bootstrapSlider('getValue')[0];
				value2 = parseFloat(currentValue);
				newRange = [ Math.min(value1, value2), Math.max(value1, value2) ];
			}

			self.updateValues(newRange);
			self.updateHandles();
		}

		$(slideRangeEditorSelector)
			.css('display', 'none');
	}
}

function updateSliderMinMax(min, max) {
	var self = this;

	self.el.bootstrapSlider('setAttribute', 'min', min);
	self.el.bootstrapSlider('setAttribute', 'max', max);
}

function updateSliderStep(step) {
	var self = this;

	self.el.bootstrapSlider('setAttribute', 'step', step);
}

function updateSliderValues(range) {
	var self = this;

	self.el.bootstrapSlider('setValue', range);
}

function updateSliderHandles() {
	const self = this;
	var minHandleLeft = $(self.selector + ' .min-slider-handle').position().left;
	var minHandleValue = self.el.bootstrapSlider('getValue')[0];
	var maxHandleLeft = $(self.selector + ' .max-slider-handle').position().left;
	var maxHandleValue = self.el.bootstrapSlider('getValue')[1];

	$(self.parentSelector + ' .min-handle-line').css('left', minHandleLeft);
	$(self.parentSelector + ' .max-handle-line').css('left', maxHandleLeft);
	$(self.parentSelector + ' .min-handle-text').css('left', minHandleLeft);
	$(self.parentSelector + ' .max-handle-text').css('left', maxHandleLeft);

	$(self.parentSelector + ' .min-handle-text').html(minHandleValue);
	$(self.parentSelector + ' .max-handle-text').html(maxHandleValue);
}

function updateSliderMinMaxText() {
	const self = this;
	let minValue = self.el.bootstrapSlider('getAttribute', 'min');
	let maxValue = self.el.bootstrapSlider('getAttribute', 'max');

	$(self.parentSelector + ' .min-text').html(minValue);
	$(self.parentSelector + ' .max-text').html(maxValue);
}


function clearSliderDensityPlot() {
	const self = this;

	self.densityPlot.data = null;
	self.densityPlot.group.selectAll('*').remove();
}

function generateSliderDensityPlotData(attributeName) {
	const self = this;
	let densityPlotData = [];
	let minValue = Database.metadata[attributeName].minValue;
	let maxValue = Database.metadata[attributeName].maxValue;
	let binNumber = Database.metadata[attributeName].approxBinNumber;
	let binSize = (maxValue - minValue) / binNumber;
	let counts = {};

	// init counts
	for (let i = 0; i < binNumber; i++)
		counts[i] = 0;

	// count
	Database.forEachNonMissingValue(attributeName, function(currentValue) {
		let binIndex = Math.floor((currentValue - minValue) / binSize);

		if (binIndex >= binNumber)
			binIndex = binNumber - 1;

		counts[binIndex]++;
	});

	// store data
	for (let i = 0; i < binNumber; i++) {
		let currentBinCount = counts[i];

		densityPlotData.push(currentBinCount);
	}

	self.densityPlot.data = densityPlotData;
}

function drawSliderDensityPlot(attributeName, metadataInput = null) {
	const self = this;
	let metadata = (metadataInput === null) ? Database.metadata : metadataInput;
	let binNumber = metadata[attributeName].approxBinNumber;
	let maxCount = d3.max(self.densityPlot.data);

	let xScale = d3.scaleLinear()
		.domain([ 0, binNumber - 1 ])
		.range([ 0, self.densityPlot.width ]);
	let heightScale = d3.scaleLinear()
		.domain([ 0, maxCount ])
		.range([ 0, self.densityPlot.height ]);
	let area = d3.area()
  		.x(function(d, i) { return xScale(i); })
  		.y0(function(d) { return self.densityPlot.height - heightScale(d); })
  		.y1(self.densityPlot.height)
  		.curve(d3.curveBasis);

	self.densityPlot.group.append('path')
		.attr('d', area(self.densityPlot.data))
		.style('fill', 'steelblue')
		.style('opacity', 0.3);
}