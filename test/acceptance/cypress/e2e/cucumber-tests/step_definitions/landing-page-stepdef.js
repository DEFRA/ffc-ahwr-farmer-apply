import { Given, Then, When, After, Before } from 'cypress-cucumber-preprocessor/steps'
import ApplyStartPage from '../pages/apply-start-page'

Before(() => {

})

After(() => {

})
Given(/^the user is on the (.*) page$/, function (page) {
  ApplyStartPage.navigateToPage(page)
})
When(/^user start the application$/, function () {
  ApplyStartPage.clickOnStartButton()
})
When(/^user apply with (.*)$/, function (credential) {
  ApplyStartPage.inputCredentials(credential)
})
Then(/^an email error is displayed$/,
  function () {
    ApplyStartPage.verifyErrorMessage()
  })
Then(/^magic link is sent to user email$/, function () {
  ApplyStartPage.magicLinkMessage()
})