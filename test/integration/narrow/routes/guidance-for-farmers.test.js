const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')

describe('Farmer claim guidance page test', () => {
  let options

  beforeAll(async () => {
    options = {
      method: 'GET',
      url: `${urlPrefix}/claim-guidance-for-farmers`
    }
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

  test('GET /claim-guidance-for-farmers route returns 200 when not logged in', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'How to claim for an annual health and welfare review of livestock'
    )
    expect($('title').text()).toContain(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })
})

describe('Farmer apply guidance page test', () => {
  let options

  beforeAll(async () => {
    options = {
      method: 'GET',
      url: `${urlPrefix}/guidance-for-farmers`
    }
  })

  test('GET guidance-for-farmers route returns 200 when not logged 222 in', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'How to apply for an annual health and welfare review of livestock'
    )
    expect($('title').text()).toContain(`Guidance for farmers - ${serviceName}`)
    expectPhaseBanner.ok($)
  })

  test('Guidance must included which species need to be tested.', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-list:nth-of-type(15) li:nth-child(8)').text())
      .toContain('the number of beef cattle, sheep and pigs the vet tested - you do not need to provide the number of dairy cattle tested')
  })

  test('Guidance must include info about ot time limit.', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-warning-text__text').text())
      .toContain('You must claim within 6 months of the date you accept your agreement offer')
    expect($('[data-testid="warningpay-extrainfo"]').text())
      .toContain('We cannot pay for a review which happened either before the agreement start date or after the claim date')
  })

  test('Guidance must include Require testing guidance.', async () => {
    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('[data-testid="required-testing-header"]').text())
      .toContain('Required testing')
    expect($('[data-testid="required-testing-caption"]').text())
      .toContain('Depending on the species, you must ask the vet to test for:')
  })
})
