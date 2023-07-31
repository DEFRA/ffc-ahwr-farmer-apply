const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../../app/config')
const mockConfig = require('../../../../../app/config')

describe('Farmer apply "Registration complete" page', () => {
  beforeAll(async () => {
    jest.resetAllMocks()
  })

  describe('GET - Defra Id Off', () => {
    beforeAll(async () => {
      jest.resetModules()
      jest.mock('../../../../../app/config', () => ({
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
          },
          registerYourInterest: {
            enabled: true
          }
        }
      }))
    })
    test('returns "Registration complete" confirmation page', async () => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/register-your-interest/registration-complete`
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-panel__title').first().text().trim()).toEqual('Registration complete')
      expect($('title').text()).toEqual(serviceName)
      expectPhaseBanner.ok($)
    })
  })

  describe('GET - DEFRA ID enabled', () => {
    beforeAll(async () => {
      jest.resetModules()
      jest.mock('../../../../../app/config', () => ({
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
          },
          registerYourInterest: {
            enabled: true
          }
        }
      }))
    })

    test('returns "Registration complete" confirmation page', async () => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/register-your-interest/registration-complete`
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-panel__title').first().text().trim()).toEqual('Registration complete')
      expect($('title').text()).toEqual(serviceName)
      expectPhaseBanner.ok($)
    })
  })
})
