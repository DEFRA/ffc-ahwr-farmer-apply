const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../../app/config')

describe('Farmer apply "Register your interest" page', () => {
  beforeAll(async () => {
    jest.resetAllMocks()
    jest.mock('../../../../../app/session')
  })

  describe('GET', () => {
    test('returns a page allowing for registering interest', async () => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/register-your-interest`
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').first().text()).toEqual('Register your interest in a health and welfare review of your livestock')
      expect($('title').text()).toEqual(serviceName)
      expectPhaseBanner.ok($)
    })
  })
})
