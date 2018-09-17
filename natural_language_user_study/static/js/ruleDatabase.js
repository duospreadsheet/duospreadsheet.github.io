const RuleDatabase = {
	'oneToOnePractice': {
		'Q1': {
			'top': {
				'baseRules': [ 'Origin=USA' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': {
				'baseRules': [ 'Origin=Japan', '50<=Horsepower<=230' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'attribute': [ 'Acceleration' ]
		},
		'Q2': {
			'top': {
				'baseRules': [ 'Origin=Japan' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': {
				'baseRules': [ 'Origin=USA' ],
				'inclusionRules': [ 'Origin=Europe' ],
				'exclusionRules': []
			},
			'attribute': []
		},
		'Q3': {
			'top': {
				'baseRules': [ '4000<=Weight<=5140' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': {
				'baseRules': [ '1613<=Weight<=2000' ],
				'inclusionRules': [],
				'exclusionRules': [ 'Name=Buick Skylark 320' ]
			},
			'attribute': []
		}
	},
	'oneToOneSetOne': {
		'Q1': {
			'top': {
				'baseRules': [ 'Region=New England' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': {
				'baseRules': [ 'Region=Southeast' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'attribute': [ 'Average Cost' ]
		},
		'Q2': {
			'top': {
				'baseRules': [ 'Control=Private', '16277.49<=Average Family Income<=35000' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': {
				'baseRules': [ 'Control=Public', '90000<=Average Family Income<=134101.78' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'attribute': [ 'Average Faculty Salary' ]
		},
		'Q3': {
			'top': {
				'baseRules': [ 'Locale=Large City', '0.8<=Admission Rate<=1' ],
				'inclusionRules': [],
				'exclusionRules': [ 'Control=Private' ]
			},
			'bottom': {
				'baseRules': [ 'Locale=Small City', '0.8<=Admission Rate<=1' ],
				'inclusionRules': [],
				'exclusionRules': [ 'Control=Private' ]
			},
			'attribute': [ 'Expenditure Per Student', 'Average Cost' ]
		},
		'Q4': {
			'top': {
				'baseRules': [ 'Control=Private', 'Region=New England' ],
				'inclusionRules': [ '0.1423<=% Full-time Faculty<=0.5' ],
				'exclusionRules': [ 'Name=Albany State University' ]
			},
			'bottom': {
				'baseRules': [ 'Control=Public', 'Region=Southeast' ],
				'inclusionRules': [ '0.8<=% Full-time Faculty<=1' ],
				'exclusionRules': [ 'Name=Georgia Institute of Technology' ]
			},
			'attribute': [ 'Undergrad Population', 'Average Age of Entry' ]
		}
	},
	'oneToOneSetTwo': {
		'Q1': {
			'top': {
				'baseRules': [ 'Locale=Remote Rural' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': {
				'baseRules': [ 'Locale=Distant Rural' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'attribute': [ 'Completion Rate' ]
		},
		'Q2': {
			'top': {
				'baseRules': [ 'Region=Great Lakes', '23<=Average Age of Entry<=34.06999969' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': {
				'baseRules': [ 'Region=Far West', '23<=Average Age of Entry<=34.06999969' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'attribute': [ 'Expenditure Per Student' ]
		},
		'Q3': {
			'top': {
				'baseRules': [ 'Control=Private', '0.1119<=Completion Rate<=0.5' ],
				'inclusionRules': [],
				'exclusionRules': [ 'Region=Outlying Areas' ]
			},
			'bottom': {
				'baseRules': [ 'Control=Public', '0.1119<=Completion Rate<=0.5' ],
				'inclusionRules': [],
				'exclusionRules': [ 'Region=Outlying Areas' ]
			},
			'attribute': [ '% Full-time Faculty', 'Poverty Rate' ]
		},
		'Q4': {
			'top': {
				'baseRules': [ 'Region=Southeast', 'Locale=Large City' ],
				'inclusionRules': [ '0.2<=% Part-time Undergrads<=0.8799' ],
				'exclusionRules': [ 'Name=Georgia State University' ]
			},
			'bottom': {
				'baseRules': [ 'Region=Far West', 'Locale=Small City' ],
				'inclusionRules': [ '0.0003<=% Part-time Undergrads<=0.2' ],
				'exclusionRules': [ 'Name=Oregon State University' ]
			},
			'attribute': [ 'Median Family Income', 'Poverty Rate' ]
		}
	},
	'oneToManyPractice': {
		'Q1': {
			'top': {
				'baseRules': [ 'Origin=USA' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': [{
				'baseRules': [ 'Brand=Volkswagen', '1613<=Weight<=2000' ],
				'inclusionRules': [],
				'exclusionRules': []
			}, {
				'baseRules': [ 'Brand=Audi' ],
				'inclusionRules': [],
				'exclusionRules': []
			}],
			'attribute': [ 'Horsepower' ]
		},
		'Q2': {
			'top': {
				'baseRules': [ 'Origin=Japan' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': [{
				'baseRules': [ 'Origin=USA' ],
				'inclusionRules': [],
				'exclusionRules': [ '2000<=Weight<=5140' ]
			}, {
				'baseRules': [ 'Origin=Europe' ],
				'inclusionRules': [],
				'exclusionRules': []
			}],
			'attribute': []
		},
		'Q3': {
			'top': {
				'baseRules': [ '1613<=Weight<=2000' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': [{
				'baseRules': [ 'Origin=USA' ],
				'inclusionRules': [ 'Brand=Toyota' ],
				'exclusionRules': []
			}, {
				'baseRules': [ 'Origin=Europe' ],
				'inclusionRules': [],
				'exclusionRules': []
			}],
			'attribute': []
		}
	},
	'oneToManySetOne': {
		'Q1': {
			'top': {
				'baseRules': [ 'Region=Southeast' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': [{
				'baseRules': [ 'Locale=Large City' ],
				'inclusionRules': [],
				'exclusionRules': []
			}, {
				'baseRules': [ 'Locale=Small City' ],
				'inclusionRules': [],
				'exclusionRules': []
			}],
			'attribute': []
		},
		'Q2': {
			'top': {
				'baseRules': [ 'Locale=Fringe Rural' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': [{
				'baseRules': [ 'Region=Far West', '0.8<=Admission Rate<=1' ],
				'inclusionRules': [],
				'exclusionRules': []
			}, {
				'baseRules': [ 'Region=Great Plains', '0.8<=Admission Rate<=1' ],
				'inclusionRules': [],
				'exclusionRules': []
			}],
			'attribute': []
		},
		'Q3': {
			'top': {
				'baseRules': [ '0.2<=% Part-time Undergrads<=0.8799' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': [{
				'baseRules': [ 'Region=Great Lakes', 'Locale=Large City' ],
				'inclusionRules': [],
				'exclusionRules': [ '0.1119<=Completion Rate<=0.7' ]
			}, {
				'baseRules': [ 'Region=Southeast', 'Locale=Large City' ],
				'inclusionRules': [],
				'exclusionRules': [ '0.1119<=Completion Rate<=0.7' ]
			}],
			'attribute': [ 'Average Cost' ]
		},
		'Q4': {
			'top': {
				'baseRules': [ '12591<=Median Family Income<=35000' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': [{
				'baseRules': [ 'Control=Private', 'Region=New England' ],
				'inclusionRules': [ '0.1423<=% Full-time Faculty<=0.5' ],
				'exclusionRules': [ 'Name=Albany State University' ]
			}, {
				'baseRules': [ 'Control=Public', 'Region=Southwest' ],
				'inclusionRules': [ '0.8<=% Full-time Faculty<=1' ],
				'exclusionRules': [ 'Name=Georgia Institute of Technology' ]
			}],
			'attribute': [ 'Expenditure Per Student' ]
		}
	},
	'oneToManySetTwo': {
		'Q1': {
			'top': {
				'baseRules': [ 'Control=Private' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': [{
				'baseRules': [ 'Region=Southeast' ],
				'inclusionRules': [],
				'exclusionRules': []
			}, {
				'baseRules': [ 'Region=New England' ],
				'inclusionRules': [],
				'exclusionRules': []
			}],
			'attribute': []
		},
		'Q2': {
			'top': {
				'baseRules': [ 'Region=Outlying Areas' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': [{
				'baseRules': [ 'Locale=Large Suburb', '0.4263<=Retention Rate<=0.7' ],
				'inclusionRules': [],
				'exclusionRules': []
			}, {
				'baseRules': [ 'Locale=Mid-size City', '0.4263<=Retention Rate<=0.7' ],
				'inclusionRules': [],
				'exclusionRules': []
			}],
			'attribute': []
		},
		'Q3': {
			'top': {
				'baseRules': [ '0.1423<=% Full-time Faculty<=0.4' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': [{
				'baseRules': [ 'Control=Private', 'Locale=Remote Town' ],
				'inclusionRules': [],
				'exclusionRules': [ '0.0569<=Admission Rate<=0.8' ]
			}, {
				'baseRules': [ 'Control=Public', 'Locale=Remote Town' ],
				'inclusionRules': [],
				'exclusionRules': [ '0.0569<=Admission Rate<=0.8' ]
			}],
			'attribute': [ 'Poverty Rate' ]
		},
		'Q4': {
			'top': {
				'baseRules': [ '25<=Average Age of Entry<=34.06999969' ],
				'inclusionRules': [],
				'exclusionRules': []
			},
			'bottom': [{
				'baseRules': [ 'Region=Southeast', 'Locale=Large City' ],
				'inclusionRules': [ '0.2<=% Part-time Undergrads<=0.8799' ],
				'exclusionRules': [ 'Name=Georgia State University' ]
			}, {
				'baseRules': [ 'Region=Far West', 'Locale=Small City' ],
				'inclusionRules': [ '0.0003<=% Part-time Undergrads<=0.2' ],
				'exclusionRules': [ 'Name=Oregon State University' ]
			}],
			'attribute': [ 'Average Faculty Salary' ]
		}
	}
}