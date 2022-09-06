const { Given, When, Then } = require('@wdio/cucumber-framework')

const LandingPage = require('../page-objects/landing-page')
const FarmerApply = require('../page-objects/farmer/farmer-apply')
const FarmerLogin = require('../page-objects/farmer/farmer-login')
const FarmerOrgReview = require('../page-objects/farmer/farmer-org-review')
const whichReview = require('../page-objects/farmer/farmer-which-review')
const FarmerCattleEligibility = require('../page-objects/farmer/farmer-cattle-eligibility')
const CheckAnswer = require('../page-objects/check-answer')
const TermsPage = require('../page-objects/terms-page')
const DeclarationPage = require('../page-objects/declaration')
const pages = {
  formApply: FarmerApply,
  landing: LandingPage
}

Given(/^I am on the (\w+) page$/, async (page) => {
  await pages[page].open()
})
Given('farmer clicks on email link {string} {string}', async (token, email) => {
  await FarmerOrgReview.open(token, email)
  await browser.pause(5000)
  expect(await FarmerOrgReview.orgReviewQuestion.getText()).to.equals('Check your details')
})
Then('I click on farmer Apply', async () => {
  await LandingPage.gotoFarmerApply()
})
Then('I click on startNow', async () => {
  await FarmerApply.open()
  await FarmerApply.clickStartNow()
})

When('I enter my valid {string}', async function (email) {
  await FarmerLogin.enterEmail(email)
  await FarmerLogin.clickSignin()
  await browser.pause(5000)
  const elem = await browser.$('#email')
  const elText = await elem.getText()
  expect(elText).to.equals(email)
})

When('I select yes my details are correct on farmer review page', async () => {
  await FarmerOrgReview.selectYes()
  await FarmerOrgReview.clickContinue()
})
Then('I select beef cattle on the livestock review page', async () => {
  await whichReview.selectBeef()
  await whichReview.clickContinue()
  await browser.pause(2000)
})
When('I select yes option from farmer eligibility', async () => {
  await FarmerCattleEligibility.selectCattleYes()
  await FarmerCattleEligibility.clickContinue()
  await browser.pause(2000)
})
When('I select confirm from check your answers', async () => {
  await CheckAnswer.clickContinue()
})
Then('I check the terms and condition checkbox and click submit application', async () => {
  await TermsPage.selectAgreeRadioOption()
  await TermsPage.submit()
  await browser.pause(5000)
  expect(await DeclarationPage.applicationSuccessful.getText()).to.equals('Application successful')
})

Given('I go back to start page', async () => {
  await DeclarationPage.backToStart()
})
Then('I click startNow', async () => {
  await FarmerApply.clickStartNow()
})
Then('I select dairy cattle on the livestock review page', async () => {
  await whichReview.selectDairy()
  await whichReview.clickContinue()
  await browser.pause(2000)
})
Then('I select sheep cattle on the livestock review page', async () => {
  await whichReview.selectSheep()
  await whichReview.clickContinue()
  await browser.pause(2000)
})
Then('I select pig cattle on the livestock review page', async () => {
  await whichReview.selectPig()
  await whichReview.clickContinue()
  await browser.pause(2000)
})

When('I enter my invalid {string}', async (email) => {
  await FarmerLogin.enterEmail(email)
  await FarmerLogin.clickSignin()
  await browser.pause(5000)
})
When('I should see an error {string}', async (email) => {
  const errorText = 'No user found with email address "' + email + '"'
  const actualText = await FarmerLogin.errorField.getText()
  expect(errorText).to.equals(actualText)
})
