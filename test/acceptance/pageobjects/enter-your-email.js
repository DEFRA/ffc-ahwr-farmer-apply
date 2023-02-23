const Page = require('./page')

class EnterYourEmail extends Page {
    get email() { return $('#emailAddress') }
    get confirmEmail() { return $('#confirmEmailAddress') }
    get submitButton() { return '//*[@id="main-content"]/div/div/form/button' }

    open() {
        super.open('/apply/register-your-interest/enter-your-email')
        browser.pause(3000)
    }

    async enterEmailAddress(email, confirmEmail) {
        await this.email.setValue(email)
        await this.confirmEmail.setValue(confirmEmail)
    }

    async submit() {
        await browser.$(this.submitButton).click()
    }
}

module.exports = new EnterYourEmail()