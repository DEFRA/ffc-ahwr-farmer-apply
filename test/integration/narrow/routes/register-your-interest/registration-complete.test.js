const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { serviceName, urlPrefix, ruralPaymentsEmail, callChargesUri } = require('../../../../../app/config')

describe('Farmer apply "Registration complete" page', () => {
  let session

  beforeAll(async () => {
    jest.resetAllMocks()
    jest.mock('../../../../../app/session')
    session = require('../../../../../app/session')
  })

  describe('GET', () => {
    test('returns "Registration complete" confirmation page', async () => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/register-your-interest/registration-complete`
      }

      const res = await global.__SERVER__.inject(options)

      expect(session.clear).toBeCalledTimes(1)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-panel__title').first().text().trim()).toEqual('Registration complete')
      expect($('title').text()).toEqual(serviceName)
      expectPhaseBanner.ok($)
    })
  })
})
