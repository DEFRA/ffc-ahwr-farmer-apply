const reporter = require('cucumber-html-reporter');

const options = {
    theme: 'hierarchy',
    jsonFile: 'test/acceptance/cypress/cucumber-report/select-business.cucumber.json',
    output: 'cypress/cucumber-report/cucumber_report.html',
    reportSuiteAsScenarios: true,
    screenshotsDirectory:'cypress/screenshots',
    storeScreenshots:true,
    scenarioTimestamp: true,
    launchReport: true,
    brandTitle:'Vet-Visit Acceptance Tests',
    metadata: {

        "Parallel": "Scenarios"
    }
};

reporter.generate(options);
