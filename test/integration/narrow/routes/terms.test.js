const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const mockConfig = require('../../../../app/config')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Farmer apply terms and condition page test', () => {
  describe('GET - public beta 2 terms and conditions', () => {
    beforeAll(async () => {
      jest.resetAllMocks()
      jest.mock('../../../../app/config', () => ({
        ...mockConfig,
        authConfig: {
          defraId: {
            enabled: false,
            hostname: 'https://tenant.b2clogin.com/tenant.onmicrosoft.com',
            oAuthAuthorisePath: '/oauth2/v2.0/authorize',
            policy: 'b2c_1a_signupsigninsfi',
            redirectUri: 'http://localhost:3000/apply/signin-oidc',
            clientId: 'dummy_client_id',
            serviceId: 'dummy_service_id',
            scope: 'openid dummy_client_id offline_access'
          },
          ruralPaymentsAgency: {
            hostname: 'dummy-host-name',
            getPersonSummaryUrl: 'dummy-get-person-summary-url',
            getOrganisationPermissionsUrl: 'dummy-get-organisation-permissions-url',
            getOrganisationUrl: 'dummy-get-organisation-url'
          }
        }
      }))
    })

    afterAll(async () => {
      jest.resetModules()
    })

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
      expect($('.govuk-heading-l').text()).toEqual('Accept the terms and conditions')
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
      expect($('.govuk-heading-l').text()).toEqual('Accept the terms and conditions')
      expect($('title').text()).toEqual(serviceName)
      expect($('#beta-version').text()).toContain('16. Beta 2 timescale')
      expect($('#continueButton').length).toEqual(continueButtonExpectedLength)
      expectPhaseBanner.ok($)
    })
  })

  describe('GET - public beta 3 terms and conditions', () => {
    beforeAll(async () => {
      jest.resetAllMocks()
      jest.mock('../../../../app/config', () => ({
        ...mockConfig,
        authConfig: {
          defraId: {
            enabled: true,
            hostname: 'https://tenant.b2clogin.com/tenant.onmicrosoft.com',
            oAuthAuthorisePath: '/oauth2/v2.0/authorize',
            policy: 'b2c_1a_signupsigninsfi',
            redirectUri: 'http://localhost:3000/apply/signin-oidc',
            clientId: 'dummy_client_id',
            serviceId: 'dummy_service_id',
            scope: 'openid dummy_client_id offline_access'
          },
          ruralPaymentsAgency: {
            hostname: 'dummy-host-name',
            getPersonSummaryUrl: 'dummy-get-person-summary-url',
            getOrganisationPermissionsUrl: 'dummy-get-organisation-permissions-url',
            getOrganisationUrl: 'dummy-get-organisation-url'
          }
        }
      }))
    })

    afterAll(async () => {
      jest.resetModules()
    })
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
      expect($('.govuk-heading-l').text()).toEqual('Accept the terms and conditions')

      expect($('title').text()).toEqual(serviceName)
      expect($('#beta-version').text()).toContain('16. Beta 3 timescale')
      expect($('#continueButton').length).toEqual(continueButtonExpectedLength)
      expectPhaseBanner.ok($)
    })
  })
})
