const margin = 8;
const full = '100%';

const row1Width = 'calc(100% - 18px)';
const row1Height = 30;
const row2Width = 'calc(100% - 18px)';
const row2Height = 'calc(100% - 58px)';

// table
const tableNormalWidth = 'calc(100% - 260px)';
const tableCollapsedWidth = 'calc(100% - 260px - 260px)';
const tableTopBarHeight = 26; // 25 + 1 (border)
const tableBottomContainerHeight = 'calc(100% - 54px)';
const tableBottomContainerLeftBarWidth = 31; // including the border
const tableBottomContainerTableScrollableAreaWidth = 'calc(100% - 31px)';

const tableFilterBarHeight = 25;
const tableFilterBarHeaderWidth = 80;
const tableFilterBarContentWidth = 'calc(100% - 81px)';

// sidebar
const sidebarWidth = 250;

const sideBarQuestionInputBoxInputBoxWidth = 'calc(100% - 50px)';

const sidebarResultPanelQuestionHeaderWidth = 'calc(100% - 20px)';
const sidebarResultPanelQuestionContentWidth = 'calc(100% - 20px)'; // 20 is the padding
const sidebarResultPanelAnswerHeaderWidth = 'calc(100% - 20px)';
const sidebarResultPanelAnswerContentWidth = 'calc(100% - 20px)'; // 20 is the padding

// filter menu
const filterMenuWidth = 230;
const filterMenuFooterHeight = 55;

const filterMenuSortHeaderHeight = 30;
const filterMenuSortContentHeight = 50;

const filterMenuFilterHeaderHeight = 25;
const filterMenuFilterValueContentHeight = 70;
const filterMenuFilterValueContentContainerWidth = 'calc(100% - 20px)';
const filterMenuFilterValueContentContainerHeight = 70;
const filterMenuFilterValueSearchBoxHeight = 20;
const filterMenuFilterValueSearchBoxInputHeight = 'calc(100% - 2px - 4px)';
const filterMenuFilterValueSearchBoxInputWidth = 'calc(100% - 40px - 1px)';

const filterMenuFilterRangeContentHeight = 70;
const filterMenuFilterRangeContentFilterSliderWidth = 'calc(100% - 70px)';
const filterMenuFilterRangeContentSVGHeight = 20;

// system reasoning panel
const systemReasoningPanelWidth = 230;
const systemReasoningPanelDistributionHeight = 230;
const systemReasoningPanelTextWidth = 'calc(100% - 20px)';

$(function() {
	$('body, html')
		.css('width', full)
		.css('height', full);

	// outer containers
	$('#row1')
		.css('width', row1Width)
		.css('height', row1Height)
		.css('margin-bottom', margin + 2);
	$('#row2')
		.css('width', row2Width)
		.css('height', row2Height);

	// menu bar
	$('#menu-bar')
		.css('width', full)
		.css('height', full);

	// table
	$('#table')
		.css('width', tableNormalWidth)
		.css('height', full)
		.css('margin-right', margin);
	$('#table .top-bar')
		.css('width', full)
		.css('height', tableTopBarHeight);
	$('#table .bottom-container')
		.css('width', full)
		.css('height', tableBottomContainerHeight);
	$('#table .bottom-container .left-bar')
		.css('width', tableBottomContainerLeftBarWidth)
		.css('height', full);
	$('#table .bottom-container .left-bar #left-bar-scrollable-area')
		.css('width', full)
		.css('height', full);
	$('#table .bottom-container #table-scrollable-area')
		.css('width', tableBottomContainerTableScrollableAreaWidth)
		.css('height', full);

	$('#table .filter-bar')
		.css('width', full)
		.css('height', tableFilterBarHeight);
	$('#table .filter-bar .header')
		.css('width', tableFilterBarHeaderWidth)
		.css('height', full);
	$('#table .filter-bar .content')
		.css('width', tableFilterBarContentWidth)
		.css('height', full);

	// sidebar
	$('#sidebar')
		.css('width', sidebarWidth)
		.css('height', full);

	$('#sidebar .question-input-box')
		.css('width', full);
	$('#sidebar .question-input-box .input-box')
		.css('width', sideBarQuestionInputBoxInputBoxWidth);

	$('#sidebar .result-panel')
		.css('width', full);
	$('#sidebar .result-panel .question.header')
		.css('width', sidebarResultPanelQuestionHeaderWidth);
	$('#sidebar .result-panel .question.content')
		.css('width', sidebarResultPanelQuestionContentWidth);
	$('#sidebar .result-panel .answer.header')
		.css('width', sidebarResultPanelAnswerHeaderWidth);
	$('#sidebar .result-panel .answer.content')
		.css('width', sidebarResultPanelAnswerContentWidth);

	// filter menu
	$('#filter-menu')
		.css('width', filterMenuWidth);
	$('#filter-menu .footer')
		.css('width', full)
		.css('height', filterMenuFooterHeight);

	$('#filter-menu .sort.header')
		.css('height', filterMenuSortHeaderHeight);
	$('#filter-menu .filter.header')
		.css('height', filterMenuFilterHeaderHeight);

	$('#filter-menu .filter.value.content')
		.css('width', full)
		.css('height', filterMenuFilterValueContentHeight);
	$('#filter-menu .filter.value.content .container')
		.css('width', filterMenuFilterValueContentContainerWidth)
		.css('height', filterMenuFilterValueContentContainerHeight);

	$('#filter-menu .filter.value.search-box')
		.css('width', full)
		.css('height', filterMenuFilterValueSearchBoxHeight);
	$('#filter-menu .filter.value.search-box input')
		.css('width', filterMenuFilterValueSearchBoxInputWidth)
		.css('height', filterMenuFilterValueSearchBoxInputHeight);

	$('#filter-menu .filter.range.content')
		.css('width', full)
		.css('height', filterMenuFilterRangeContentHeight);
	$('#filter-menu .filter.range.content #filter-slider')
		.css('width', filterMenuFilterRangeContentFilterSliderWidth);
	$('#filter-menu .filter.range.content svg')
		.css('height', filterMenuFilterRangeContentSVGHeight);

	// system reasoning panel
	$('#system-reasoning-panel')
		.css('width', systemReasoningPanelWidth);
	$('#system-reasoning-panel .text')
		.css('width', systemReasoningPanelTextWidth);
	$('#system-reasoning-panel .distribution')
		.css('height', systemReasoningPanelDistributionHeight)
		.css('width', full);
	$('#system-reasoning-panel .distribution svg')
		.css('width', full)
		.css('height', full);

	Table.init();
	Data.loadFromPath('csv/oneToOneSetOne.csv', 'oneToOneSetOne');
	FilterMenu.init();
	MenuBar.init();
	ResultPanel.init();
	QuestionInputBox.init();
	QuestionInputBoxAutocomplete.init();
	SystemReasoningPanel.init();
	Body.init();
});

Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0; 
}