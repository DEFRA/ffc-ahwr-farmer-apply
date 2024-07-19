const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Vet technical guidance pages', () => {
  beforeAll(async () => {
    jest.resetAllMocks()
    jest.resetModules()

    jest.mock('../../../../app/session')
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
  test('GET /test-cattle route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/test-cattle`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'Cattle: testing required for an annual health and welfare review'
    )
    expect($('title').text()).toContain(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET technical-guidance-cattle route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/vet-technical-guidance-cattle`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-xl').text()).toEqual(
      'Vets: test for bovine viral diarrhoea (BVD) in cattle'
    )
    expect($('title').text()).toContain(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /test-sheep route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/test-sheep`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'Sheep: testing required for an annual health and welfare review'
    )
    expect($('title').text()).toContain(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /labs-sheep route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/vet-technical-guidance-sheep`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-xl').text()).toEqual(
      'Vets: test for the effectiveness of worming treatments in sheep'
    )
    expect($('title').text()).toContain(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /test-pigs route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/test-pigs`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'Pigs: testing required for an annual health and welfare review'
    )
    expect($('title').text()).toContain(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
  test('GET /labs-pigs route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: `${urlPrefix}/vet-technical-guidance-pigs`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-xl').text()).toEqual(
      'Vets: test for porcine reproductive and respiratory syndrome (PRRS) in pigs'
    )
    expect($('title').text()).toContain(`Guidance for vets - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
})
