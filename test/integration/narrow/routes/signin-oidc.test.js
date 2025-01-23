import * as cheerio from 'cheerio'
import { requestAuthorizationCodeUrl } from '../../../../app/auth/auth-code-grant/request-authorization-code-url'
import { getCustomer, setFarmerApplyData } from '../../../../app/session/index'
import { getPersonSummary } from '../../../../app/api-requests/rpa-api/person'
import { organisationIsEligible } from '../../../../app/api-requests/rpa-api/organisation'
import { getCphNumbers } from '../../../../app/api-requests/rpa-api/cph-numbers'
import { getIneligibilityEvent } from '../../../../app/event/get-ineligibility-event'
import { customerMustHaveAtLeastOneValidCph } from '../../../../app/api-requests/rpa-api/cph-check'
import { businessEligibleToApply } from '../../../../app/api-requests/business-eligible-to-apply'
import { InvalidStateError } from '../../../../app/exceptions/InvalidStateError'
import { AlreadyAppliedError } from '../../../../app/exceptions/AlreadyAppliedError'
import { NoEligibleCphError } from '../../../../app/exceptions/NoEligibleCphError'
import { CannotReapplyTimeLimitError } from '../../../../app/exceptions/CannotReapplyTimeLimitError'
import { OutstandingAgreementError } from '../../../../app/exceptions/OutstandingAgreementError'
import { authenticate } from '../../../../app/auth/authenticate'
import { setAuthCookie } from '../../../../app/auth/cookie-auth/cookie-auth'
import { retrieveApimAccessToken } from '../../../../app/auth/client-credential-grant/retrieve-apim-access-token'
import { createServer } from '../../../../app/server'
import { config } from '../../../../app/config'

jest.mock('applicationinsights', () => ({ defaultClient: { trackException: jest.fn(), trackEvent: () => 'hello' }, dispose: jest.fn() }))
jest.mock('../../../../app/session/index', () => ({
  getCustomer: jest.fn(),
  getFarmerApplyData: jest.fn().mockReturnValue({
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
  }),
  setFarmerApplyData: jest.fn(),
  setCustomer: jest.fn()
}))
jest.mock('../../../../app/auth/authenticate')
jest.mock('../../../../app/auth/cookie-auth/cookie-auth')
jest.mock('../../../../app/auth/client-credential-grant/retrieve-apim-access-token')
jest.mock('../../../../app/auth/auth-code-grant/request-authorization-code-url')
jest.mock('../../../../app/api-requests/rpa-api/person')
jest.mock('../../../../app/api-requests/rpa-api/organisation', () => ({ organisationIsEligible: jest.fn(), getOrganisationAddress: jest.fn() }))
jest.mock('../../../../app/api-requests/rpa-api/cph-numbers')
jest.mock('../../../../app/event/get-ineligibility-event', () => ({ getIneligibilityEvent: jest.fn() }))
jest.mock('../../../../app/api-requests/rpa-api/cph-check')
jest.mock('../../../../app/api-requests/business-eligible-to-apply')
jest.mock('../../../../app/api-requests/business-applied-before', () => ({ businessAppliedBefore: jest.fn(() => '') }))

const person = {
  firstName: 'Bill',
  middleName: 'sss',
  lastName: 'Smith',
  email: 'billsmith@testemail.com',
  id: 1234567,
  customerReferenceNumber: '1103452436'
}

