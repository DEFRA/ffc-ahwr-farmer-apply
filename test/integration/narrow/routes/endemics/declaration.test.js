import * as cheerio from 'cheerio'
import { ok } from '../../../../utils/phase-banner-expect'

const getCrumbs = require('../../../../utils/get-crumbs')
const { farmerApplyData: { declaration } } = require('../../../../../app/session/keys')
const states = require('../../../../../app/constants/states')
const { userType } = require('../../../../../app/constants/user-types')

const config = require('../../../../../app/config')
const sessionMock = require('../../../../../app/session')
jest.mock('../../../../../app/session')
const messagingMock = require('../../../../../app/messaging')
jest.mock('../../../../../app/messaging')
jest.mock('applicationinsights', () => ({ defaultClient: { trackException: jest.fn(), trackEvent: jest.fn() }, dispose: jest.fn() }))

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
      ok($)
    })
  })

  describe(`POST ${url} route`, () => {
    test('returns 200, caches data and sends message for valid request', async () => {
      const application = { organisation }
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
      ok($)
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
      ok($)
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
})
