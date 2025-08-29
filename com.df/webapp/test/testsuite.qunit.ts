export default {
	name: "QUnit test suite for the UI5 Application: com.df",
	defaults: {
		page: "ui5://test-resources/com/df/Test.qunit.html?testsuite={suite}&test={name}",
		qunit: {
			version: 2
		},
		sinon: {
			version: 4
		},
		ui5: {
			language: "EN",
			theme: "sap_horizon"
		},
		coverage: {
			only: "com/df/",
			never: "test-resources/com/df/"
		},
		loader: {
			paths: {
				"com/df": "../"
			}
		}
	},
	tests: {
		"unit/unitTests": {
			title: "Unit tests for com.df"
		},
		"integration/opaTests": {
			title: "Integration tests for com.df"
		}
	}
};
