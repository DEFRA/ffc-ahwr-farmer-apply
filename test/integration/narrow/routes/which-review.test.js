const cheerio = require('cheerio')
const getCrumbs = require('../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName } = require('../../../../app/config')

jest.mock('ffc-messaging')

describe('Species review test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/which-review'

  describe(`GET ${url} route`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Which livestock do you want a review for?')
      expect($('title').text()).toEqual(`Which livestock do you want a review for? - ${serviceName}`)
      expectPhaseBanner.ok($)
    })
  })

  describe(`POST ${url} route`, () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { whichReview: 'pigs' },
      { whichReview: 'sheep' },
      { whichReview: 'beef' },
      { whichReview: 'dairy' }
    ])('returns 302 to next page when acceptable answer given', async ({ whichReview }) => {
      const options = {
        method,
        url,
        payload: { crumb, whichReview },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/${whichReview}-eligibility`)
    })

    test.each([
      { whichReview: null },
      { whichReview: undefined },
      { whichReview: 'wrong' },
      { whichReview: '' }
    ])('returns error when unacceptable answer is given', async ({ whichReview }) => {
      const options = {
        method,
        url,
        payload: { crumb, whichReview },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select the livestock type you want reviewed')
      expect(res.statusCode).toBe(400)
    })
  })
})
