const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { farmerApplyData: { declaration } } = require('../../../../../app/session/keys')
const states = require('../../../../../app/constants/states')
const { userType } = require('../../../../../app/constants/user-types')

const config = require('../../../../../app/config')
const sessionMock = require('../../../../../app/session')
jest.mock('../../../../../app/session')
const messagingMock = require('../../../../../app/messaging')
jest.mock('../../../../../app/messaging')
jest.mock('applicationinsights', () => ({ defaultClient: { trackException: jest.fn(), trackEvent: jest.fn() }, dispose: jest.fn() }))

jest.mock('../../../../../app/lib/common-checks')
const { isUserOldWorldRejectWithinTenMonths } = require('../../../../../app/lib/common-checks')
jest.mock('../../../../../app/api-requests/application-api')
const { getLatestApplicationsBySbi } = require('../../../../../app/api-requests/application-api')

function expectPageContentOk ($, organisation) {
  expect($('h1.govuk-heading-l').text()).toEqual('Review your agreement offer')
  expect($('title').text()).toMatch('Review your agreement offer - Get funding to improve animal health and welfare')
  expect($('#organisation-name').text()).toEqual(organisation.name)
  expect($('#organisation-address').text()).toEqual(organisation.address)
  expect($('#organisation-sbi').text()).toEqual(organisation.sbi)
}

