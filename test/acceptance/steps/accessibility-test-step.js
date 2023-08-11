const { Given, When, Then } = require('@wdio/cucumber-framework')
const CommonActions = require('../pages/common-actions')
const commonPage = new CommonActions()


Then(/^the accessibility should return no violation$/, async function () {
  await commonPage.checkAccessibility()
});