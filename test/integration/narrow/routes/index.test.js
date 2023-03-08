const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const mockConfig = require('../../../../app/config')

describe('Farmer apply home page test', () => {
  beforeAll(async () => {
    jest.mock('../../../../app/config', () => ({
      ...mockConfig,
      defraId: {
        enabled: false
      }
    }))
  })

  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${mockConfig.urlPrefix}/start`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'Apply for an annual health and welfare review of your livestock'
    )
    const button = $('.govuk-main-wrapper .govuk-button')
    expect(button.attr('href')).toMatch('/apply/')
    expect(button.text()).toMatch('Start now')
    expect($('title').text()).toEqual('Annual health and welfare review of livestock')
    expectPhaseBanner.ok($)
  })
})
