import * as cheerio from 'cheerio'
import { ok } from 'assert'
import { endemicsDeclaration } from '../../../../../app/config/routes.js'
import { createServer } from '../../../../../app/server.js'
import { getCrumbs } from '../../../../utils/get-crumbs.js'

const auth = {
  credentials: { reference: '1111', sbi: '111111111' },
  strategy: 'cookie'
}
const url = '/apply/endemics/timings'

jest.mock('../../../../../app/session', () => ({
  getFarmerApplyData: jest
    .fn()
    .mockReturnValue({
      id: 'organisation',
      name: 'org-name',
      address: 'org-address',
      sbi: '0123456789',
      farmerName: 'Mr Farm'
    }),
  setFarmerApplyData: jest.fn(),
  clear: jest.fn(),
  getCustomer: jest.fn().mockReturnValue(1111)
}))

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

jest.mock('applicationinsights', () => ({
  defaultClient: { trackException: jest.fn(), trackEvent: jest.fn() },
  dispose: jest.fn()
}))

describe('Declaration test', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  describe(`GET ${url} route`, () => {
    test('returns 200 when application found', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await server.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Timing of reviews and follow-ups')
      expect($('title').text()).toMatch(
        'Timing of reviews and follow-ups - Get funding to improve animal health and welfare'
      )
      expect($('h3').text()).toEqual(
        'org-name - SBI 0123456789'
      )
      ok($)
    })
  })

  describe('POST timings route', () => {
    let crumb

    beforeEach(async () => {
      crumb = await getCrumbs(server)
    })

    test('returns 302 to next page when agree answer given', async () => {
      const res = await server.inject({
        url,
        auth,
        method: 'POST',
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, agreementStatus: 'agree' }
      })

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/apply/${endemicsDeclaration}`)
    })

    test('returns 200 to agreement rejected page when rejected answer given', async () => {
      const res = await server.inject({
        url,
        auth,
        method: 'POST',
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, agreementStatus: 'rejected' }
      })
      expect(res.statusCode).toBe(200)
    })
  })
})
