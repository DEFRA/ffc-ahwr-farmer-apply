const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Farmer claim guidance page test', () => {
  let options, res

  beforeAll(async () => {
    options = {
      method: 'GET',
      url: `${urlPrefix}/claim-guidance-for-farmers`
    }
    res = await global.__SERVER__.inject(options)
  })

  test('GET /claim-guidance-for-farmers route returns 200 when not logged in', async () => {
    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'How to claim for an annual health and welfare review of livestock'
    )
    expect($('title').text()).toEqual(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
})

describe('Farmer apply guidance page test', () => {
  let options, res

  beforeAll(async () => {
    options = {
      method: 'GET',
      url: `${urlPrefix}/guidance-for-farmers`
    }
    res = await global.__SERVER__.inject(options)
  })

  test('GET guidance-for-farmers route returns 200 when not logged in', async () => {
    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'How to apply for an annual health and welfare review of livestock'
    )
    expect($('title').text()).toEqual(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })

  test('Guidance must included which species need to be tested.', async () => {
    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-list:nth-of-type(16) li:nth-child(8)').text())
      .toContain('the number of beef cattle, sheep and pigs the vet tested - you do not need to provide the number of dairy cattle tested')
  })
})
