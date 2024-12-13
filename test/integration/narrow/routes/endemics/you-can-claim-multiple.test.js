const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const {
  endemicsNumbers,
  endemicsYouCanClaimMultiple,
  endemicsCheckDetails
} = require('../../../../../app/config/routes')

const pageUrl = `/apply/${endemicsYouCanClaimMultiple}`
const backLinkUrl = `/apply/${endemicsCheckDetails}`
const nextPageUrl = `/apply/${endemicsNumbers}`

describe('you-can-claim-multiple page', () => {
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
  const optionsBase = {
    auth,
    url: pageUrl
  }

  describe('GET operation handler', () => {
    beforeAll(async () => {
      jest.resetAllMocks()
      jest.resetModules()

      session = require('../../../../../app/session')

      jest.mock('../../../../../app/auth')
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
    })

    test('returns 200 and content is correct', async () => {
      session.getFarmerApplyData.mockReturnValue(org)

      const res = await global.__SERVER__.inject({ ...optionsBase, method: 'GET' })

      expect(res.statusCode).toBe(200)
      // TODO: 233 verify page content
      // TODO: 233 verify session.setFarmerApplyData()

      const $ = cheerio.load(res.payload)
      const backLinkUrlByClassName = $('.govuk-back-link').attr('href')
      expect(backLinkUrlByClassName).toContain(backLinkUrl)
      expectPhaseBanner.ok($)
    })
  })

  describe('POST operation handler', () => {
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

    test('returns 302 and navigates to correct next page when user agrees', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        ...optionsBase,
        method: 'POST',
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, agreementStatus: 'agree' }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(nextPageUrl)
    })

    test('returns 200 and navigates to error page when user disagrees', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        ...optionsBase,
        method: 'POST',
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, agreementStatus: 'notAgree' }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      // TODO: 233 verify error page
      // TODO: 233 verify session.setFarmerApplyData()
      // TODO: 233 verify session.clear()
      // TODO: 233 verify request.cookieAuth.clear()
    })
  })
})
