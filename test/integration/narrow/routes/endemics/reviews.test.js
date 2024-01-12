const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const {
  numbers,
  reviews,
  checkDetails
} = require('../../../../../app/config/routes')

const numbersUrl = `/apply/${numbers}`
const reviewsUrl = `/apply/${reviews}`
const checkDetailsUrl = `/apply/${checkDetails}`

describe('Check your eligible page test', () => {
  let session

  const auth = {
    strategy: 'cookie',
    credentials: { reference: '1111', sbi: '111111111' }
  }
  const org = {
    farmerName: 'Dailry Farmer',
    address: ' org-address-here',
    cph: '11/222/3333',
    email: 'org@test.com',
    name: 'org-name',
    sbi: '123456789'
  }
  const options = {
    auth,
    url: reviewsUrl
  }

  describe(`GET ${numbers} route when logged in`, () => {
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
            getOrganisationPermissionsUrl:
              'dummy-get-organisation-permissions-url',
            getOrganisationUrl: 'dummy-get-organisation-url'
          }
        }
      }))
      jest.mock('../../../../../app/auth')
    })

    test('returns 200', async () => {
      session.getFarmerApplyData.mockReturnValue(org)

      const res = await global.__SERVER__.inject({ ...options, method: 'GET' })

      expect(res.statusCode).toBe(200)

      const $ = cheerio.load(res.payload)
      const titleClassName = '.govuk-heading-l'
      const title = 'Reviews and follow-ups must be for the same species'
      const pageTitleByClassName = $(titleClassName).text()
      const pageTitleByName = $('title').text()
      const serviceName = 'Annual health and welfare review of livestock'
      const fullTitle = `${title} - ${serviceName}`
      const backLinkUrlByClassName = $('.govuk-back-link').attr('href')

      expect(pageTitleByName).toEqual(fullTitle)
      expect(pageTitleByClassName).toEqual(title)
      expect(backLinkUrlByClassName).toContain(checkDetailsUrl)
      expectPhaseBanner.ok($)
    })
  })

  describe(`POST ${reviewsUrl} route`, () => {
    let crumb

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

    test('returns 302 to next page when agree answer given', async () => {
      const res = await global.__SERVER__.inject({
        ...options,
        method: 'POST',
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, agreementStatus: 'agree' }
      })

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(numbersUrl)
    })

    test('returns 200 to rejected page when not agree answer given', async () => {
      const res = await global.__SERVER__.inject({
        ...options,
        method: 'POST',
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, agreementStatus: 'notAgree' }
      })

      expect(res.statusCode).toBe(200)
    })
  })
})
