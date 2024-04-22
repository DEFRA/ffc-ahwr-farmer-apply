const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Recommended lab pages', () => {
  beforeAll(async () => {
    jest.resetAllMocks()
    jest.resetModules()
    jest.mock('../../../../app/config', () => ({
      ...jest.requireActual('../../../../app/config'),
      endemics: {
        enabled: false
      },
      authConfig: {
        defraId: {
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

  test('GET /recommended-cattle-labs route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/recommended-cattle-labs`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-xl').text()).toEqual(
      'Recommended laboratories to test for bovine viral diarrhoea (BVD) in cattle'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })

  test('GET /recommended-pig-labs route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/recommended-pig-labs`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-xl').text()).toEqual(
      'Recommended laboratories to test for porcine reproductive and respiratory syndrome (PRRS) in pigs'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })

  test('GET /recommended-sheep-labs route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/recommended-sheep-labs`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-xl').text()).toEqual(
      'Recommended laboratories to carry out a Worming Treatment Check test in sheep'
    )
    expect($('title').text()).toEqual(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
})
