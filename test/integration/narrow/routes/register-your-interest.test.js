const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Register your interest page test', () => {
  test('GET apply/register-your-interest route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/apply/register-your-interest`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('Register your interest in a health and welfare review of your livestock')

    expect($('title').text()).toEqual(serviceName)
    expectPhaseBanner.ok($)
  })

  test('GET apply/register-your-interest/crn-enter route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/apply/register-your-interest/crn-enter`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('Enter your customer reference number (CRN)')

    expect($('title').text()).toEqual(serviceName)
    expectPhaseBanner.ok($)
  })
})
