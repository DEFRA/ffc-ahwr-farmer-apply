const { Given, When, Then } = require('@wdio/cucumber-framework')
const LandingPage = require('../pages/landing-page')
const landingPage = new LandingPage()

Given(/^the user is on the (.*) page$/, async function (page) {
  await landingPage.getHomePage(page)

})
When(/^user start the application$/, async function () {
  await landingPage.clickOnStartButton()
})
When(/^user apply with (.*)$/, async function (credential) {
  await landingPage.inputCredentials(credential)
  await landingPage.clickOnContinueButton()
})

Then(/^an email error is displayed$/, async function () {
  await landingPage.verifyErrorMessage()
})
Then(/^magic link is sent to user email$/, async function () {
  await landingPage.magicLinkMessage()
})