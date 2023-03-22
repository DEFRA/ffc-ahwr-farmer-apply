const reporter = require("cucumber-html-reporter");

const options = {
  theme: "bootstrap",
  brandTitle: "Vet Visit Acceptance Tests",
  jsonDir: "reporter/json/",
  output: "reporter/cucumber_report.html",
  screenshotsDirectory: "reporter/screenshots/",
  storeScreenshots: true,
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  ignoreBadJsonFile: true,
  launchReport: false,
  metadata: {
    Parallel: "Scenarios",
  },
};

reporter.generate(options);