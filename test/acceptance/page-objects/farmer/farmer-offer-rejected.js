import Pages from '../page'

class FarmerOfferRejected extends Pages {
    get rejectedHeading() { return browser.$("//h1[contains(@class,'govuk-heading-l')]") }
}
module.exports = new FarmerOfferRejected()
