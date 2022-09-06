import Pages from '../page'

class FarmerCattleEligibility extends Pages {
  get yesRadioButton () { return browser.$('#eligibleSpecies') }
  get noRadioButton () { return browser.$('#eligibleSpecies-2') }
  get headerTitle () { return browser.$('.govuk-fieldset__heading') }

  open () {
    super.open('')
    browser.pause(3000)
  }

  async selectCattleYes () {
    await (await this.yesRadioButton).scrollIntoView()
    await (await this.yesRadioButton).click()
  }

  async selectCattleNo () {
    await (await this.noRadioButton).click()
  }

  async verifyHeaderTitle () {
    await this.headerTitle.getText()
  }
}

module.exports = new FarmerCattleEligibility()
