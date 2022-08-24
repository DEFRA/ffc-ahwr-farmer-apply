const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName } = require('../../../../app/config')

describe('Not eligible page test', () => {
  const url = '/not-eligible'

  describe(`GET ${url} route`, () => {
    test('when logged in returns 200', async () => {
      const options = {
        auth: { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' },
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

    test('when not logged in redirects to /login', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/login')
    })
  })
})
