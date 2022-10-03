const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName } = require('../../../../app/config')

describe('Farmer and vet guidance page test', () => {
  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-xl').text()).toEqual(
      'Farmers: get a funded annual health and welfare review of your livestock'
    )
    expect($('title').text()).toEqual(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/guidance-for-farmers'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-xl').text()).toEqual(
      'Farmers: get a funded annual health and welfare review of your livestock'
    )
    expect($('title').text()).toEqual(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/guidance-for-vet'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-xl').text()).toEqual(
      'Vets: how to carry out an annual health and welfare review of livestock'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/guidance-for-vet-technical'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-xl').text()).toEqual(
      'How to carry out endemic disease and condition testing for an annual health and welfare review of livestock'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
})
