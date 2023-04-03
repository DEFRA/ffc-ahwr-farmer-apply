const cheerio = require('cheerio')
const sessionMock = require('../../../../../app/session')
jest.mock('../../../../../app/session')
const authMock = require('../../../../../app/auth')
jest.mock('../../../../../app/auth')
const personMock = require('../../../../../app/api-requests/third-party-api/person')
jest.mock('../../../../../app/api-requests/third-party-api/person')
const organisationMock = require('../../../../../app/api-requests/third-party-api/organisation')
jest.mock('../../../../../app/api-requests/third-party-api/organisation')

describe('FarmerApply defra ID redirection test', () => {
  jest.mock('../../../../../app/config', () => ({
    ...jest.requireActual('../../../../../app/config'),
    authConfig: {
      defraId: {
        enabled: true
      },
      ruralPaymentsAgency: {
        hostname: 'dummy-host-name',
        getPersonSummaryUrl: 'dummy-get-person-summary-url',
        getOrganisationPermissionsUrl: 'dummy-get-organisation-permissions-url',
        getOrganisationUrl: 'dummy-get-organisation-url'
      }
    }
  }))
  const configMock = require('../../../../../app/config')

  const urlPrefix = configMock.urlPrefix
  const url = `${urlPrefix}/signin-oidc`

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  describe(`GET requests to '${url}'`, () => {
    test.each([
      { code: '', state: '' },
      { code: 'sads', state: '' },
      { code: '', state: '83d2b160-74ce-4356-9709-3f8da7868e35' }
    ])('returns 400 and login failed view when empty required query parameters - %p', async ({ code, state }) => {
      const baseUrl = `${url}?code=${code}&state=${state}`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expect(authMock.requestAuthorizationCodeUrl).toBeCalledTimes(1)
      expect($('.govuk-heading-l').text()).toMatch('Login failed')
    })

    test('returns 400 and login failed view when state missing', async () => {
      const baseUrl = `${url}?code=343432`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expect(authMock.requestAuthorizationCodeUrl).toBeCalledTimes(1)
      expect($('.govuk-heading-l').text()).toMatch('Login failed')
    })

    test('returns 400 and login failed view when code missing', async () => {
      const baseUrl = `${url}?state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expect(authMock.requestAuthorizationCodeUrl).toBeCalledTimes(1)
      expect($('.govuk-heading-l').text()).toMatch('Login failed')
    })

    test('returns 400 and login failed view when state mismatch', async () => {
      const baseUrl = `${url}?code=432432&state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      authMock.authenticate.mockImplementation(() => {
        throw new Error('Invalid state')
      })

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
      expect(authMock.authenticate).toBeCalledTimes(1)
      expect(authMock.requestAuthorizationCodeUrl).toBeCalledTimes(1)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toMatch('Login failed')
    })

    test('returns 302 and redirected to org view when authenticate successful', async () => {
      const baseUrl = `${url}?code=432432&state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      authMock.authenticate.mockResolvedValueOnce({ accessToken: '2323' })
      personMock.getPersonSummary.mockResolvedValueOnce({
        _data: {
          firstName: 'Bill',
          middleName: null,
          lastName: 'Smith',
          email: 'billsmith@testemail.com',
          id: 1234567,
          customerReferenceNumber: '1103452436'
        }
      })
      organisationMock.organisationIsEligible.mockResolvedValueOnce({
        organisation: {
          id: 7654321,
          name: 'Mrs Gill Black',
          sbi: 101122201,
          address: {
            address1: 'The Test House',
            address2: 'Test road',
            address3: 'Wicklewood',
            buildingNumberRange: '11',
            buildingName: 'TestHouse',
            street: 'Test ROAD',
            city: 'Test City',
            postalCode: 'TS1 1TS',
            country: 'United Kingdom',
            dependentLocality: 'Test Local'
          },
          email: 'org1@testemail.com'
        }
      })

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/apply/org-review')
      expect(sessionMock.setFarmerApplyData).toBeCalledTimes(1)
      expect(authMock.authenticate).toBeCalledTimes(1)
      expect(personMock.getPersonSummary).toBeCalledTimes(1)
      expect(organisationMock.organisationIsEligible).toBeCalledTimes(1)
      expect(authMock.setAuthCookie).toBeCalledTimes(1)
    })

    test('returns 400 and login failed view when permissions failed', async () => {
      const baseUrl = `${url}?code=432432&state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      authMock.authenticate.mockResolvedValueOnce({ accessToken: '2323' })
      personMock.getPersonSummary.mockResolvedValueOnce({
        _data: {
          firstName: 'Bill',
          middleName: null,
          lastName: 'Smith',
          email: 'billsmith@testemail.com',
          id: 1234567,
          customerReferenceNumber: '1103452436'
        }
      })
      organisationMock.organisationIsEligible.mockImplementation(() => {
        throw new Error('Person id 7654321 does not have the required permissions for organisation id 1234567')
      })

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
      expect(authMock.authenticate).toBeCalledTimes(1)
      expect(authMock.getAuthenticationUrl).toBeCalledTimes(1)
      expect(personMock.getPersonSummary).toBeCalledTimes(1)
      expect(organisationMock.organisationIsEligible).toBeCalledTimes(1)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toMatch('Login failed')
    })
  })
})
