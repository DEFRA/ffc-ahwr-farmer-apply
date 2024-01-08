const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Farmer claim guidance page test', () => {
  let options

  beforeAll(async () => {
    options = {
      method: 'GET',
      url: `${urlPrefix}/claim-guidance-for-farmers`
    }
  })

  test('GET /claim-guidance-for-farmers route returns 200 when not logged in', async () => {
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

describe('Farmer apply guidance page test', () => {
  let options

  beforeAll(async () => {
    options = {
      method: 'GET',
      url: `${urlPrefix}/guidance-for-farmers`
    }
  })

  test('GET guidance-for-farmers route returns 200 when not logged 222 in', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'How to apply for an annual health and welfare review of livestock'
    )
    expect($('title').text()).toEqual(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })

  test('Guidance must included which species need to be tested.', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-list:nth-of-type(16) li:nth-child(8)').text())
      .toContain('the number of beef cattle, sheep and pigs the vet tested - you do not need to provide the number of dairy cattle tested')
  })

  test('Guidance must include info about ot time limit.', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-warning-text__text').text())
      .toContain('You must claim within 6 months of the date you accept your agreement offer')
    expect($('[data-testid="warningpay-extrainfo"]').text())
      .toContain('We cannot pay for a review or testing which happened before the agreement start date.')
  })
})
