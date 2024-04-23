const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { urlPrefix } = require('../../../../../app/config')

describe('Farmer apply guidance page test', () => {
  let options
  beforeAll(async () => {
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
    options = {
      method: 'GET',
      url: `${urlPrefix}/endemics/vet-visit-guidance`
    }
  })

  test('GET /endemics/vet-visit-guidance route returns 200 when not logged in', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text().trim()).toEqual(
      'What happens on a livestock health and welfare review or endemic disease follow-up'
    )
    expect($('title').text()).toEqual('Guidance for vet visit - Get funding to improve animal health and welfare')
    expectPhaseBanner.ok($)
  })

  test('GET /endemics/vet-visit-guidance route renders the correct sections', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.gem-c-devolved-nations > h2').text().trim()).toEqual('Applies to England')
    expect($('.gem-c-related-navigation > .govuk-heading-s').text().trim()).toEqual('Related content')
    expect($('#livestock-health').text().trim()).toEqual('Livestock health and welfare review')
    expect($('#vet-to-do').text().trim()).toEqual('What you must ask the vet to do')
    expect($('#what-a-review-can-include').text().trim()).toEqual('How long the review takes')
    expect($('#how-the-review-works').text().trim()).toEqual('Discuss the health and welfare of your livestock')
    expect($('#during-the-review').text().trim()).toEqual('During the review farm visit')
    expect($('#required-testing').text().trim()).toEqual('Required testing')
    expect($('#after-the-review').text().trim()).toEqual('After the review')
    expect($('#written-report').text().trim()).toEqual('Get a written report')
    expect($('#vet-summary').text().trim()).toEqual('Get a vet summary')
    expect($('#endemic-disease-2').text().trim()).toEqual('Endemic disease follow-ups')
    expect($('#timing-2').text().trim()).toEqual('Timing of vet visits')
    expect($('#long-endemic-disease-2').text().trim()).toEqual('How long endemic disease follow-ups take')
    expect($('#ask-the-vet-2').text().trim()).toEqual('What you must ask the vet to do')
    expect($('#required-testing-2').text().trim()).toEqual('Required testing')
    expect($('#after-endemics-2').text().trim()).toEqual('After the endemic disease follow-ups')
    expect($('#written-report-2').text().trim()).toEqual('Get a written report')
    expect($('#vet-summary-2').text().trim()).toEqual('Get a vet summary')
    expect($('#get-help-visit-2').text().trim()).toEqual('Get help with your visit')
    expectPhaseBanner.ok($)
  })
})
