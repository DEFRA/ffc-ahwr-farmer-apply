import { getCrumbs } from '../../../../utils/get-crumbs.js'

import { endemicsCheckDetails, endemicsNumbers, endemicsYouCanClaimMultiple } from '../../../../../app/config/routes.js'
import { clear, getFarmerApplyData, setFarmerApplyData } from '../../../../../app/session/index.js'

const pageUrl = `/apply/${endemicsYouCanClaimMultiple}`
const backLinkUrl = `/apply/${endemicsCheckDetails}`
const nextPageUrl = `/apply/${endemicsNumbers}`

describe('you-can-claim-multiple page', () => {
  const optionsBase = {
    auth: { strategy: 'cookie', credentials: { reference: '1111', sbi: '111111111' } },
    url: pageUrl
  }

  beforeAll(async () => {
    jest.mock('../../../../../app/session', () => ({
      getFarmerApplyData: jest.fn((_request, _key) => ({ name: 'org-name', sbi: '123456789' })),
      setFarmerApplyData: jest.fn(),
      clear: jest.fn()
    }))

    jest.mock('../../../../../app/auth')
    jest.mock('../../../../../app/config', () => ({
      ...jest.requireActual('../../../../../app/config'),
      endemics: {
        enabled: true
      },
      multiSpecies: {
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

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe('GET operation handler', () => {
    test('returns 200 and content is correct', async () => {
      const res = await global.__SERVER__.inject({ ...optionsBase, method: 'GET' })

      expect(getFarmerApplyData).toHaveBeenCalledTimes(1)

      expect(res.statusCode).toBe(200)
      expect(res.payload).toContain(backLinkUrl)
      const sanitizedHTML = sanitizeHTML(res.payload)
      expect(sanitizedHTML).toMatchSnapshot()
    })

    const sanitizeHTML = (html) => {
      return html
        .replace(/<input type="hidden" name="crumbBanner" id="crumbBanner" value=".*?"/g, '<input type="hidden" name="crumbBanner" id="crumbBanner" value="SANITIZED"')
        .replace(/<input type="hidden" name="crumb" value=".*?"/g, '<input type="hidden" name="crumb" value="SANITIZED"')
    }
  })

  describe('POST operation handler', () => {
    let postOptionsBase

    beforeEach(async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      postOptionsBase = {
        ...optionsBase,
        method: 'POST',
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb }
      }
    })

    test('returns 302 and navigates to correct next page when user agrees', async () => {
      const options = {
        ...postOptionsBase,
        payload: {
          ...postOptionsBase.payload,
          agreementStatus: 'yes'
        }
      }

      const res = await global.__SERVER__.inject(options)

      expect(setFarmerApplyData).toHaveBeenCalledTimes(1)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(nextPageUrl)
    })

    test('returns 200 and navigates to error page when user disagrees', async () => {
      const options = {
        ...postOptionsBase,
        payload: {
          ...postOptionsBase.payload,
          agreementStatus: 'no'
        }
      }

      const res = await global.__SERVER__.inject(options)

      expect(setFarmerApplyData).toHaveBeenCalledTimes(1)
      expect(clear).toHaveBeenCalledTimes(1)

      expect(res.statusCode).toBe(200)
      expect(res.headers.location).not.toEqual(nextPageUrl)
    })
  })
})
