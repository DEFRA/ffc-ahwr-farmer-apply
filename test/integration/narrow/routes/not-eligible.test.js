const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName } = require('../../../../app/config')

describe('Not eligible page test', () => {
  const url = '/not-eligible'

  describe(`GET ${url} route`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('You\'re not eligible to apply')
      expect($('title').text()).toEqual(`Not Eligible - ${serviceName}`)
      expectPhaseBanner.ok($)
    })
  })
})
