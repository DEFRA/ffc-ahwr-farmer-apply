const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const getCrumbs = require('../../../utils/get-crumbs')

describe('Org review page test', () => {
  let session
  let authMock
  const url = '/apply/org-review'
  const auth = {
    credentials: { reference: '1111', sbi: '111111111' },
    strategy: 'cookie'
  }
  const org = {
    farmerName: 'Dailry Farmer',
    address: ' org-address-here',
    cph: '11/222/3333',
    email: 'org@test.com',
    name: 'org-name',
    sbi: '123456789'
  }
  describe(`GET ${url} route when logged in`, () => {
    beforeAll(async () => {
      jest.resetAllMocks()
      jest.resetModules()

      session = require('../../../../app/session')
      jest.mock('../../../../app/session')
      jest.mock('../../../../app/config', () => ({
        ...jest.requireActual('../../../../app/config'),
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
      jest.mock('../../../../app/auth')
      authMock = require('../../../../app/auth')
    })

    test('returns 200', async () => {
      session.getFarmerApplyData.mockReturnValue(org)
      const options = {
        auth,
        method: 'GET',
        url
      }

      authMock.requestAuthorizationCodeUrl.mockReturnValueOnce('https://somedefraidlogin')

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Check your details')
      const keys = $('.govuk-summary-list__key')
      const values = $('.govuk-summary-list__value')
      expect(keys.eq(0).text()).toMatch('Farmer name')
      expect(values.eq(0).text()).toMatch(org.farmerName)
      expect(keys.eq(1).text()).toMatch('Business name')
      expect(values.eq(1).text()).toMatch(org.name)
      expect(keys.eq(2).text()).toMatch('SBI number')
      expect(values.eq(2).text()).toMatch(org.sbi)
      expect(keys.eq(3).text()).toMatch('Address')
      expect(values.eq(3).text()).toMatch(org.address)
      expect($('title').text()).toEqual('Check your details - Annual health and welfare review of livestock')
      expect($('.govuk-back-link').attr('href')).toContain('https://somedefraidlogin')
      expect($('legend').text().trim()).toEqual('Are your details correct?')
      expect($('.govuk-radios__item').length).toEqual(2)
      expect(authMock.requestAuthorizationCodeUrl).toBeCalledTimes(1)
      expectPhaseBanner.ok($)
    })
  })

  describe(`POST ${url} route`, () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    beforeAll(async () => {
      jest.mock('../../../../app/config', () => ({
        ...jest.requireActual('../../../../app/config'),
        authConfig: {
          defraId: {
            enabled: true
          }
        }
      }))
    })

    test('returns 302 to next page when acceptable answer given', async () => {
      const options = {
        method,
        url,
        payload: { crumb, confirmCheckDetails: 'yes' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/apply/which-review')
    })

    test('returns 200 with update your details recognised when no is answered', async () => {
      const options = {
        method,
        url,
        payload: { crumb, confirmCheckDetails: 'no' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Update your details')
    })

    test.each([
      { confirmCheckDetails: null },
      { confirmCheckDetails: undefined },
      { confirmCheckDetails: 'wrong' },
      { confirmCheckDetails: '' }
    ])(
      'returns error when unacceptable answer is given',
      async ({ confirmCheckDetails }) => {
        session.getFarmerApplyData.mockReturnValue(org)
        const options = {
          method,
          url,
          payload: { crumb, confirmCheckDetails },
          auth,
          headers: { cookie: `crumb=${crumb}` }
        }

        const res = await global.__SERVER__.inject(options)

        expect(res.statusCode).toBe(400)
        expect(res.request.response.variety).toBe('view')
        expect(res.request.response.source.template).toBe(
          'org-review'
        )
        expect(res.result).toContain(org.sbi)
        expect(res.result).toContain(org.farmerName)
        expect(res.result).toContain(org.address)
        expect(res.result).toContain(org.name)
      }
    )
  })
})
