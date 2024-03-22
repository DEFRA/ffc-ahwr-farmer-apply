const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../../app/config')

describe('Farmer claim guidance page test', () => {
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
      url: `${urlPrefix}/endemics/claim-guidance`
    }
  })

  test('GET /endemics/apply-guidance-for-farmers route returns 200 when not logged in', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text().trim()).toEqual(
      'How to claim funding to improve the health and welfare of your livestock'
    )
    expect($('title').text()).toEqual(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })

  test('GET /endemics/claim-guidance route renders the correct sections', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.gem-c-devolved-nations > h2').text().trim()).toEqual('Applies to England')
    expect($('.gem-c-related-navigation > .govuk-heading-s').text().trim()).toEqual('Related content')
    expect($('#when-to-claim').text().trim()).toEqual('When to claim')
    expect($('.gem-c-print-link > button').first().text().trim()).toEqual('Print this page')
    expect($('#get-help-with-your-claim').text().trim()).toEqual('Get help with your claim')
    expectPhaseBanner.ok($)
  })
})
