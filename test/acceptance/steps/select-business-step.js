const { Given, When, Then } = require('@wdio/cucumber-framework')
const SelectBusinessPage = require('../pages/select-business-page')
const selectBusinessPage = new SelectBusinessPage()
const CommonActions = require('../pages/common-actions')
const commonPage = new CommonActions()

Given(/^the user is on the (.*) page$/, async function (page) {
  await selectBusinessPage.getHomePage(page)


})
When(/^start the application$/, async function () {
     
    await selectBusinessPage.clickOnStartButton()
    
     
    await selectBusinessPage.clickOnStartButton()
    
});
When(/^user login with (.*) business crn and password\(for DefraId\)$/, async function (business) {
  await selectBusinessPage.signInWithDefraId(business)
});
When(/^make the agreement status to withdrawn$/, async function () {
  await selectBusinessPage.updateWithdrawStatus()
});

When(/^running accessbility tests$/, async function () {
  await commonPage.checkAccessibility()
})
When(/^select the (.*) for application$/, async function (businessName) {
  await selectBusinessPage.clickOnBusiness(businessName)
});
When(/^click on continue button$/, async function () {
  await selectBusinessPage.clickOnContinue()
});
// org-review
When(/^user check the business details$/, async function () {
  await selectBusinessPage.singleUserBusinessDetail()
})
When(/^user confirm the org-review page$/, async function () {
  await selectBusinessPage.checkFarmerDetails()
})
When(/^user agreed the business details is correct$/, async function () {
  await selectBusinessPage.farmerAcceptDetails()
})
Then(/^user continue to next page$/, async function () {
  await selectBusinessPage.proceedWithApplication()
})
|Then(/^Accept the Cookies$/, async function () {
  await selectBusinessPage.acceptCookies()
})
|Then(/^Accept the Cookies$/, async function () {
  await selectBusinessPage.acceptCookies()
})
// SELECT LIVESTOCK
When(/^user is on the livestock page$/, async function () {
  await selectBusinessPage.livestockPage()
})
When(/^user check if livestock are listed$/, async function () {
  await selectBusinessPage.livestockList()
})
When(/^user choose (.*) cattle for review$/, async function (LiveStockName) {
  await selectBusinessPage.liveStockReview(LiveStockName)
})
Then(/^User continue the application$/, async function () {
  await selectBusinessPage.continueTheApplication()
})
// ANIMAL ELIGIBILITY
When(/^user check the minimum number of livestock required to qualify for the review$/, async function () {
  await selectBusinessPage.minimumRequirement()
})
When(/^user confirm to meet the requirement$/, async function () {
  await selectBusinessPage.accurateLivestockNumber()
})
When(/^the user continue the application$/, async function () {
  await selectBusinessPage.next()
})
Then(/^user check the answer$/, async function () {
  await selectBusinessPage.checkAnswerToBeAccurate()
  await selectBusinessPage.goToDeclaration()
})
// DECLARATION PAGE
When(/^user is on the declaration page$/, async function () {
  await selectBusinessPage.declarationUrl()
})
When(/^user view the page title$/, async function () {
  await selectBusinessPage.agreementReview()
})
When(/^user read through the full terms and conditions$/, async function () {
  await selectBusinessPage.conditionTab()
})
When(/^user accept the terms and conditions$/, async function () {
  await selectBusinessPage.termsAndConditionTitle()
  await selectBusinessPage.agreeToTerms()
})
Then(/^user (.*) the application$/, async function (type) {
  await selectBusinessPage.termsCheckBox()
  await selectBusinessPage.applicationCompleted(type)
})
Then(/^user (.*) the application without accepting terms$/, async function (type){
  await selectBusinessPage.applicationCompleted(type)
})
Then(/^user should see successful message$/, async function () {
  await selectBusinessPage.successfulMessage()
})
Then(/^accept the terms and condition$/,async function (){
  await selectBusinessPage.termsCheckBox()
})
//Exception

