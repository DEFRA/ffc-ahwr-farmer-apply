const Page = require('./page')

class EnterYourSbi extends Page {
    get sbi() { return $('#sbi') }
    get confirmSbi() { return $('#confirmSbi') }
    get submitButton() { return '//*[@id="main-content"]/div/div/form/button' }

    open() {
        super.open('/apply/register-your-interest/enter-your-sbi')
        browser.pause(3000)
    }

    async enterSbi(sbi, confirmsbi) {
        await this.sbi.setValue(sbi)
        await this.confirmSbi.setValue(confirmsbi)
    }

    async submit() {
        await browser.$(this.submitButton).click()
    }
}

module.exports = new EnterYourSbi()