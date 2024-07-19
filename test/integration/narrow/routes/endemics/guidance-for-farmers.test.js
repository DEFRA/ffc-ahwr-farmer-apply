const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { urlPrefix } = require('../../../../../app/config')

describe('Farmer apply guidance page test', () => {
  let options

  jest.mock('../../../../../app/config', () => ({
    ...jest.requireActual('../../../../../app/config'),
    endemics: {
      enabled: true
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
    expect($('title').text()).toContain('Guidance for farmers - Get funding to improve animal health and welfare')
    expectPhaseBanner.ok($)
  })

  test('GET /endemics/apply-guidance-for-farmers route renders the correct sections', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.gem-c-devolved-nations > h2').text().trim()).toEqual('Applies to England')
    expect($('.gem-c-related-navigation > .govuk-heading-s').text().trim()).toEqual('Related content')
    expect($('#what-the-service-is').text().trim()).toEqual('What the service is')
    expect($('.gem-c-print-link > button').first().text().trim()).toEqual('Print this page')
    expect($('#how-much-funding').text().trim()).toEqual('How much funding you could get')
    expectPhaseBanner.ok($)
  })
})
