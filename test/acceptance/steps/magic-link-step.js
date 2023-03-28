const { Given, Then } = require('@cucumber/cucumber')
const LandingPage = require('../pages/landing-page')
const landingPage = new LandingPage()

Given(/^user navigate to the magic link containing the businessEmail$/, async function () {
  await landingPage.magicLinkUrl()
})
Then(/^url should contain (.*)$/, async function (email) {
  expect(await browser.getUrl()).to.contain(email)
})
