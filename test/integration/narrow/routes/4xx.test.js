import * as cheerio from 'cheerio'
import { ok } from '../../../utils/phase-banner-expect.js'

describe('4xx error pages', () => {
  test('GET /unknown route returns 404', async () => {
    const options = {
      method: 'GET',
      url: '/unknown'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(404)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('404 - Not Found')
    expect($('#_404 div p').text()).toEqual('Not Found')
    ok($)
  })
})
