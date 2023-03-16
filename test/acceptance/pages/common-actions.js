const $ = require('webdriverio/build/commands/browser/$')
const { expect } = require('chai')

class CommonActions {
async open (path) {
const url = process.env.TEST_ENVIRONMENT_ROOT_URL + path
await browser.url(url)
}

async clickOn (element) {
const locator = browser.$(element)
await locator.click()
}

async sendKey (element, text) {
    const locator = browser.$(element)
    await locator.sendKeys(text)
}

async elementToContainText (element, text) {
const locator = await $(element)
await locator.waitForExist({timeout:5000})
expect(locator).to.include(text)
}
}

module.exports = CommonActions