When(/^validate the error message in the Header$/, async function () {
  await selectBusinessPage.validateExceptionHeader()
})
When(/^validate exception error message for (.*)$/, async function (typeOfException) {
  await selectBusinessPage.exceptionErrorMessage(typeOfException)
})
When(/^validate call charges screen$/, async function () {
  await selectBusinessPage.validateCallCharges()
})
//database connection

When(/^pass the agreement number to (.*)$/, async function (type) {
  await selectBusinessPage.connectTODatabase(type)
})

When(/^agreement number is passed to (.*)$/, async function (date) {
  await selectBusinessPage.updateDate(date)
})

Then(/^close browser$/, async function () {
  await selectBusinessPage.closeBrowser1()
})
Then(/^validate the error message$/, async function () {
  await selectBusinessPage.validateApplicationExistsSingleBusiness()
})

Then(/^validate the error message for multiple business$/, async function () {
  await selectBusinessPage.validateApplicationExistsMultipleBusiness()
})
Then(/^Confirm that the status is set to Agreed$/, async function () {
  await selectBusinessPage.validAgreedStatus()
})
When(/^fetch the agreement number$/, async function () {
  await selectBusinessPage.getAgreementNumber()
})
When(/^delete the entry$/, async function () {
  await selectBusinessPage.deleteEntry()
})

//endemics

Then(/^agree Reviews and follow up for the same species$/,async function (){
  await selectBusinessPage.click_Agree()
})
Then (/^agree the Minimum number of livestock$/,async function (){
  await selectBusinessPage.click_Agree()
})
Then (/^agree Timing of vet visits and funding claims$/,async function (){
  await selectBusinessPage.click_Agree()
})
Then (/^Validate if the user had landed on minimun live stock page$/,async function (){ 
  await selectBusinessPage.validate_minimum_livestock_header()
})
Then (/^user confirm Review Page$/,async function (){ 
  await selectBusinessPage.validate_Review_Page()
})
Then (/^Validate if the user had landed on timining and funding$/,async function (){ 
  await selectBusinessPage.validate_timing_and_funding()
})
Then (/^Validate if the user had landed on review agreement offer$/,async function (){ 
  await selectBusinessPage.validate_review_agreement_offer()
})
Then(/^user click on Reject$/,async function (){
  await selectBusinessPage.reject_Agreement()
})
Then(/^user click on Reject terms for Timing and Funding$/,async function (){
  await selectBusinessPage.clickRejectTermsTimingandFunding()
})
Then (/^validate accept terms and conditions error message$/,async function (){
  await selectBusinessPage.validateAcceptAgreementError()
})

Then (/^Validate the reject agreement offer$/,async function (){ 
  await selectBusinessPage.validate_reject_agreement_offer()
})
Then (/^Validate the reject agreement terms$/,async function (){
  await selectBusinessPage.validateAgreementTermsRejected()
})

Then (/^user clicks on back link$/,async function (){ 
  await selectBusinessPage.click_Back_Link()
})
Then (/^click on gov.uk in the left pane$/,async function (){ 
  await selectBusinessPage.clickGovUKPane()
})
Then (/^validate if the user redirected to gov.uk$/,async function (){ 
  await selectBusinessPage.urlValidation()
})
Then (/^user is able to see the Annual health and welfare review of livestock link on the middle top of the header$/,async function  (){ 
  await selectBusinessPage.getHeaderText()
})
Then (/^user clicks on the service name link$/,async function (){ 
  await selectBusinessPage.clickAHWR()
})
Then (/^user must be redirected to service guidance start pages$/,async function (){ 
  await selectBusinessPage.urlValidationAHWR()
})
Then (/^user clicks I do not agree-Reject agreement$/,async function (){
  await selectBusinessPage.clickRejectTerms()
})
Then (/^user clicks I do not agree-Reject agreement for Timing and funding$/,async function (){
  await selectBusinessPage.clickRejectTermsTimingandFunding()
})
Then(/^validate agreement terms rejected$/,async function (){
  await selectBusinessPage.validateAgreementTermsRejected()
    })