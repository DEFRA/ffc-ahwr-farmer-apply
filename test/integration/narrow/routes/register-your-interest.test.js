const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName, urlPrefix } = require('../../../../app/config')
const getCrumbs = require('../../../utils/get-crumbs')

describe('Org review page test', () => {
  let session

  describe('Register your interest page test', () => {
    beforeAll(async () => {
      jest.resetAllMocks()

      session = require('../../../../app/session')
      jest.mock('../../../../app/session')
    })

    test('GET apply/register-your-interest route returns 200 when not logged in', async () => {
      const options = {
        method: 'GET',
        url: `${urlPrefix}/register-your-interest`
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').first().text()).toEqual('Register your interest in a health and welfare review of your livestock')

      expect($('title').text()).toEqual(serviceName)
      expectPhaseBanner.ok($)
    })

    test('GET apply/register-your-interest/crn-enter route returns 200 ', async () => {
      session.getRegisterYourInterestData.mockReturnValue({})
      const options = {
        method: 'GET',
        url: `${urlPrefix}/register-your-interest/crn-enter`
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').first().text()).toEqual('Enter your customer reference number (CRN)')

      expect($('title').text()).toEqual(serviceName)
      expectPhaseBanner.ok($)
    })

    test('GET apply/register-your-interest/sbi-enter route returns 200 ', async () => {
      session.getRegisterYourInterestData.mockReturnValue({})
      const options = {
        method: 'GET',
        url: `${urlPrefix}/register-your-interest/sbi-enter`
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').first().text()).toEqual('Enter the single business identifier (SBI) number')

      expect($('title').text()).toEqual(serviceName)
      expectPhaseBanner.ok($)
    })
  })

  describe(`POST ${urlPrefix}/register-your-interest/crn-enter route`, () => {
    let crumb

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test('returns 302 to next page when valid crn', async () => {
      const options = {
        method: 'POST',
        url: `${urlPrefix}/register-your-interest/crn-enter`,
        payload: { crumb, crn: '1234567890', confirmcrn: '1234567890' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('sbi-enter')
    })

    test.each([
      { crn: null, confirmcrn: null },
      { crn: undefined, confirmcrn: undefined },
      { crn: '', confirmcrn: '' },
      { crn: '12343', confirmcrn: null },
      { crn: '12343', confirmcrn: '242322' },
      { crn: '1234567890', confirmcrn: '' },
      { crn: '1234567890', confirmcrn: '1234567894' }
    ])('returns error when invalid crn data',
      async ({ crn, confirmcrn }) => {
        const options = {
          method: 'POST',
          url: `${urlPrefix}/register-your-interest/crn-enter`,
          payload: { crumb, crn: crn, confirmcrn: confirmcrn },
          headers: { cookie: `crumb=${crumb}` }
        }

        const res = await global.__SERVER__.inject(options)

        expect(res.statusCode).toBe(400)
        expect(res.request.response.variety).toBe('view')
        expect(res.request.response.source.template).toBe('crn-enter')
      }
    )
  })
})
