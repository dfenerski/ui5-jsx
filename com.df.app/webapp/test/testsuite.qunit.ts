export default {
	name: "QUnit test suite for the UI5 Application: com.df.app",
	defaults: {
		page: "ui5://test-resources/com/df/app/Test.qunit.html?testsuite={suite}&test={name}",
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
			only: "com/df/app/",
			never: "test-resources/com/df/app/"
		},
		loader: {
			paths: {
				"com/df/app": "../"
			}
		}
	},
	tests: {
		"unit/unitTests": {
			title: "Unit tests for com.df.app"
		},
		"integration/opaTests": {
			title: "Integration tests for com.df.app"
		}
	}
};
