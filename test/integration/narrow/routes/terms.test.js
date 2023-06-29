const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Farmer apply terms and condition page test', () => {
  describe('GET - public beta 1 terms and conditions', () => {
    test.each([
      { queryParam: undefined, continueButtonExpectedLength: 0 },
      { queryParam: '?continue=true', continueButtonExpectedLength: 1 },
      { queryParam: '?continue=false', continueButtonExpectedLength: 0 }
    ])('GET /terms returns public beta 1 T and C', async ({ queryParam, continueButtonExpectedLength }) => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/terms/v1`
      }

      if (queryParam) {
        options.url = options.url + queryParam
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Annual health and welfare review of livestock terms and conditions: up to 6 February 2023')
      expect($('title').text()).toEqual(serviceName)
      expect($('#beta-version').text()).toContain('16. Phase 1 timescale')
      expect($('#continueButton').length).toEqual(continueButtonExpectedLength)
      expectPhaseBanner.ok($)
    })
  })

  describe('GET - public beta 2 terms and conditions', () => {
    test.each([
      { queryParam: undefined, continueButtonExpectedLength: 0 },
      { queryParam: '?continue=true', continueButtonExpectedLength: 1 },
      { queryParam: '?continue=false', continueButtonExpectedLength: 0 }
    ])('GET /terms returns public beta 2 T and C', async ({ queryParam, continueButtonExpectedLength }) => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/terms`
      }

      if (queryParam) {
        options.url = options.url + queryParam
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Annual health and welfare review of livestock terms and conditions: 7 February to 13 June 2023')
      expect($('title').text()).toEqual(serviceName)
      expect($('#beta-version').text()).toContain('16. Beta 2 timescale')
      expect($('#continueButton').length).toEqual(continueButtonExpectedLength)
      expectPhaseBanner.ok($)
    })

    test.each([
      { queryParam: undefined, continueButtonExpectedLength: 0 },
      { queryParam: '?continue=true', continueButtonExpectedLength: 1 },
      { queryParam: '?continue=false', continueButtonExpectedLength: 0 }
    ])('GET /terms/v2 returns public beta 2 T and C', async ({ queryParam, continueButtonExpectedLength }) => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/terms/v2`
      }

      if (queryParam) {
        options.url = options.url + queryParam
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Annual health and welfare review of livestock terms and conditions: 7 February to 13 June 2023')
      expect($('title').text()).toEqual(serviceName)
      expect($('#beta-version').text()).toContain('16. Beta 2 timescale')
      expect($('#continueButton').length).toEqual(continueButtonExpectedLength)
      expectPhaseBanner.ok($)
    })
  })

  describe('GET - public beta 3 terms and conditions', () => {
    test.each([
      { queryParam: undefined, continueButtonExpectedLength: 0 },
      { queryParam: '?continue=true', continueButtonExpectedLength: 1 },
      { queryParam: '?continue=false', continueButtonExpectedLength: 0 }
    ])('GET /terms/v3 returns public beta 3 T and C', async ({ queryParam, continueButtonExpectedLength }) => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/terms/v3`
      }

      if (queryParam) {
        options.url = options.url + queryParam
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Annual health and welfare review of livestock terms and conditions')

      expect($('title').text()).toEqual(serviceName)
      expect($('#beta-version').text()).toContain('16. Beta 3 timescale')
      expect($('#continueButton').length).toEqual(continueButtonExpectedLength)
      expectPhaseBanner.ok($)
    })
  })
})
