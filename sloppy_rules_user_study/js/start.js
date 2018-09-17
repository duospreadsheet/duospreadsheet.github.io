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

const sidebarShelvesShelfWidth = 'calc(100% - 16px)';
const sidebarShelvesBottomAttributeShelfHeight = 50;
const sidebarShelvesTopShelfHeight = 28

const sidebarShelvesShelfContainerWidth = 'calc(100% - 50px)';
const sidebarShelvesBottomAttributeShelfContainerHeight = 'calc(100% - 6px)';
const sidebarShelvesTopShelfContainerHeight = 22;

const sideBarShelfContainerHeight = 8 + sidebarShelvesTopShelfHeight + 8 + sidebarShelvesBottomAttributeShelfHeight + 8 + sidebarShelvesBottomAttributeShelfHeight + 8 + 1;
const sidebarResultPanelHeight = 'calc(100% - ' + sideBarShelfContainerHeight + 'px)';
const sidebarResultPanelQuestionHeaderWidth = 'calc(100% - 20px)';
const sidebarResultPanelQuestionContentWidth = 'calc(100% - 20px)'; // 20 is the padding
const sidebarResultPanelAnswerHeaderWidth = 'calc(100% - 20px)';
const sidebarResultPanelAnswerContentWidth = 'calc(100% - 20px)'; // 20 is the padding

// group editor
const groupEditorWidth = sidebarWidth;
const groupEditorHeaderHeight = 20;
const groupEditorFooterHeight = 30;

const groupEditorNameEditorContentHeight = 18;
const groupEditorNameEditorContentInputWidth = 'calc(100% - 25px)';
const groupEditorNameEditorContentInputHeight = 'calc(100% - 2px)';

const groupEditorBaseRuleEditorContentHeight = 50;
const groupEditorBaseRuleEditorContentContainerWidth = 'calc(100% - 20px)';
const groupEditorBaseRuleEditorContentContainerHeight = 'calc(100% - 2px)';

const groupEditorInclusionRuleEditorContentHeight = 50;
const groupEditorInclusionRuleEditorContentContainerWidth = 'calc(100% - 20px)';
const groupEditorInclusionRuleEditorContentContainerHeight = 'calc(100% - 2px)';

const groupEditorExclusionRuleEditorContentHeight = 50;
const groupEditorExclusionRuleEditorContentContainerWidth = 'calc(100% - 20px)';
const groupEditorExclusionRuleEditorContentContainerHeight = 'calc(100% - 2px)';

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

// distribution pane
const distributionPaneWidth = 230;
const distributionPaneHeaderHeight = 30;

const distributionPaneCategoricalContentHeight = 150;
const distributionPaneCategoricalContentContainerWidth = 'calc(100% - 20px)';
const distributionPaneCategoricalContentContainerHeight = 150;
const distributionPaneCategoricalSearchBoxHeight = 20;
const distributionPaneCategoricalSearchBoxInputHeight = 'calc(100% - 2px - 4px)';
const distributionPaneCategoricalSearchBoxInputWidth = 'calc(100% - 40px - 1px)';

const distributionPaneNumericalContentHeight = 150;

// group viewer
const groupViewerWidth = tableCollapsedWidth;
const groupViewerViewerHeight = "calc(50% - 4.5px)";

const groupViewerViewerHeaderHeight = 30;

const groupViewerViewerContentHeight = "calc(100% - 30px)";
const groupViewerViewerContentTopBarHeight = 26; // 25 + 1 (border)
const groupViewerViewerContentBottomContainerHeight = 'calc(100% - 29px)';
const groupViewerViewerContentBottomContainerLeftBarWidth = 31; // including the border
const groupViewerViewerContentBottomContainerTableScrollableAreaWidth = 'calc(100% - 31px)';

// system reasoning panel
const systemReasoningPanelWidth = 230;
const systemReasoningPanelDistributionHeight = 230;
const systemReasoningPanelTextWidth = 'calc(100% - 20px)';

// group creator
const groupCreatorWidth = sidebarWidth;

const groupCreatorRuleEditorInputBoxWidth = 'calc(100% - 16px - 16px - 6px)';

