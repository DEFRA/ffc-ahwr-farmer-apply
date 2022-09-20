const cheerio = require('cheerio')
const getCrumbs = require('../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { farmerApplyData: { declaration } } = require('../../../../app/session/keys')
const species = require('../../../../app/constants/species')
const states = require('../../../../app/constants/states')
const { serviceName } = require('../../../../app/config')

const sessionMock = require('../../../../app/session')
jest.mock('../../../../app/session')
const messagingMock = require('../../../../app/messaging')
jest.mock('../../../../app/messaging')

function expectPageContentOk ($, organisation) {
  expect($('h1.govuk-heading-l').text()).toEqual('Review your agreement offer')
  expect($('title').text()).toEqual(`Review your agreement offer - ${serviceName}`)
  expect($('#organisation-name').text()).toEqual(organisation.name)
  expect($('#organisation-address').text()).toEqual(organisation.address)
  expect($('#organisation-sbi').text()).toEqual(organisation.sbi)
}

describe('Declaration test', () => {
  const organisation = { id: 'organisation', name: 'org-name', address: 'org-address', sbi: '0123456789' }
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/declaration'

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

    test('when not logged in redirects to /login', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/login')
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
        payload: { crumb, terms: 'agree' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Application successful')
      expect($('title').text()).toEqual(`Application successful - ${serviceName}`)
      expectPhaseBanner.ok($)
      expect(sessionMock.setFarmerApplyData).toHaveBeenCalledTimes(2)
      expect(sessionMock.setFarmerApplyData).toHaveBeenNthCalledWith(1, res.request, declaration, true)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledTimes(1)
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
        payload: { crumb, terms: 'agree' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Application successful')
      expect($('title').text()).toEqual(`Application successful - ${serviceName}`)
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
        payload: { crumb },
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

    test('when not logged in redirects to /login', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/login')
    })
  })
})
