const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const getCrumbs = require('../../../../utils/get-crumbs')

describe('Check your eligible page test', () => {
  let session
  const url = '/apply/endemics/check-your-eligible'
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

      session = require('../../../../../app/session')
      jest.mock('../../../../../app/session')
      jest.mock('../../../../../app/config', () => ({
        ...jest.requireActual('../../../../../app/config'),
        endemics: {
          enabled: true
        },
        authConfig: {
          defraId: {
            hostname: 'https://tenant.b2clogin.com/tenant.onmicrosoft.com',
            oAuthAuthorisePath: '/oauth2/v2.0/authorize',
            policy: 'b2c_1a_signupsigninsfi',
            redirectUri: 'http://localhost:3000/apply/endemics/signin-oidc',
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
      jest.mock('../../../../../app/auth')
    })

    test('returns 200', async () => {
      session.getFarmerApplyData.mockReturnValue(org)
      const options = {
        auth,
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Review your agreement offer')
      expect($('title').text()).toEqual('Review your agreement offer - Annual health and welfare review of livestock')
      expect($('.govuk-back-link').attr('href')).toContain('/apply/endemics/org-review')
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
      jest.mock('../../../../../app/config', () => ({
        ...jest.requireActual('../../../../../app/config'),
        endemics: {
          enabled: true
        },
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
        payload: { crumb, terms: 'agree', continue: 'continue' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/apply/endemics/declaration')
    })

    test.each([
      { terms: undefined, cont: undefined },
      { terms: undefined, cont: 'continue' },
      { terms: 'agree', cont: undefined }
    ])(
      'returns error when unacceptable answer is given',
      async ({ terms, cont }) => {
        session.getFarmerApplyData.mockReturnValue(org)
        const options = {
          method,
          url,
          payload: { crumb, terms, continue: cont },
          auth,
          headers: { cookie: `crumb=${crumb}` }
        }

        const res = await global.__SERVER__.inject(options)

        expect(res.statusCode).toBe(400)
        expect(res.request.response.variety).toBe('view')
        expect(res.request.response.source.template).toBe(
          'endemics/check-your-eligible'
        )
        expect(res.result).toContain('Confirm you have read and understood what is required to have a review and follow-up visit')
      }
    )
  })
})
