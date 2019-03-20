const FilterBar = {
	filters: [], // { attributeName, category / lowerValue, upperValue }

	addFilter: function(attributeName, attributeValueObject) {
		const self = this;
		const newFilterObject = {};
		let alreadyAdded = false;
		let isCurrentAttrNumerical = ('lowerValue' in attributeValueObject);

		if (isCurrentAttrNumerical) {
			newFilterObject.attributeName = attributeName;
			newFilterObject.lowerValue = attributeValueObject.lowerValue;
			newFilterObject.upperValue = attributeValueObject.upperValue;

			for (let i = 0; i < self.filters.length; i++) {
				let currentFilter = self.filters[i];

				if (currentFilter.attributeName === newFilterObject.attributeName &&
					currentFilter.attributeName === newFilterObject.lowerValue && 
					currentFilter.attributeName === newFilterObject.upperValue) {
					alreadyAdded = true;
					break;
				}
			}
		}

		if (!isCurrentAttrNumerical) {
			newFilterObject.attributeName = attributeName;
			newFilterObject.category = attributeValueObject.category;

			for (let i = 0; i < self.filters.length; i++) {
				let currentFilter = self.filters[i];

				if (currentFilter.attributeName === newFilterObject.attributeName &&
					currentFilter.category === newFilterObject.category) {
					alreadyAdded = true;
					break;
				}
			}
		}

		if (!alreadyAdded) {
			self.filters.push(newFilterObject);
			return true;
		}

		if (alreadyAdded)
			return false;
	},
	updateTable: function() {
		const self = this;

		Table.filterRowData(self.filters);
		Table.createRowHTML();
		Table.createIndexColumnHTML();
		Table.renderTable();
		Table.renderIndexColumn();
	},
	updateCount: function() {
		const self = this;
		let currentNumberOfRows = Table.rowData.length;
		let filterHeaderText = 'Filters (' + currentNumberOfRows + ')';

		$('#table .filter-bar .header').css('display', 'none');
		$('#table .filter-bar .header').html(filterHeaderText);
		$('#table .filter-bar .header').fadeTo(400, 1);
	},
	drawFilters: function() {
		const self = this;

		// clear filters
		$('#table .filter-bar .content').empty();

		// append filters
		for (let i = 0; i < self.filters.length; i++) {
			let currentFilter = self.filters[i];
			let isCurrentAttrNumerical = ('lowerValue' in currentFilter);
			let currentFilterText = self.generateFilterText(currentFilter);
			let tagHTML = '<div class="filter" filter-index="' + i + '">' + 
								currentFilterText + 
								'<span class="fas fa-times"></span>' + 
						  '</div>';

			if (isCurrentAttrNumerical) {
				$('#table .filter-bar .content')
					.append(tagHTML);
				$('#table .filter-bar .content .filter:last-child')
					.addClass('rule-element')
					.attr('attribute-name', currentFilter.attributeName)
					.attr('lower-value', currentFilter.lowerValue)
					.attr('upper-value', currentFilter.upperValue);
				d3.select('#table .filter-bar .content .filter:last-child')
					.datum(currentFilter);
			}

			if (!isCurrentAttrNumerical) {
				$('#table .filter-bar .content')
					.append(tagHTML);
				$('#table .filter-bar .content .filter:last-child')
					.addClass('rule-element')
					.attr('attribute-name', currentFilter.attributeName)
					.attr('category', currentFilter.category);
				d3.select('#table .filter-bar .content .filter:last-child')
					.datum(currentFilter);
			}
		}

		// animate
		$('#table .filter-bar .content .filter:last-child').css('display', 'none');
		$('#table .filter-bar .content .filter:last-child').fadeTo(400, 1);
	},
	generateFilterText: function(filter) {
		let isCurrentAttrNumerical = ('lowerValue' in filter);
		let filterText = '';

		if (isCurrentAttrNumerical)
			filterText = filter.lowerValue + '<=' + filter.attributeName + '<=' + filter.upperValue;
		if (!isCurrentAttrNumerical)
			filterText = filter.attributeName + '=' + filter.category;

		return filterText;
	},
	installClickRemoveButtonBehaviour: function() {
		const self = this;

		$('#table .filter-bar .content .filter .fa-times').on('click', clickCloseButton);

		function clickCloseButton() {
			let currentFilterIndex = d3.select(this.parentNode).attr('filter-index');

			// remove filter first
			self.filters.splice(currentFilterIndex, 1);
			self.drawFilters();
			Table.showLoader();

			// heavy computation
			setTimeout(function() {
				self.updateTable();
				self.updateCount();
				self.installClickRemoveButtonBehaviour();
				Table.hideLoader();
			}, 10);
		}
	}
}