const Page = require('./page')

class CheckYourAnswersAndRegisterYourInterest extends Page {
    get submitButton() { return '//*[@id="main-content"]/div/div/form/button' }

    open() {
        super.open('/apply/register-your-interest/check-your-answers-and-register-your-interest')
        browser.pause(3000)
    }

    async submit() {
        await browser.$(this.submitButton).click()
    }
}

module.exports = new CheckYourAnswersAndRegisterYourInterest()