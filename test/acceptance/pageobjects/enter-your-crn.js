const Page = require('./page')

class EnterYourCrn extends Page {
    get crn() { return $('#crn') }
    get confirmCrn() { return $('#confirmCrn') }
    get submitButton() { return '//*[@id="main-content"]/div/div/form/button' }

    open() {
        super.open('/apply/register-your-interest/enter-your-crn')
        browser.pause(3000)
    }

    async enterCrn(crn, confirmCrn) {
        await this.crn.setValue(crn)
        await this.confirmCrn.setValue(confirmCrn)
    }

    async submit() {
        await browser.$(this.submitButton).click()
    }
}

module.exports = new EnterYourCrn()