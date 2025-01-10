import * as cheerio from 'cheerio'
import { ok } from '../../../../utils/phase-banner-expect'
import { getCrumbs } from '../../../../utils/get-crumbs'
import { keys } from '../../../../../app/session/keys'
import { states, userType } from '../../../../../app/constants/constants'
import { config } from '../../../../../app/config'
import { clear, getFarmerApplyData, setFarmerApplyData } from '../../../../../app/session'
import { receiveMessage } from '../../../../../app/messaging/receive-message'
import { sendMessage } from '../../../../../app/messaging/send-message'
import { createServer } from '../../../../../app/server'

jest.mock('../../../../../app/session/index')
jest.mock('../../../../../app/messaging/receive-message', () => ({ receiveMessage: jest.fn() }))
jest.mock('../../../../../app/messaging/send-message', () => ({ sendMessage: jest.fn() }))
jest.mock('applicationinsights', () => ({ defaultClient: { trackException: jest.fn(), trackEvent: jest.fn() }, dispose: jest.fn() }))

const { farmerApplyData: { declaration } } = keys

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

  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe(`GET ${url} route`, () => {
    test('when not logged in redirects to defra id', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await server.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location.toString()).toEqual(expect.stringContaining('https://testtenant.b2clogin.com/testtenant.onmicrosoft.com/oauth2/v2.0/authorize'))
    })

    test('returns 404 when no application found', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await server.inject(options)

      expect(res.statusCode).toBe(404)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('404 - Not Found')
    })

    test('returns 200 when application found', async () => {
      const application = { organisation }
      getFarmerApplyData.mockReturnValue(application)
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await server.inject(options)

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
      getFarmerApplyData.mockReturnValue(application)
      receiveMessage.mockResolvedValueOnce({ applicationReference: 'abc123', applicationState: states.submitted })
      const crumb = await getCrumbs(server)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, terms: 'agree', offerStatus: 'accepted' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await server.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Application complete')
      expect($('title').text()).toMatch('Application complete - Get funding to improve animal health and welfare')
      ok($)
      expect(clear).toBeCalledTimes(1)
      expect(setFarmerApplyData).toHaveBeenCalledTimes(3)
      expect(setFarmerApplyData).toHaveBeenNthCalledWith(1, res.request, declaration, true)
      expect(getFarmerApplyData).toHaveBeenCalledTimes(2)
      expect(getFarmerApplyData).toHaveBeenCalledWith(res.request)
      expect(sendMessage).toHaveBeenCalledTimes(1)
    })

    test('returns 200, shows offer rejection content on rejection', async () => {
      const application = { organisation }
      getFarmerApplyData.mockReturnValue(application)
      receiveMessage.mockResolvedValueOnce({ applicationReference: 'abc123', applicationState: states.submitted })
      const crumb = await getCrumbs(server)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, terms: 'agree', offerStatus: 'rejected' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await server.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('title').text()).toMatch('Agreement offer rejected - Get funding to improve animal health and welfare')
      ok($)
      expect(clear).toBeCalledTimes(1)
      expect(setFarmerApplyData).toHaveBeenCalledTimes(3)
      expect(setFarmerApplyData).toHaveBeenNthCalledWith(1, res.request, declaration, true)
      expect(getFarmerApplyData).toHaveBeenCalledTimes(2)
      expect(getFarmerApplyData).toHaveBeenCalledWith(res.request)
      expect(sendMessage).toHaveBeenCalledTimes(1)
    })

    test('returns 400 when request is not valid', async () => {
      const application = { organisation }
      getFarmerApplyData.mockReturnValue(application)
      const crumb = await getCrumbs(server)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, offerStatus: 'accepted' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await server.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($, organisation)
      expect($('#terms-error').text()).toMatch('Select you have read and agree to the terms and conditions')
      expect(getFarmerApplyData).toHaveBeenCalledTimes(1)
      expect(getFarmerApplyData).toHaveBeenCalledWith(res.request)
    })

    test('returns 500 when request failed', async () => {
      receiveMessage.mockResolvedValueOnce({ applicationState: states.failed })
      const crumb = await getCrumbs(server)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, terms: 'agree' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await server.inject(options)

      expect(res.statusCode).toBe(500)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toEqual('Sorry, there is a problem with the service')
    })

    test('when not logged in redirects to defra id', async () => {
      const crumb = await getCrumbs(server)
      const options = {
        method: 'POST',
        url,
        payload: { crumb },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await server.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location.toString()).toEqual(expect.stringContaining('https://testtenant.b2clogin.com/testtenant.onmicrosoft.com/oauth2/v2.0/authorize'))
    })
  })

  test('returns 500 when application reference is null', async () => {
    const application = { organisation }
    getFarmerApplyData.mockReturnValue(application)
    receiveMessage.mockResolvedValueOnce({ applicationReference: null })
    const crumb = await getCrumbs(server)
    const options = {
      method: 'POST',
      url,
      payload: { crumb, terms: 'agree', offerStatus: 'accepted' },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(500)
    const $ = cheerio.load(res.payload)
    expect($('h1').text()).toEqual('Sorry, there is a problem with the service')
  })
})
