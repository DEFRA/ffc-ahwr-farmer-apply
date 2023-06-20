const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Farmer guidance page test', () => {
  test('GET guidance-for-farmers route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/guidance-for-farmers`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'How to apply for an annual health and welfare review of livestock'
    )
    expect($('title').text()).toEqual(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })

  test('GET /claim-guidance-for-farmers route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/claim-guidance-for-farmers`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'How to claim for an annual health and welfare review of livestock'
    )
    expect($('title').text()).toEqual(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
})
