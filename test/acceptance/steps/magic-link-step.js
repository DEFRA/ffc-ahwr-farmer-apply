const getMagicLink = require('../support/get-magic-link')
const { Given } = require('@cucumber/cucumber')
//const CommonActions = require('./common-actions')
//const GetMagicLink = new getMagicLink()


Given('user navigate to the magic link containing the businessEmail', async function () {
  const magicLink = await getMagicLink('ibrahim.adekanmi@kainos.com')
  await browser.url(magicLink)
});