describe('Declaration test', () => {
  const organisation = { id: 'organisation', name: 'org-name', address: 'org-address', sbi: '0123456789', userType: userType.NEW_USER }
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = `${config.urlPrefix}/endemics/declaration`

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

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe(`GET ${url} route`, () => {
    test('when not logged in redirects to defra id', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location.toString()).toEqual(expect.stringContaining('https://testtenant.b2clogin.com/testtenant.onmicrosoft.com/oauth2/v2.0/authorize'))
    })

    test('returns 404 when no application found', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(404)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('404 - Not Found')
    })

    test('returns 200 when application found', async () => {
      const application = { organisation }
      sessionMock.getFarmerApplyData.mockReturnValue(application)
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Review your agreement offer')
      expect($('title').text()).toMatch('Review your agreement offer - Get funding to improve animal health and welfare')
      expectPhaseBanner.ok($)
    })
  })

  describe(`POST ${url} route`, () => {
    test('returns 200, caches data and sends message for valid request', async () => {
      const application = { organisation }
      getLatestApplicationsBySbi.mockResolvedValue([])
      isUserOldWorldRejectWithinTenMonths.mockReturnValue(false)
      sessionMock.getFarmerApplyData.mockReturnValue(application)
      messagingMock.receiveMessage.mockResolvedValueOnce({ applicationReference: 'abc123', applicationState: states.submitted })
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, terms: 'agree', offerStatus: 'accepted' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Application complete')
      expect($('title').text()).toMatch('Application complete - Get funding to improve animal health and welfare')
      expectPhaseBanner.ok($)
      expect(sessionMock.clear).toBeCalledTimes(1)
      expect(sessionMock.setFarmerApplyData).toHaveBeenCalledTimes(3)
      expect(sessionMock.setFarmerApplyData).toHaveBeenNthCalledWith(1, res.request, declaration, true)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledTimes(2)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledWith(res.request)
      expect(messagingMock.sendMessage).toHaveBeenCalledTimes(1)
    })

    test('returns 200, shows offer rejection content on rejection', async () => {
      const application = { organisation }
      sessionMock.getFarmerApplyData.mockReturnValue(application)
      messagingMock.receiveMessage.mockResolvedValueOnce({ applicationReference: 'abc123', applicationState: states.submitted })
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, terms: 'agree', offerStatus: 'rejected' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('title').text()).toMatch('Agreement offer rejected - Get funding to improve animal health and welfare')
      expectPhaseBanner.ok($)
      expect(sessionMock.clear).toBeCalledTimes(1)
      expect(sessionMock.setFarmerApplyData).toHaveBeenCalledTimes(3)
      expect(sessionMock.setFarmerApplyData).toHaveBeenNthCalledWith(1, res.request, declaration, true)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledTimes(2)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledWith(res.request)
      expect(messagingMock.sendMessage).toHaveBeenCalledTimes(1)
    })

    test('returns 400 when request is not valid', async () => {
      const application = { organisation }
      sessionMock.getFarmerApplyData.mockReturnValue(application)
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, offerStatus: 'accepted' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($, organisation)
      expect($('#terms-error').text()).toMatch('Select you have read and agree to the terms and conditions')
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledTimes(1)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledWith(res.request)
    })

    test('returns 500 when request failed', async () => {
      messagingMock.receiveMessage.mockResolvedValueOnce({ applicationState: states.failed })
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, terms: 'agree' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(500)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toEqual('Sorry, there is a problem with the service')
    })

    test('when not logged in redirects to defra id', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location.toString()).toEqual(expect.stringContaining('https://testtenant.b2clogin.com/testtenant.onmicrosoft.com/oauth2/v2.0/authorize'))
    })
  })

  test('returns 500 when application reference is null', async () => {
    const application = { organisation }
    sessionMock.getFarmerApplyData.mockReturnValue(application)
    messagingMock.receiveMessage.mockResolvedValueOnce({ applicationReference: null })
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url,
      payload: { crumb, terms: 'agree', offerStatus: 'accepted' },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(500)
    const $ = cheerio.load(res.payload)
    expect($('h1').text()).toEqual('Sorry, there is a problem with the service')
  })
  describe('isUserOldWorldRejectWithinTenMonths', () => {
    test('returns false when no applications', () => {
      const result = isUserOldWorldRejectWithinTenMonths([])
      expect(result).toBeUndefined()
    })
    test('calls getLatestApplicationsBySbi and isUserOldWorldRejectWithinTenMonths', async () => {
      const application = { organisation }
      sessionMock.getFarmerApplyData.mockReturnValue(application)
      getLatestApplicationsBySbi.mockResolvedValue([])
      isUserOldWorldRejectWithinTenMonths.mockReturnValue(false)

      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, terms: 'agree', offerStatus: 'accepted' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      await global.__SERVER__.inject(options)

      expect(getLatestApplicationsBySbi).toHaveBeenCalledWith(organisation.sbi)
      expect(isUserOldWorldRejectWithinTenMonths).toHaveBeenCalledWith([])
    })
    test('calls isUserOldWorldRejectWithinTenMonths with the correct data', async () => {
      const application = { organisation }
      const oldWorldUserData = [
        {
          id: 'e1c05eea-da01-4e81-a5b5-5e587d2ca917',
          reference: 'AHWR-E1C0-5EEA',
          data: {
            vetName: 'John May',
            vetRcvs: '3454332',
            reference: null,
            urnResult: '4433',
            visitDate: '2024-08-08T00:00:00.000Z',
            dateOfClaim: '2024-08-08T08:08:49.369Z',
            declaration: true,
            offerStatus: 'accepted',
            whichReview: 'sheep',
            organisation: {
              crn: '1101741414',
              frn: '1100848126',
              sbi: '119852719',
              name: 'Bunkers Hill Barn',
              email: 'georgephillipsq@spillihpegroegp.com.test',
              address: 'Stanton Harcourt Farms,15a New Street,Knowle,BROCK FARM,HARROWGATE ROAD,BRISTOL,RG10 9NS,United Kingdom',
              orgEmail: 'bunkershillbarnv@nrabllihsreknubb.com.test',
              farmerName: 'George Phillips'
            },
            animalsTested: '21',
            dateOfTesting: '2024-08-08T00:00:00.000Z',
            detailsCorrect: 'yes',
            eligibleSpecies: 'yes',
            confirmCheckDetails: 'yes'
          },
          claimed: false,
          createdAt: '2024-08-08T07:35:39.481Z',
          updatedAt: '2024-08-08T08:08:49.406Z',
          createdBy: 'admin',
          updatedBy: 'admin',
          statusId: 10,
          type: 'VV'
        }]
      sessionMock.getFarmerApplyData.mockReturnValue(application)
      getLatestApplicationsBySbi.mockResolvedValue(oldWorldUserData)
      isUserOldWorldRejectWithinTenMonths.mockReturnValue(true)

      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, terms: 'agree', offerStatus: 'accepted' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      await global.__SERVER__.inject(options)

      expect(getLatestApplicationsBySbi).toHaveBeenCalledWith(organisation.sbi)
      expect(isUserOldWorldRejectWithinTenMonths).toHaveBeenCalledWith(oldWorldUserData)
    })
  })
})
