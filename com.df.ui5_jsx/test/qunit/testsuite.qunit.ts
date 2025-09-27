export default {
	name: "QUnit TestSuite for com.df.ui5_jsx",
	defaults: {
		ui5: {
			libs: ["sap.ui.core", "com.df.ui5_jsx"],
			theme: "sap_horizon"
		},
		qunit: {
			version: 2,
			reorder: false
		},
		sinon: {
			version: 4,
			qunitBridge: true,
			useFakeTimers: false
		}
	},
	tests: {
		// test file for the Example control
		Example: {
			title: "QUnit Test for Example",
			_alternativeTitle: "QUnit tests: com.df.ui5_jsx.Example"
		}
	}
};
