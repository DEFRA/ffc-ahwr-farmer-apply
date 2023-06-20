const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Annual Health and Welfare Review landing page', () => {
  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-xl').text()).toEqual(
      'Annual health and welfare review of livestock'
    )
    expect($('title').text()).toEqual(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
})
