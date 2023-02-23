const Page = require('./page')

class RegisterYourInterest extends Page {
    get submitButton() { return '//*[@id="main-content"]/div/div/a' }

    open() {
        super.open('/apply/register-your-interest/')
        browser.pause(3000)
    }

    async submit() {
        await browser.$(this.submitButton).click()
    }
}

module.exports = new RegisterYourInterest()