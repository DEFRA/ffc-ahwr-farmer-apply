const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName } = require('../../../../app/config')

describe('Farmer apply accessibility page test', () => {
  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/accessibility'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toContain(
      `Accessibility statement for ${serviceName}`
    )
    expect($('title').text()).toEqual(`Accessibility statement - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
})
