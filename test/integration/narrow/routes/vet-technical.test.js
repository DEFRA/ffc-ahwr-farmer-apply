const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName } = require('../../../../app/config')

describe('Vet technical guidance pages', () => {
  test('GET /test-cattle route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/test-cattle'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-panel__title').text()).toEqual(
      'Test for bovine viral diarrhoea (BVD) in cattle'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /labs-cattle route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/labs-cattle'
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
      url: '/test-sheep'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-panel__title').text()).toEqual(
      'Test for the effectiveness of worming treatments in sheep'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /labs-sheep route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/labs-sheep'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-panel__title').text()).toEqual(
      'Recommended laboratories to test effectiveness of worming treatments in sheep'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /test-pigs route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/test-pigs'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-panel__title').text()).toEqual(
      'Test for porcine reproductive and respiratory syndrome (PRRS) in pigs'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /labs-pigs route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/labs-pigs'
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
