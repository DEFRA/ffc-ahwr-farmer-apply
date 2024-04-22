const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Farmer apply home page test', () => {
  jest.mock('../../../../../app/config', () => ({
    ...jest.requireActual('../../../../../app/config'),
    endemics: {
      enabled: true
    }
  }))

  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/apply/endemics/start'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'Apply for funding for livestock health and welfare reviews and follow-ups'
    )
    const button = $('.govuk-main-wrapper .govuk-button')
    expect(button.text()).toMatch('Start now')
    expect($('title').text()).toEqual('Get funding to improve animal health and welfare')
    expectPhaseBanner.ok($)
  })
})
