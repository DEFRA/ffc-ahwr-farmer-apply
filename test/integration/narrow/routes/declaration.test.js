const cheerio = require('cheerio')
const getCrumbs = require('../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { farmerApplyData: { declaration } } = require('../../../../app/session/keys')
const species = require('../../../../app/constants/species')
const states = require('../../../../app/constants/states')

const config = require('../../../../app/config')
const sessionMock = require('../../../../app/session')
jest.mock('../../../../app/session')
const messagingMock = require('../../../../app/messaging')
jest.mock('../../../../app/messaging')
jest.mock('applicationinsights', () => ({ defaultClient: { trackException: jest.fn(), trackEvent: jest.fn() }, dispose: jest.fn() }))

function expectPageContentOk ($, organisation) {
  expect($('h1.govuk-heading-l').text()).toEqual('Review your agreement offer')
  expect($('title').text()).toEqual(`Review your agreement offer - ${config.serviceName}`)
  expect($('#organisation-name').text()).toEqual(organisation.name)
  expect($('#organisation-address').text()).toEqual(organisation.address)
  expect($('#organisation-sbi').text()).toEqual(organisation.sbi)
}

describe('Declaration test', () => {
  const organisation = { id: 'organisation', name: 'org-name', address: 'org-address', sbi: '0123456789' }
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = `${config.urlPrefix}/declaration`

  jest.mock('../../../../app/config', () => ({
    ...jest.requireActual('../../../../app/config'),
    authConfig: {
      defraId: {
        hostname: 'https://testtenant.b2clogin.com/testtenant.onmicrosoft.com',
        oAuthAuthorisePath: '/oauth2/v2.0/authorize',
        policy: 'testpolicy',
        redirectUri: 'http://localhost:3000/apply/signin-oidc',
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
    test.each([
      { whichReview: species.beef },
      { whichReview: species.dairy },
      { whichReview: species.pigs },
      { whichReview: species.sheep }
    ])('returns 200 for $whichReview', async ({ whichReview }) => {
      const application = { whichReview, organisation }
      sessionMock.getFarmerApplyData.mockReturnValue(application)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)

      const $ = cheerio.load(res.payload)
      expectPageContentOk($, organisation)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledTimes(1)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledWith(res.request)
      expectPhaseBanner.ok($)
    })

    test('when not logged in redirects to defra id', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location.toString()).toEqual(expect.stringContaining('https://testtenant.b2clogin.com/testtenant.onmicrosoft.com/oauth2/v2.0/authorize'))
    })

    test('returns 400 when no application found', async () => {
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
  })

  describe(`POST ${url} route`, () => {
    test.each([
      { whichReview: species.beef },
      { whichReview: species.dairy },
      { whichReview: species.pigs },
      { whichReview: species.sheep }
    ])('returns 200, caches data and sends message for valid request for $whichReview', async ({ whichReview }) => {
      const application = { whichReview, organisation }
      sessionMock.getFarmerApplyData.mockReturnValue(application)
      messagingMock.receiveMessage.mockResolvedValueOnce({ applicationReference: 'abc123' })
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
      expect($('title').text()).toEqual(`Application complete - ${config.serviceName}`)
      expectPhaseBanner.ok($)
      expect(sessionMock.clear).toBeCalledTimes(1)
      expect(sessionMock.setFarmerApplyData).toHaveBeenCalledTimes(3)
      expect(sessionMock.setFarmerApplyData).toHaveBeenNthCalledWith(1, res.request, declaration, true)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledTimes(2)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledWith(res.request)
      expect(messagingMock.sendMessage).toHaveBeenCalledTimes(1)
    })

    test.each([
      { whichReview: species.beef },
      { whichReview: species.dairy },
      { whichReview: species.pigs },
      { whichReview: species.sheep }
    ])('returns 200, caches data and sends message for rejected request for $whichReview', async ({ whichReview }) => {
      const application = { whichReview, organisation }
      sessionMock.getFarmerApplyData.mockReturnValue(application)
      messagingMock.receiveMessage.mockResolvedValueOnce({ applicationReference: 'abc123' })
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
      expect($('.govuk-heading-l').text()).toEqual('Agreement offer rejected')
      expect($('title').text()).toEqual(config.serviceName)
      expectPhaseBanner.ok($)
      expect(sessionMock.clear).toBeCalledTimes(1)
      expect(sessionMock.setFarmerApplyData).toHaveBeenCalledTimes(3)
      expect(sessionMock.setFarmerApplyData).toHaveBeenNthCalledWith(1, res.request, declaration, true)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledTimes(2)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledWith(res.request)
      expect(messagingMock.sendMessage).toHaveBeenCalledTimes(1)
    })

    test('returns 200, checks cached data for a reference to prevent reference recreation', async () => {
      const whichReview = species.beef
      const reference = 'abc123'
      const application = { whichReview, organisation, reference }
      sessionMock.getFarmerApplyData.mockReturnValue(application)
      messagingMock.receiveMessage.mockResolvedValueOnce({ applicationReference: 'abc123' })
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
      expect($('title').text()).toEqual(`Application complete - ${config.serviceName}`)
      expectPhaseBanner.ok($)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledTimes(1)
      expect(sessionMock.setFarmerApplyData).toHaveBeenCalledTimes(0)
      expect(messagingMock.sendMessage).toHaveBeenCalledTimes(0)
    })

    test.each([
      { whichReview: species.beef },
      { whichReview: species.dairy },
      { whichReview: species.pigs },
      { whichReview: species.sheep }
    ])('returns 400 when request is not valid for $whichReview', async ({ whichReview }) => {
      const application = { whichReview, organisation }
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
      expect($('#terms-error').text()).toMatch('Confirm you have read and agree to the terms and conditions')
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
    const application = { whichReview: species.beef, organisation }
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
