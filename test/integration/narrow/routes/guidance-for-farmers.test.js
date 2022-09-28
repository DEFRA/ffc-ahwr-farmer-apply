const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName } = require('../../../../app/config')

describe('Farmer guidance page test', () => {
  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-xl').text()).toEqual(
      'Farmers: get a funded annual health and welfare review for cattle, sheep and pigs'
    )
    expect($('title').text()).toEqual(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
})
