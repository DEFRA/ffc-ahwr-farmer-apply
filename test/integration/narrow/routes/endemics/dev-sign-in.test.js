import { createServer } from '../../../../../app/server.js'
import { config } from '../../../../../app/config/index.js'
import * as cheerio from 'cheerio'
import { ok } from '../../../../utils/phase-banner-expect.js'
import { getCrumbs } from '../../../../utils/get-crumbs.js'
import { businessEligibleToApply } from '../../../../../app/api-requests/business-eligible-to-apply.js'

jest.mock('../../../../../app/session/index')
jest.mock('../../../../../app/api-requests/business-eligible-to-apply')

describe('Dev sign in page test', () => {
  let server

  beforeAll(async () => {
    config.devLogin.enabled = true
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
    config.devLogin.enabled = false
  })

  test('GET dev login route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/apply/endemics/dev-sign-in'
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('h1').text()).toMatch('SBI to use?')
    expect($('title').text().trim()).toContain('What is your SBI? - Get funding to improve animal health and welfare')
    ok($)
  })

  describe('POST route', () => {
    let crumb

    beforeEach(async () => {
      crumb = await getCrumbs(server)
    })

    test('POST to dev login successfully returns a 302 and redirects to journey', async () => {
      businessEligibleToApply.mockReturnValueOnce('no previous application')

      const options = {
        method: 'POST',
        url: '/apply/endemics/dev-sign-in',
        payload: {
          crumb,
          sbi: '123456789'
        },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await server.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/apply/endemics/check-details')
    })
  })
})
