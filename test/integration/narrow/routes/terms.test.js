const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName } = require('../../../../app/config')

describe('Farmer apply terms and condition page test', () => {
  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/terms'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('Terms and condition')

    expect($('title').text()).toEqual(serviceName)
    expectPhaseBanner.ok($)
  })
})
