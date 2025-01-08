import * as cheerio from 'cheerio'
import { ok } from '../../../../utils/phase-banner-expect'

describe('Farmer apply home page test', () => {
  jest.mock('../../../../../app/config', () => ({
    ...jest.requireActual('../../../../../app/config'),
    endemics: {
      enabled: true
    }
  }))

  test('GET / route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/apply/endemics/start'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(
      'Get funding to improve animal health and welfare'
    )
    const button = $('.govuk-main-wrapper .govuk-button')
    console.log('title ===>', $('title').text())
    expect(button.text()).toMatch('Start now')
    expect($('title').text()).toMatch('Get funding to improve animal health and welfare')
    ok($)
  })
})
