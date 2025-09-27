module.exports = function (config) {
	require("./karma-ci.conf")(config);
	config.set({
		reporters: ["progress", "coverage"],
		preprocessors: {
			"src/**/*.ts": ["ui5-transpile"],
			"test/**/*.ts": ["ui5-transpile"]
		},
		proxies: {
			'/resources/com/df/ui5_jsx/': '/base/src/',
			'/test-resources/com/df/ui5_jsx/': '/base/test/',
		},
		coverageReporter: {
			dir: "coverage",
			reporters: [
				{ type: "html", subdir: "report-html" },
				{ type: "cobertura", subdir: ".", file: "cobertura.txt" },
				{ type: "lcovonly", subdir: ".", file: "report-lcovonly.txt" },
				{ type: "text-summary" }
			]
		}
	});
};
