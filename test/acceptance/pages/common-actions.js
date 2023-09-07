require('webdriverio/build/commands/browser/$')
const { expect } = require('chai')
require('constants')
require('dotenv').config({ path: `.env.${process.env.ENV}` })
const { AxeBuilder } = require('@axe-core/webdriverio')
const axeSource = require('axe-core').source;
const fs = require('fs')
const { remote } = require('webdriverio');
let url= "";
class CommonActions {
  async open (path) {
   url = process.env.TEST_ENVIRONMENT_ROOT_URL + path
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

  async getPageTitle (expectedTitle) {
    const actualTitle = await browser.getTitle()
    expect(actualTitle).to.be.equal(expectedTitle)
  }

  async urlContain (expectedUrl) {
    const actualUrl = await browser.getUrl()
    expect(actualUrl).to.include(expectedUrl)
  }
  async isElementExist (element) {
    const locator = await browser.$(element)
    return locator.isExisting()
  }
  
  async checkAccessibility () {

        const results = await new AxeBuilder({ client:browser }).analyze();
        //console.log(results);
    expect (results.violations.length).to.be.greaterThan(0)
    try {
      fs.mkdirSync('./accessibility-report', { recursive: true });
      for (let i = 0; i < results.violations.length; i++) {
        fs.writeFileSync(`./accessibility-report/accessibility-violation-${i+1}.json` ,JSON.stringify(results.violations[i]))
      }
      fs.writeFileSync('./accessibility-report/accessibility-pass.json', JSON.stringify(results.passes))
    } catch (e) {
      console.log("*********************************>>>>>>>>>>>>> "+e)
    }
   
  }

}

module.exports = CommonActions
// Create an instance of CommonActions
