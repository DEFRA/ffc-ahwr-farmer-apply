const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Vet technical guidance pages', () => {
  test('GET /test-cattle route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/test-cattle`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'Cattle: testing required for an annual health and welfare review'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /labs-cattle route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/labs-cattle`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-panel__title').text()).toEqual(
      'Recommended laboratories to test for bovine viral diarrhoea (BVD) in cattle'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /test-sheep route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/test-sheep`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'Sheep: testing required for an annual health and welfare review'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /labs-sheep route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/labs-sheep`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-panel__title').text()).toEqual(
      'Recommended laboratories to carry out a Worming Treatment Check test in sheep'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /test-pigs route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/test-pigs`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'Pigs: testing required for an annual health and welfare review'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /labs-pigs route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/labs-pigs`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-panel__title').text()).toEqual(
      'Recommended laboratories to test for porcine reproductive and respiratory syndrome (PRRS) in pigs'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
})
