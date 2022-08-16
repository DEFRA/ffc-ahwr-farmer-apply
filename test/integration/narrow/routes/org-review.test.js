const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const getCrumbs = require('../../../utils/get-crumbs')
const { serviceName } = require('../../../../app/config')

describe('Org review page test', () => {
  let session
  const url = '/org-review'
  const auth = {
    credentials: { reference: '1111', sbi: '111111111' },
    strategy: 'cookie'
  }
  const org = {
    farmerName: 'Dailry Farmer',
    address: ' org-address-here',
    cph: '11/222/3333',
    email: 'org@test.com',
    name: 'org-name',
    sbi: '123456789'
  }
  describe(`GET ${url} route when logged in`, () => {
    beforeAll(async () => {
      jest.resetAllMocks()

      session = require('../../../../app/session')
      jest.mock('../../../../app/session')
    })

    test('returns 200', async () => {
      session.getFarmerApplyData.mockReturnValue(org)
      const options = {
        auth,
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Check your details')
      const keys = $('.govuk-summary-list__key')
      const values = $('.govuk-summary-list__value')
      expect(keys.eq(0).text()).toMatch('Farmer name')
      expect(values.eq(0).text()).toMatch(org.farmerName)
      expect(keys.eq(1).text()).toMatch('Business name')
      expect(values.eq(1).text()).toMatch(org.name)
      expect(keys.eq(2).text()).toMatch('SBI number')
      expect(values.eq(2).text()).toMatch(org.sbi)
      expect(keys.eq(3).text()).toMatch('Address')
      expect(values.eq(3).text()).toMatch(org.address)
      expect($('title').text()).toEqual(`Check your details - ${serviceName}`)
      expect($('legend').text().trim()).toEqual('Are your details correct?')
      expect($('.govuk-radios__item').length).toEqual(2)
      expectPhaseBanner.ok($)
    })

    test('returns 404 when no organisation is found', async () => {
      session.getFarmerApplyData.mockReturnValue(undefined)
      const options = {
        auth: {
          credentials: { reference: '1111', sbi: '111111111' },
          strategy: 'cookie'
        },
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(404)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('404 - Not Found')
    })
  })

  describe(`POST ${url} route`, () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test('returns 302 to next page when acceptable answer given', async () => {
      const options = {
        method,
        url,
        payload: { crumb, confirmCheckDetails: 'yes' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/which-review')
    })

    test('returns 200 with update your details when no is answered', async () => {
      const options = {
        method,
        url,
        payload: { crumb, confirmCheckDetails: 'no' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Update your details')
    })

    test.each([
      { confirmCheckDetails: null },
      { confirmCheckDetails: undefined },
      { confirmCheckDetails: 'wrong' },
      { confirmCheckDetails: '' }
    ])(
      'returns error when unacceptable answer is given',
      async ({ confirmCheckDetails }) => {
        session.getFarmerApplyData.mockReturnValue(org)
        const options = {
          method,
          url,
          payload: { crumb, confirmCheckDetails },
          auth,
          headers: { cookie: `crumb=${crumb}` }
        }

        const res = await global.__SERVER__.inject(options)

        expect(res.statusCode).toBe(400)
        expect(res.request.response.variety).toBe('view')
        expect(res.request.response.source.template).toBe(
          'org-review'
        )
      }
    )
  })
})
