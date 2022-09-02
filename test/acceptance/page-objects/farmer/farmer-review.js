import Pages from '../page'

class FarmerReview extends Pages {
  get detailCorrect(){ return browser.$("//legend[contains(.,'Are your details correct?')]")}
  get yesRadioBtn(){ return browser.$('#confirmCheckDetails')}
  get noRadioBtn(){ return browser.$('#confirmCheckDetails-2')}
  get whichReviewBtn(){return browser.$('#whichReview')}
  get whichReviewBtn2(){return browser.$('#whichReview-2')}
  get whichReviewBtn3(){return browser.$('#whichReview-3')}
  get whichReviewBtn4(){return browser.$('#whichReview-4')}
  get eligibleSpeciesYes(){return browser.$('#eligibleSpecies')}
  get eligibleSpeciesNo(){return browser.$('#eligibleSpecies-2')}

  open (token,email) {
    super.open("/verify-login?token="+token+"&email="+email)
    browser.pause(30000)
  }
  async selectYes () {
    await (await this.yesRadioBtn).click()
  }
  async selectNo () {
    await (await this.noRadioBtn).click()
  }
  async selectWhichReviewBtn () {
    await (await this.whichReviewBtn).click()
  }
  async selectWhichReviewBtn2 () {
    await (await this.whichReviewBtn2).click()
  }
  async selectWhichReviewBtn3 () {
    await (await this.whichReviewBtn3).click()
  }
  async selectWhichReviewBtn4 () {
    await (await this.whichReviewBtn4).click()
  }


  async selectEligibleSpeciesYes () {
    await (await this.eligibleSpeciesYes).click()
  }
  async selectEligibleSpeciesNo () {
    await (await this.eligibleSpeciesNo).click()
  }
}
module.exports = new FarmerReview()
