const { expect } = require('chai')

class CommonActions {
  async open (path) {
    const url = process.env.TEST_ENVIRONMENT_ROOT_URL + path
    // console.log('url', url)
    await browser.url(url)
  }

  async clickOn (element) {
    const locator = browser.$(element)
    await locator.click()
  }

  async sendKey (element, text) {
    const locator = browser.$(element)
    await locator.setValue(text)
  }

  async elementToContainText (element, text) {
    const locator = await browser.$(element)
    expect(await locator.getText()).to.include(text)
  }

  async elementTextShouldBe (element, text) {
    const locator = await browser.$(element)
    expect(await locator.getText()).to.equal(text)
  }
}
module.exports = CommonActions
