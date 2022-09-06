import Pages from '../page'

class FarmerApply extends Pages {
  get startNow () { return browser.$('//a[@role=\'button\']') }
  get title () { return browser.$('//h1[@class=\'govuk-heading-l\'][contains(.,\'Apply for an annual health and welfare review\')]') }

  open () {
    return super.open('/')
  }

  async clickStartNow () {
    await this.startNow.click()
  }

  async istTitleExist () {
    return await this.title.isDisplayed()
  }
}

module.exports = new FarmerApply()
