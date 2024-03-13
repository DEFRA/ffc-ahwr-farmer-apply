const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../../app/config')

describe('Farmer apply guidance page test', () => {
  let options

  beforeAll(async () => {
    options = {
      method: 'GET',
      url: `${urlPrefix}/endemics/apply-guidance-for-farmers`
    }
  })

  test('GET /endemics/apply-guidance-for-farmers route returns 200 when not logged in', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text().trim()).toEqual(
      'How to apply for livestock health and welfare review and endemic disease follow-ups'
    )
    expect($('title').text()).toEqual(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })

  test('GET /endemics/apply-guidance-for-farmers route renders the correct sections', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.gem-c-devolved-nations > h2').text().trim()).toEqual('Applies to England')
    expect($('.gem-c-related-navigation > .govuk-heading-s').text().trim()).toEqual('Related content')
    expect($('#what-the-review-is').text().trim()).toEqual('What the service is')
    expect($('.gem-c-print-link > button').first().text().trim()).toEqual('Print this page')
    expect($('#check-youre-eligible-to-apply').text().trim()).toEqual('How much funding you could get')
    expectPhaseBanner.ok($)
  })
})
