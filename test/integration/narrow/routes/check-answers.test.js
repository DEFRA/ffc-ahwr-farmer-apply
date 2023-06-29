const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const content = require('../../../../app/constants/species-review-content')
const sessionMock = require('../../../../app/session')

const config = require('../../../../app/config')
jest.mock('../../../../app/session')

describe('Check Answers test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = `${config.urlPrefix}/check-answers`

  jest.mock('../../../../app/config', () => ({
    ...jest.requireActual('../../../../app/config'),
    authConfig: {
      defraId: {
        hostname: 'https://tenant.b2clogin.com/tenant.onmicrosoft.com',
        oAuthAuthorisePath: '/oauth2/v2.0/authorize',
        policy: 'b2c_1a_signupsigninsfi',
        redirectUri: 'http://localhost:3000/apply/signin-oidc',
        clientId: 'dummy_client_id',
        serviceId: 'dummy_service_id',
        scope: 'openid dummy_client_id offline_access'
      },
      ruralPaymentsAgency: {
        hostname: 'dummy-host-name',
        getPersonSummaryUrl: 'dummy-get-person-summary-url',
        getOrganisationPermissionsUrl: 'dummy-get-organisation-permissions-url',
        getOrganisationUrl: 'dummy-get-organisation-url'
      }
    }
  }))

  describe(`GET ${url} route`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }

      sessionMock.getFarmerApplyData.mockReturnValueOnce('yes').mockReturnValue('pigs')
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Check your answers')
      expect($('title').text()).toEqual(`Check your answers - ${config.serviceName}`)
      expectPhaseBanner.ok($)
    })

    test('returns 302 when there is no eligible livestock', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }
      sessionMock.getFarmerApplyData.mockReturnValueOnce('no')

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`${config.urlPrefix}/not-eligible`)
    })

    test.each([
      { eligibleSpecies: 'beef' },
      { eligibleSpecies: 'dairy' },
      { eligibleSpecies: 'sheep' },
      { eligibleSpecies: 'pigs' }
    ])('Show selected species livestock- %p', async ({ eligibleSpecies }) => {
      sessionMock.getFarmerApplyData.mockReturnValueOnce('yes').mockReturnValueOnce(eligibleSpecies)
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-summary-list__row').length).toEqual(2)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Type of review')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch(content[eligibleSpecies].reviewType)
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch(content[eligibleSpecies].liveStockNumber)
      expect($('.govuk-summary-list__actions a').eq(1).attr('href')).toMatch(`/${eligibleSpecies}-eligibility`)
    })

    test('when not logged in redirects to defra id', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location.toString()).toEqual(expect.stringContaining('https://tenant.b2clogin.com/tenant.onmicrosoft.com/oauth2/v2.0/authorize'))
    })
  })
})
