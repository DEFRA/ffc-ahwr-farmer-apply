import Pages from '../page'

class WhichReview extends Pages {
  get beefRadioButton () { return browser.$('#whichReview') }
  get dairyRadioButton () { return browser.$('#whichReview-2') }
  get sheepRadioButton () { return browser.$('#whichReview-3') }
  get pigRadioButton () { return browser.$('#whichReview-4') }
  get headerTitle () { return browser.$('.govuk-fieldset__heading') }

  open () {
    super.open('')
    browser.pause(3000)
  }

  async selectBeef () {
    await (await this.beefRadioButton).scrollIntoView();
    await browser.pause(3000);
    await (await this.beefRadioButton).click()
    await browser.pause(3000);
  }

  async selectDairy () {
    await (await this.dairyRadioButton).scrollIntoView();
    await browser.pause(3000);
    await (await this.dairyRadioButton).click()
    await browser.pause(3000);
  }

  async selectSheep () {
    await (await this.sheepRadioButton).scrollIntoView();
    await browser.pause(3000);
    await (await this.sheepRadioButton).click()
    await browser.pause(3000);
  }

  async selectPig () {
    await (await this.pigRadioButton).scrollIntoView();
    await browser.pause(3000);
    await (await this.pigRadioButton).click()
    await browser.pause(3000);
  }

  async verifyHeaderTitle () {
    await this.headerTitle.getText()
  }


}

module.exports =  new WhichReview()