const groupCreatorMenuWidth = 'calc(100% - 16px - 6px)';
const groupCreatorMenuHeaderHeight = 25;
const groupCreatorMenuContentHeight = 70;

const groupCreatorMenuAttributeContentContainerWidth = 'calc(100% - 20px)';
const groupCreatorMenuAttributeContentContainerHeight = 70;
const groupCreatorMenuAttributeContentContainerDummyHeight = 'calc(100% - 6px)';

const groupCreatorMenuValueContentContainerWidth = 'calc(100% - 20px)';
const groupCreatorMenuValueContentContainerHeight = 70;

const groupCreatorMenuRangeContentSliderWidth = 'calc(100% - 70px)';
const groupCreatorMenuRangeContentSVGHeight = 20;

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
	$('#sidebar .shelves')
		.css('width', full); // height depends on content
	$('#sidebar .result-panel')
		.css('width', full)
		.css('height', sidebarResultPanelHeight);
	$('#sidebar .result-panel .question.header')
		.css('width', sidebarResultPanelQuestionHeaderWidth);
	$('#sidebar .result-panel .question.content')
		.css('width', sidebarResultPanelQuestionContentWidth);
	$('#sidebar .result-panel .answer.header')
		.css('width', sidebarResultPanelAnswerHeaderWidth);
	$('#sidebar .result-panel .answer.content')
		.css('width', sidebarResultPanelAnswerContentWidth);

	$('#sidebar .shelves .bottom-group.shelf, #sidebar .shelves .attributes.shelf')
		.css('width', sidebarShelvesShelfWidth)
		.css('height', sidebarShelvesBottomAttributeShelfHeight);
	$('#sidebar .shelves .bottom-group.shelf .container, #sidebar .shelves .attributes.shelf .container')
		.css('width', sidebarShelvesShelfContainerWidth)
		.css('height', sidebarShelvesBottomAttributeShelfContainerHeight);
	
	$('#sidebar .shelves .top-group.shelf')
		.css('width', sidebarShelvesShelfWidth)
		.css('height', sidebarShelvesTopShelfHeight);
	$('#sidebar .shelves .top-group.shelf .container')
		.css('height', sidebarShelvesTopShelfContainerHeight)
		.css('width', sidebarShelvesShelfContainerWidth);

	// group editor
	$('#group-editor')
		.css('width', groupEditorWidth)
		.css('height', full)
		.css('margin-right', margin);
	$('#group-editor .header')
		.css('width', full)
		.css('height', groupEditorHeaderHeight);
	$('#group-editor .content .container .dummy')
		.css('width', full)
		.css('height', full);

	$('#group-editor .name-editor.content')
		.css('width', full)
		.css('height', groupEditorNameEditorContentHeight);
	$('#group-editor .name-editor.content input')
		.css('width', groupEditorNameEditorContentInputWidth)
		.css('height', groupEditorNameEditorContentInputHeight);

	$('#group-editor .base-rule-editor.content')
		.css('width', full)
		.css('height', groupEditorBaseRuleEditorContentHeight);
	$('#group-editor .base-rule-editor.content .container')
		.css('width', groupEditorBaseRuleEditorContentContainerWidth)
		.css('height', groupEditorBaseRuleEditorContentContainerHeight);

	$('#group-editor .inclusion-rule-editor.content')
		.css('width', full)
		.css('height', groupEditorInclusionRuleEditorContentHeight);
	$('#group-editor .inclusion-rule-editor.content .container')
		.css('width', groupEditorInclusionRuleEditorContentContainerWidth)
		.css('height', groupEditorInclusionRuleEditorContentContainerHeight);

	$('#group-editor .exclusion-rule-editor.content')
		.css('width', full)
		.css('height', groupEditorExclusionRuleEditorContentHeight);
	$('#group-editor .exclusion-rule-editor.content .container')
		.css('width', groupEditorExclusionRuleEditorContentContainerWidth)
		.css('height', groupEditorExclusionRuleEditorContentContainerHeight);

	$('#group-editor .footer')
		.css('width', full)
		.css('height', groupEditorFooterHeight);

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

	// distribution pane
	$('#distribution-pane')
		.css('width', distributionPaneWidth);
	$('#distribution-pane .header')
		.css('height', distributionPaneHeaderHeight);

	$('#distribution-pane .categorical.content')
		.css('width', full)
		.css('height', distributionPaneCategoricalContentHeight);
	$('#distribution-pane .categorical.content .container')
		.css('width', distributionPaneCategoricalContentContainerWidth)
		.css('height', distributionPaneCategoricalContentContainerHeight);
	$('#distribution-pane .categorical.search-box')
		.css('width', full)
		.css('height', distributionPaneCategoricalSearchBoxHeight);
	$('#distribution-pane .categorical.search-box input')
		.css('width', distributionPaneCategoricalSearchBoxInputWidth)
		.css('height', distributionPaneCategoricalSearchBoxInputHeight);

	$('#distribution-pane .numerical.content')
		.css('width', full)
		.css('height', distributionPaneNumericalContentHeight);
	$('#distribution-pane .numerical.content svg')
		.css('width', full)
		.css('height', full);

	// group viewer
	$('#group-viewer')
		.css('height', full)
		.css('width', groupViewerWidth)
		.css('margin-right', margin + 2);
	$('#group-viewer .viewer')
		.css('height', groupViewerViewerHeight)
		.css('width', full);
	$('#group-viewer .top.viewer')
		.css('margin-bottom', margin - 1);

	$('#group-viewer .viewer .header')
		.css('height', groupViewerViewerHeaderHeight)
		.css('width', full);

	$('#group-viewer .viewer .content')
		.css('height', groupViewerViewerContentHeight)
		.css('width', full);
	$('#group-viewer .viewer .content .top-bar')
		.css('width', full)
		.css('height', groupViewerViewerContentTopBarHeight);

	$('#group-viewer .viewer .content .bottom-container')
		.css('width', full)
		.css('height', groupViewerViewerContentBottomContainerHeight);
	$('#group-viewer .viewer .content .bottom-container .left-bar')
		.css('width', groupViewerViewerContentBottomContainerLeftBarWidth)
		.css('height', full);
	$('#group-viewer .viewer .content .bottom-container .left-bar .left-bar-scrollable-area')
		.css('width', full)
		.css('height', full);
	$('#group-viewer .viewer .content .bottom-container .table-scrollable-area')
		.css('width', groupViewerViewerContentBottomContainerTableScrollableAreaWidth)
		.css('height', full);

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

	// group creator
	$('#group-creator')
		.css('width', groupCreatorWidth);
	$('#group-creator .rule-editor .input-box')
		.css('width', groupCreatorRuleEditorInputBoxWidth);
	$('#group-creator .menu')
		.css('width', groupCreatorMenuWidth);
	$('#group-creator .menu .header')
		.css('width', full)
		.css('height', groupCreatorMenuHeaderHeight);
	$('#group-creator .menu .content')
		.css('width', full)
		.css('height', groupCreatorMenuContentHeight);

	$('#group-creator .menu .attribute.content .container')
		.css('width', groupCreatorMenuAttributeContentContainerWidth)
		.css('height', groupCreatorMenuAttributeContentContainerHeight);
	$('#group-creator .menu .attribute.content .container .dummy')
		.css('width', full)
		.css('height', groupCreatorMenuAttributeContentContainerDummyHeight);

	$('#group-creator .menu .value.content .container')
		.css('width', groupCreatorMenuValueContentContainerWidth)
		.css('height', groupCreatorMenuValueContentContainerHeight);

	$('#group-creator .menu .range.content #group-creator-slider')
		.css('width', groupCreatorMenuRangeContentSliderWidth);
	$('#group-creator .menu .range.content svg')
		.css('height', groupCreatorMenuRangeContentSVGHeight);

	Table.init();
	Data.loadFromPath('csv/oneToOneSetOne.csv', 'oneToOneSetOne');
	ShelfGroup.init();
	GroupEditor.init();
	FilterMenu.init();
	Shelf.init();
	GroupViewer.init();
	MenuBar.init();
	DistributionPane.init();
	SystemReasoningPanel.init();
	GroupCreator.init();
	Body.init();
});

Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0; 
}

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}
