const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')

describe('Farmer apply home page test', () => {
  jest.mock('../../../../app/config', () => ({
    ...jest.requireActual('../../../../app/config'),
    endemics: {
      enabled: false
    },
    authConfig: {
      defraId: {
        hostname: 'https://testtenant.b2clogin.com/testtenant.onmicrosoft.com',
        oAuthAuthorisePath: '/oauth2/v2.0/authorize',
        policy: 'testpolicy',
        redirectUri: 'http://localhost:3000/apply/endemics/signin-oidc',
        tenantName: 'testtenant',
        jwtIssuerId: 'dummy_jwt_issuer_id',
        clientId: 'dummyclientid',
        clientSecret: 'dummyclientsecret',
        serviceId: 'dummyserviceid',
        scope: 'openid dummyclientid offline_access'
      },
      ruralPaymentsAgency: {
        hostname: 'dummy-host-name',
        getPersonSummaryUrl: 'dummy-get-person-summary-url',
        getOrganisationPermissionsUrl: 'dummy-get-organisation-permissions-url',
        getOrganisationUrl: 'dummy-get-organisation-url',
        getCphNumbersUrl: 'dummy-get-cph-numbers-url'
      },
      apim: {
        ocpSubscriptionKey: 'dummy-ocp-subscription-key',
        hostname: 'dummy-host-name',
        oAuthPath: 'dummy-oauth-path',
        clientId: 'dummy-client-id',
        clientSecret: 'dummy-client-secret',
        scope: 'dummy-scope'
      }
    }
  }))
  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/apply/start'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'Apply for an annual health and welfare review of your livestock'
    )
    const button = $('.govuk-main-wrapper .govuk-button')
    expect(button.text()).toMatch('Start now')
    expect($('title').text()).toContain('Annual health and welfare review of livestock')
    expectPhaseBanner.ok($)
  })
})
