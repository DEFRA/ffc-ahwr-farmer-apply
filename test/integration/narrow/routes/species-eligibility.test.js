const cheerio = require('cheerio')
const getCrumbs = require('../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const species = require('../../../../app/constants/species')
const speciesContent = require('../../../../app/constants/species-content')
const { serviceName } = require('../../../../app/config')

describe('Species eligibility test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

  describe('GET species eligibility route', () => {
    test.each([
      { species: species.beef },
      { species: species.dairy },
      { species: species.pigs },
      { species: species.sheep }
    ])('returns 200', async ({ species }) => {
      const url = `/${species}-eligibility`
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch(speciesContent[species].legendText)
      expect($('title').text()).toEqual(speciesContent[species].title + ` - ${serviceName}`)
      expect($('.govuk-hint').text()).toMatch(speciesContent[species].hintText)
      expectPhaseBanner.ok($)
    })

    test.each([
      { species: species.beef },
      { species: species.dairy },
      { species: species.pigs },
      { species: species.sheep }
    ])('when not logged in redirects to /login', async ({ species }) => {
      const url = `/${species}-eligibility`
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/login')
    })
  })

  describe('POST species eligibility route', () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { species: species.beef, eligibleSpecies: 'no', nextPage: '/not-eligible' },
      { species: species.dairy, eligibleSpecies: 'no', nextPage: '/not-eligible' },
      { species: species.pigs, eligibleSpecies: 'no', nextPage: '/not-eligible' },
      { species: species.sheep, eligibleSpecies: 'no', nextPage: '/not-eligible' },
      { species: species.beef, eligibleSpecies: 'yes', nextPage: '/check-answers' },
      { species: species.dairy, eligibleSpecies: 'yes', nextPage: '/check-answers' },
      { species: species.pigs, eligibleSpecies: 'yes', nextPage: '/check-answers' },
      { species: species.sheep, eligibleSpecies: 'yes', nextPage: '/check-answers' }
    ])('returns 302 to next page when acceptable answer given', async ({ species, eligibleSpecies, nextPage }) => {
      const url = `/${species}-eligibility`
      const options = {
        method,
        url,
        payload: { crumb, eligibleSpecies },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(nextPage)
    })

    test.each([
      { species: species.beef, eligibleSpecies: null },
      { species: species.dairy, eligibleSpecies: null },
      { species: species.pigs, eligibleSpecies: null },
      { species: species.sheep, eligibleSpecies: null },
      { species: species.beef, eligibleSpecies: undefined },
      { species: species.dairy, eligibleSpecies: undefined },
      { species: species.pigs, eligibleSpecies: undefined },
      { species: species.sheep, eligibleSpecies: undefined },
      { species: species.beef, eligibleSpecies: 'wrong' },
      { species: species.dairy, eligibleSpecies: 'wrong' },
      { species: species.pigs, eligibleSpecies: 'wrong' },
      { species: species.sheep, eligibleSpecies: 'wrong' },
      { species: species.beef, eligibleSpecies: '' },
      { species: species.dairy, eligibleSpecies: '' },
      { species: species.pigs, eligibleSpecies: '' },
      { species: species.sheep, eligibleSpecies: '' }
    ])('returns error when unacceptable answer is given', async ({ species, eligibleSpecies }) => {
      const url = `/${species}-eligibility`
      const options = {
        method,
        url,
        payload: { crumb, eligibleSpecies },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch(speciesContent[species].errorText)
      expect(res.statusCode).toBe(400)
    })

    test.each([
      { species: species.beef },
      { species: species.dairy },
      { species: species.pigs },
      { species: species.sheep }
    ])('when not logged in redirects to /login', async ({ species }) => {
      const url = `/${species}-eligibility`
      const options = {
        method,
        url,
        payload: { crumb, eligibleSpecies: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/login')
    })
  })
})
