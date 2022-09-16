const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName } = require('../../../../app/config')

describe('Farmer offer rejected page test', () => {
  const method = 'GET'
  const url = '/offer-rejected'
  test('GET /offer-rejected route returns 400 when not logged in', async () => {
    const options = {
      method,
      url
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(400)
  })
  test('GET /offer-rejected route returns 200', async () => {
    const auth = {
      credentials: { reference: '1111', sbi: '111111111' },
      strategy: 'cookie'
    }
    const options = {
      auth,
      method,
      url
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('You’ve rejected the agreement offer')
    expect($('title').text()).toEqual(serviceName)
    expectPhaseBanner.ok($)
  })
})