describe('FarmerApply defra ID redirection test', () => {
  const urlPrefix = '/apply'
  const url = `${urlPrefix}/signin-oidc`

  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

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

      const res = await server.inject(options)
      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expect(requestAuthorizationCodeUrl).toBeCalledTimes(1)
      expect($('.govuk-heading-l').text()).toMatch('Login failed')
    })

    test('returns 400 and login failed view when state missing', async () => {
      const baseUrl = `${url}?code=343432`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      const res = await server.inject(options)
      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expect(requestAuthorizationCodeUrl).toBeCalledTimes(1)
      expect($('.govuk-heading-l').text()).toMatch('Login failed')
    })

    test('returns 400 and login failed view when code missing', async () => {
      const baseUrl = `${url}?state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      const res = await server.inject(options)
      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expect(requestAuthorizationCodeUrl).toBeCalledTimes(1)
      expect($('.govuk-heading-l').text()).toMatch('Login failed')
    })

    test('redirects to defra id when state mismatch', async () => {
      const baseUrl = `${url}?code=432432&state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      authenticate.mockImplementation(() => {
        throw new InvalidStateError('Invalid state')
      })

      const res = await server.inject(options)
      expect(res.statusCode).toBe(302)
      expect(authenticate).toBeCalledTimes(1)
      expect(requestAuthorizationCodeUrl).toBeCalledTimes(1)
    })

    test('returns 302 and redirected to org view when authenticate successful', async () => {
      const baseUrl = `${url}?code=432432&state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      authenticate.mockResolvedValueOnce({ accessToken: '2323' })
      getPersonSummary.mockResolvedValueOnce(person)
      organisationIsEligible.mockResolvedValueOnce({
        organisationPermission: true,
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

      getCphNumbers.mockResolvedValueOnce([
        '08/178/0064'
      ])

      businessEligibleToApply.mockResolvedValueOnce()

      const res = await server.inject(options)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/apply/endemics/check-details')
      expect(setFarmerApplyData).toBeCalledWith(expect.anything(), 'organisation', expect.objectContaining({
        email: 'billsmith@testemail.com'
      }))
      expect(businessEligibleToApply).toBeCalledTimes(1)
      expect(authenticate).toBeCalledTimes(1)
      expect(getPersonSummary).toBeCalledTimes(1)
      expect(organisationIsEligible).toBeCalledTimes(1)
      expect(setAuthCookie).toBeCalledTimes(1)
    })

    test('returns 302 and organisation email set in session when customer email missing', async () => {
      const baseUrl = `${url}?code=432432&state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      authenticate.mockResolvedValueOnce({ accessToken: '2323' })
      getPersonSummary.mockResolvedValueOnce({ ...person, email: undefined })
      organisationIsEligible.mockResolvedValueOnce({
        organisationPermission: true,
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

      getCphNumbers.mockResolvedValueOnce([
        '08/178/0064'
      ])

      businessEligibleToApply.mockResolvedValueOnce()

      const res = await server.inject(options)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/apply/endemics/check-details')
      expect(setFarmerApplyData).toBeCalledWith(expect.anything(), 'organisation', expect.objectContaining({
        email: 'org1@testemail.com'
      }))
      expect(businessEligibleToApply).toBeCalledTimes(1)
      expect(authenticate).toBeCalledTimes(1)
      expect(getPersonSummary).toBeCalledTimes(1)
      expect(organisationIsEligible).toBeCalledTimes(1)
      expect(setAuthCookie).toBeCalledTimes(1)
    })

    test('returns 400 and login failed view when apim access token auth fails', async () => {
      const baseUrl = `${url}?code=432432&state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      authenticate.mockResolvedValueOnce({ accessToken: '2323' })
      retrieveApimAccessToken.mockImplementation(() => {
        throw new Error('APIM Access Token Retrieval Failed')
      })

      const res = await server.inject(options)
      expect(res.statusCode).toBe(400)
      expect(authenticate).toBeCalledTimes(1)
      expect(retrieveApimAccessToken).toBeCalledTimes(1)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toMatch('Login failed')
    })

    test('returns 400 and exception view when permissions failed', async () => {
      const baseUrl = `${url}?code=432432&state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      authenticate.mockResolvedValueOnce({ accessToken: '2323' })
      retrieveApimAccessToken.mockResolvedValueOnce('Bearer 2323')
      getPersonSummary.mockResolvedValueOnce(person)
      organisationIsEligible.mockResolvedValueOnce({
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
        },
        organisationPermission: false
      })

      getCustomer.mockResolvedValueOnce({
        attachedToMultipleBusinesses: false
      })

      const res = await server.inject(options)
      expect(res.statusCode).toBe(400)
      expect(authenticate).toBeCalledTimes(1)
      expect(retrieveApimAccessToken).toBeCalledTimes(1)
      expect(requestAuthorizationCodeUrl).toBeCalledTimes(1)
      expect(getPersonSummary).toBeCalledTimes(1)
      expect(organisationIsEligible).toBeCalledTimes(1)
      expect(getIneligibilityEvent).toBeCalledTimes(1)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toMatch('You cannot apply for reviews or follow-ups for this business')
    })

    // TODO: This test can be removed when the 10 month rule toggle and AlreadyAppliedError are removed
    test('returns 400 and exception view when already applied', async () => {
      const serviceUri = 'http://localhost:3000/apply'
      config.serviceUri = serviceUri
      const expectedError = new AlreadyAppliedError('Business with SBI 101122201 is not eligible to apply')
      const baseUrl = `${url}?code=432432&state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      authenticate.mockResolvedValueOnce({ accessToken: '2323' })
      retrieveApimAccessToken.mockResolvedValueOnce('Bearer 2323')
      getPersonSummary.mockResolvedValueOnce(person)
      organisationIsEligible.mockResolvedValueOnce({
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
        },
        organisationPermission: true
      })

      businessEligibleToApply.mockRejectedValueOnce(expectedError)

      getCustomer.mockResolvedValueOnce({
        attachedToMultipleBusinesses: false
      })

      getCphNumbers.mockResolvedValueOnce([
        '08/178/0064'
      ])

      const res = await server.inject(options)
      expect(res.statusCode).toBe(400)
      expect(authenticate).toBeCalledTimes(1)
      expect(retrieveApimAccessToken).toBeCalledTimes(1)
      expect(getPersonSummary).toBeCalledTimes(1)
      expect(organisationIsEligible).toBeCalledTimes(1)
      expect(businessEligibleToApply).toBeCalledTimes(1)
      expect(getIneligibilityEvent).toBeCalledTimes(1)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toMatch('You cannot apply for reviews or follow-ups for this business')
      expect($('#guidanceLink').attr('href')).toMatch('http://localhost:3000/apply')
    })

    test('returns 400 and exception view when there is a cannot reapply time limit error', async () => {
      const expectedError = new CannotReapplyTimeLimitError('Business with SBI 101122201 is not eligible to apply due to 10 month restrictions since the last agreement.', '1 Jan 2023', '2 Oct 2023')
      const baseUrl = `${url}?code=432432&state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      authenticate.mockResolvedValueOnce({ accessToken: '2323' })
      retrieveApimAccessToken.mockResolvedValueOnce('Bearer 2323')
      getPersonSummary.mockResolvedValueOnce(person)
      organisationIsEligible.mockResolvedValueOnce({
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
        },
        organisationPermission: true
      })

      businessEligibleToApply.mockRejectedValueOnce(expectedError)

      getCustomer.mockResolvedValueOnce({
        attachedToMultipleBusinesses: false
      })

      getCphNumbers.mockResolvedValueOnce([
        '08/178/0064'
      ])

      const res = await server.inject(options)
      expect(res.statusCode).toBe(400)
      expect(authenticate).toBeCalledTimes(1)
      expect(retrieveApimAccessToken).toBeCalledTimes(1)
      expect(getPersonSummary).toBeCalledTimes(1)
      expect(organisationIsEligible).toBeCalledTimes(1)
      expect(businessEligibleToApply).toBeCalledTimes(1)
      expect(getIneligibilityEvent).toBeCalledTimes(1)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toMatch('You cannot apply for reviews or follow-ups for this business')
      expect($('.govuk-body').text()).toMatch(/ on 2 Oct 2023/)
    })

    test('returns 400 and exception view when there is an outstanding agreement error', async () => {
      const expectedError = new OutstandingAgreementError('Business with SBI 101122201 must claim or withdraw agreement before creating another.')
      const baseUrl = `${url}?code=432432&state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      authenticate.mockResolvedValueOnce({ accessToken: '2323' })
      retrieveApimAccessToken.mockResolvedValueOnce('Bearer 2323')
      getPersonSummary.mockResolvedValueOnce(person)
      organisationIsEligible.mockResolvedValueOnce({
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
        },
        organisationPermission: true
      })

      businessEligibleToApply.mockRejectedValueOnce(expectedError)

      getCustomer.mockResolvedValueOnce({
        attachedToMultipleBusinesses: false
      })

      getCphNumbers.mockResolvedValueOnce([
        '08/178/0064'
      ])

      const res = await server.inject(options)
      expect(res.statusCode).toBe(400)
      expect(authenticate).toBeCalledTimes(1)
      expect(retrieveApimAccessToken).toBeCalledTimes(1)
      expect(getPersonSummary).toBeCalledTimes(1)
      expect(organisationIsEligible).toBeCalledTimes(1)
      expect(businessEligibleToApply).toBeCalledTimes(1)
      expect(getIneligibilityEvent).toBeCalledTimes(1)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toMatch('You cannot apply for reviews or follow-ups for this business')
    })

    test('returns 400 and exception view when no eligible cph', async () => {
      const error = new NoEligibleCphError('Customer must have at least one valid CPH')
      const baseUrl = `${url}?code=432432&state=83d2b160-74ce-4356-9709-3f8da7868e35`
      const options = {
        method: 'GET',
        url: baseUrl
      }

      authenticate.mockResolvedValueOnce({ accessToken: '2323' })
      retrieveApimAccessToken.mockResolvedValueOnce('Bearer 2323')
      getPersonSummary.mockResolvedValueOnce(person)
      organisationIsEligible.mockResolvedValueOnce({
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
        },
        organisationPermission: true
      })

      getCustomer.mockReturnValueOnce({
        attachedToMultipleBusinesses: false
      })

      getCphNumbers.mockResolvedValueOnce([
        '08/178/0064'
      ])

      customerMustHaveAtLeastOneValidCph.mockRejectedValueOnce(error)

      const res = await server.inject(options)

      expect(res.statusCode).toBe(400)
      expect(authenticate).toBeCalledTimes(1)
      expect(retrieveApimAccessToken).toBeCalledTimes(1)
      expect(requestAuthorizationCodeUrl).toBeCalledTimes(1)
      expect(getPersonSummary).toBeCalledTimes(1)
      expect(organisationIsEligible).toBeCalledTimes(1)
      expect(getIneligibilityEvent).toBeCalledTimes(1)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toMatch('You cannot apply for reviews or follow-ups for this business')
    })
  })
})
