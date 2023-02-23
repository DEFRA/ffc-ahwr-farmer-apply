const enterYourCrn = require('../pageobjects/enter-your-crn.js')
const enterYourEmailAddress = require('../pageobjects/enter-your-email.js')
const enterYourSbi = require('../pageobjects/enter-your-sbi.js')
const registerYourInterest = require('../pageobjects/register-your-interest.js')
const checkYourAnswersAndRegisterYourInterest = require('../pageobjects/check-your-answers-and-register-your-interest.js')

describe('Register Your Interest', () => {
  it('should run through the whole registration correctly', async (testCase) => {
    testCase = 
    {
      given: {
        sbi: 105000006,
        confirmSbi: 105000006,
        crn: 1100000006,
        confirmCrn: 1100000006,
        emailAddress: 'example@email.com',
        confirmEmailAddress: 'example@email.com'
      }
    }
    await browser.setWindowSize(1049, 969)
    await browser.url("http://localhost:3000/apply/register-your-interest/")
    await expect(browser).toHaveUrl("http://localhost:3000/apply/register-your-interest/")

    await registerYourInterest.submit()
    await expect(browser).toHaveUrl("http://localhost:3000/apply/register-your-interest/enter-your-crn")

    await enterYourCrn.enterCrn(testCase.given.crn, testCase.given.confirmCrn)
    await enterYourCrn.submit()
    await expect(browser).toHaveUrl("http://localhost:3000/apply/register-your-interest/enter-your-sbi")

    await enterYourSbi.enterSbi(testCase.given.sbi, testCase.given.confirmSbi)
    await enterYourSbi.submit()
    await expect(browser).toHaveUrl("http://localhost:3000/apply/register-your-interest/enter-your-email-address")

    await enterYourEmailAddress.enterEmailAddress(testCase.given.emailAddress, testCase.given.confirmEmailAddress)
    await enterYourEmailAddress.submit()
    await expect(browser).toHaveUrl("http://localhost:3000/apply/register-your-interest/check-your-answers-and-register-your-interest")
    
    await checkYourAnswersAndRegisterYourInterest.submit()
    await expect(browser).toHaveUrl("http://localhost:3000/apply/register-your-interest/registration-complete")
  })
})
  


