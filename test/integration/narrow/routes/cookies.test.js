import * as cheerio from 'cheerio'
import { config } from '../../../../app/config/index.js'
import { ok } from '../../../utils/phase-banner-expect'

const { serviceName, urlPrefix } = config
const url = `${urlPrefix}/cookies`
describe('cookies route', () => {
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
  test('GET /cookies returns 200', async () => {
    const options = {
      method: 'GET',
      url
    }

    const result = await global.__SERVER__.inject(options)
    expect(result.statusCode).toBe(200)
  })

  test('GET /cookies returns cookie policy', async () => {
    const options = {
      method: 'GET',
      url
    }

    const result = await global.__SERVER__.inject(options)
    expect(result.request.response.variety).toBe('view')
    expect(result.request.response.source.template).toBe('cookies/cookie-policy')
  })

  test('GET /cookies context includes Header', async () => {
    const options = {
      method: 'GET',
      url
    }

    const result = await global.__SERVER__.inject(options)
    expect(result.request.response._payload._data).toContain('Cookies')
  })

  test('POST /cookies returns 302 if not async', async () => {
    const options = {
      method: 'POST',
      url,
      payload: { analytics: true }
    }

    const result = await global.__SERVER__.inject(options)
    expect(result.statusCode).toBe(302)
  })

  test('POST /cookies returns 200 if async', async () => {
    const options = {
      method: 'POST',
      url,
      payload: { analytics: true, async: true }
    }

    const result = await global.__SERVER__.inject(options)
    expect(result.statusCode).toBe(200)
  })

  test('POST /cookies invalid returns 400', async () => {
    const options = {
      method: 'POST',
      url,
      payload: { invalid: 'aaaaaa' }
    }

    const result = await global.__SERVER__.inject(options)
    expect(result.statusCode).toBe(400)
  })

  test('POST /cookies redirects to GET with querystring', async () => {
    const options = {
      method: 'POST',
      url,
      payload: { analytics: true }
    }

    const result = await global.__SERVER__.inject(options)
    expect(result.statusCode).toBe(302)
    expect(result.headers.location).toBe(`${urlPrefix}/cookies?updated=true`)
  })

  test('Cookie banner appears when no cookie option selected', async () => {
    const options = {
      method: 'GET',
      url
    }
    const response = await global.__SERVER__.inject(options)
    expect(response.statusCode).toBe(200)
    const $ = cheerio.load(response.payload)
    expect($('.govuk-cookie-banner h2').text()).toContain(`Cookies on ${serviceName}`)
    expect($('.js-cookies-button-accept').text()).toContain('Accept analytics cookies')
    expect($('.js-cookies-button-reject').text()).toContain('Reject analytics cookies')
    ok($)
  })
})
