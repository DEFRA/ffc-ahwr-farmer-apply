const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { serviceName, urlPrefix, ruralPaymentsEmail, callChargesUri } = require('../../../../../app/config')

describe('Farmer apply "Registration complete" page', () => {
  beforeAll(async () => {
    jest.resetAllMocks()
    jest.mock('../../../../../app/session')
  })

  describe('GET', () => {
    test('returns "Registration complete" confirmation page', async () => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/register-your-interest/registration-complete`
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-panel__title').first().text().trim()).toEqual('Registration complete')
      expect($('.govuk-inset-text .govuk-list li').first().next().next().next().text().trim()).toEqual(ruralPaymentsEmail)
      expect($('.govuk-inset-text .govuk-link').first().attr('href')).toEqual(callChargesUri)
      expect($('title').text()).toEqual(serviceName)
      expectPhaseBanner.ok($)
    })
  })
})
