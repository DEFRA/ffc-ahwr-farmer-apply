const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Farmer apply home page test', () => {
  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/start`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'Apply for an annual health and welfare review of your livestock'
    )
    const button = $('.govuk-main-wrapper .govuk-button')
    expect(button.attr('href')).toMatch(`${urlPrefix}/`)
    expect(button.text()).toMatch('Start now')
    expect($('title').text()).toEqual(serviceName)
    expectPhaseBanner.ok($)
  })
})
