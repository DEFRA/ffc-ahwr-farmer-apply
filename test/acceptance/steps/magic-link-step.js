const getMagicLink = require('../support/get-magic-link')
const { Given, When } = require('@cucumber/cucumber')
const LandingPage = require('../pages/landing-page')
const landingPage = new LandingPage()
//const CommonActions = require('./common-actions')
//const GetMagicLink = new getMagicLink()


Given('user navigate to the magic link containing the businessEmail', async function () {
       await landingPage.magicLinkUrl()

});
When(/^user check the page url$/, async function () {
        expect(await browser.getUrl()).to.contain('ibrahim.adekanmi@kainos.com')
});
//When(/^user check the business page title$/, async function (text) {
 //     await landingPage.elementToContainText()
//});