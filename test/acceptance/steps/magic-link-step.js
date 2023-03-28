const { Given, When } = require('@cucumber/cucumber')
const LandingPage = require('../pages/landing-page')
const landingPage = new LandingPage()

Given('user navigate to the magic link containing the businessEmail', async function () {
  await landingPage.magicLinkUrl()
})
When(/^user check the page url$/, async function () {
  expect(await browser.getUrl()).to.contain('ibrahim.adekanmi@kainos.com')
})
