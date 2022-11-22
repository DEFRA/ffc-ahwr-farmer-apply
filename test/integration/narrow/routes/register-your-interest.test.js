const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Org review page test', () => {
  let session
  // const registerYourInterestData = {
  //   crn: '1234567890'
  // }

  describe('Register your interest page test', () => {
    beforeAll(async () => {
      jest.resetAllMocks()

      session = require('../../../../app/session')
      jest.mock('../../../../app/session')
    })

    test('GET apply/register-your-interest route returns 200 when not logged in', async () => {
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

    test('GET apply/register-your-interest/crn-enter route returns 200 ', async () => {
      session.registerYourInterestData.mockReturnValue({})
      const options = {
        method: 'GET',
        url: `${urlPrefix}/register-your-interest/crn-enter`
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').first().text()).toEqual('Enter your customer reference number (CRN)')

      expect($('title').text()).toEqual(serviceName)
      expectPhaseBanner.ok($)
    })
  })
})
