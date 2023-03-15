const { Given, When, Then } = require('@wdio/cucumber-framework')
const LandingPage = require('../pages/example-page')
const landingPage = new LandingPage()

Given(/^the user is on the (.*) page$/, async function (page) {
    console.log('inside of given step')
    await landingPage.getHomePage(page)
})

When(/^user apply with (.*)$/, async function (credential) {
    console.log(`inside of AND step with creentials ${credential}`)
    await landingPage.inputCredentials(credential)
})

When(/^user start the application$/, async function () {
    console.log('inside of when')
    await landingPage.clickOnStartButton()
})

When(/^user clicks to continue$/, async function () {
    console.log('inside of click to continue')
    await landingPage.clickOnContinueButton()
})

Then(/^an email error is displayed$/, async function () {
    console.log('inside of THEN')
    await landingPage.verifyErrorMessage()
})

Then(/^magic link is sent to user email$/, async function () {
    await landingPage.magicLinkMessage()
})