const { when, resetAllWhenMocks } = require('jest-when')

const Wreck = require('@hapi/wreck')
jest.mock('@hapi/wreck')

const getSignedJwt = require('../../../utils/get-signed-jwt')
jest.mock('../../../utils/get-signed-jwt')

const getMagicLink = require('../../../utils/get-magic-link')

const mockConfig = require('../../../../app/config')

const consoleLogSpy = jest.spyOn(console, 'log')
const MOCK_NOW = new Date()
const mockServiceUri = 'http://internal:3333/uri'

const options = {
  headers: {
    Authorization: 'Bearer signed-jwt',
    'Content-Type': 'application/json'
  },
  json: true
}

describe('Get Magic Link', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../app/config', () => ({
      ...mockConfig,
      notifyConfig: {
        emailTemplates: {
          applyLogin: 'apply-login-template-id'
        },
        apiKey: 'U}a-ddcabbbcb-bfefb-feecb-fdadb-ffcedeacfaac-cffbbfbab-cdddb-beffb-dfecb-bdcecedccfcf'
      },
      serviceUri: mockServiceUri
    }))
  })

  afterEach(() => {
    jest.resetAllMocks()
    resetAllWhenMocks()
  })

  afterAll(() => {
    jest.resetModules()
    jest.useRealTimers()
  })

  test('with invalid email', async () => {
    const BUSINESS_EMAIL_ADDRESS = 'invalid'
    const invalidEmailResponse = {
      value: BUSINESS_EMAIL_ADDRESS,
      error: 'ValidationError: "value" must be a valid email'
    }

    const response = await getMagicLink(BUSINESS_EMAIL_ADDRESS)

    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} Error retrieving magic link: Invalid business email: ${invalidEmailResponse.value} returned an error: ${invalidEmailResponse.error}`)
    expect(response).toBeNull()
  })

  test('with jwt not signed', async () => {
    const BUSINESS_EMAIL_ADDRESS = 'email@email.com'

    getSignedJwt.mockReturnValue(null)
    const response = await getMagicLink(BUSINESS_EMAIL_ADDRESS)

    expect(getSignedJwt).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} Error retrieving magic link: Unable to sign JWT`)
    expect(response).toBeNull()
  })

  test.each([
    {
      scenario: 'with Wreck.get returns 404',
      wreckExpectedResponse: {
        res: {
          statusCode: 403,
          statusMessage: 'Forbidden'
        },
        payload: {
          errors: [
            {
              error: 'AuthError',
              message: 'Invalid token: make sure your API token matches the example at https://docs.notifications.service.gov.uk/rest-api.html#authorisation-header'
            }
          ]
        }
      },
      consoleLog: `${MOCK_NOW.toISOString()} Error retrieving magic link: HTTP 403 (Forbidden). The response was: {"errors":[{"error":"AuthError","message":"Invalid token: make sure your API token matches the example at https://docs.notifications.service.gov.uk/rest-api.html#authorisation-header"}]}`
    },
    {
      scenario: 'no magic link email found',
      wreckExpectedResponse: {
        res: {
          statusCode: 200,
          statusMessage: 'OK'
        },
        payload: {
          links: {
            current: 'https://api.notifications.service.gov.uk/v2/notifications'
          },
          notifications: [
            {
              completed_at: '2023-03-02T06:00:04.006080Z',
              created_at: '2023-03-02T06:00:02.204413Z',
              reference: null,
              status: 'delivered',
              template: {
                id: '1'
              }
            }
          ]
        }
      },
      consoleLog: `${MOCK_NOW.toISOString()} Error retrieving magic link: No magic link email found for email@email.com`
    },
    {
      scenario: 'no token found',
      wreckExpectedResponse: {
        res: {
          statusCode: 200,
          statusMessage: 'OK'
        },
        payload: {
          links: {
            current: 'https://api.notifications.service.gov.uk/v2/notifications'
          },
          notifications: [
            {
              completed_at: '2022-03-02T06:00:04.006080Z',
              created_at: '2022-03-02T06:00:02.204413Z',
              email_address: 'email@email.com',
              reference: '123456789',
              status: 'delivered',
              template: {
                id: mockConfig.notifyConfig.emailTemplates.applyLogin
              }
            },
            {
              completed_at: '2023-03-02T06:00:04.006080Z',
              created_at: '2023-03-02T06:00:02.204413Z',
              email_address: 'email@email.com',
              status: 'delivered',
              template: {
                id: mockConfig.notifyConfig.emailTemplates.applyLogin
              }
            }
          ]
        }
      },
      consoleLog: `${MOCK_NOW.toISOString()} Error retrieving magic link: Unable to find token in magic link email for email@email.com`
    }
  ])('$scenario', async (testCase) => {
    const BUSINESS_EMAIL_ADDRESS = 'email@email.com'
    getSignedJwt.mockReturnValue('signed-jwt')

    when(Wreck.get)
      .calledWith(
        'https://api.notifications.service.gov.uk/v2/notifications',
        options
      )
      .mockResolvedValue(testCase.wreckExpectedResponse)

    const response = await getMagicLink(BUSINESS_EMAIL_ADDRESS)

    expect(getSignedJwt).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)

    expect(consoleLogSpy).toHaveBeenCalledWith(testCase.consoleLog)
    expect(response).toBeNull()
  })

  test('magic link found', async () => {
    const BUSINESS_EMAIL_ADDRESS = 'email@email.com'

    const wreckExpectedResponse = {
      res: {
        statusCode: 200,
        statusMessage: 'OK'
      },
      payload: {
        links: {
          current: 'https://api.notifications.service.gov.uk/v2/notifications'
        },
        notifications: [
          {
            completed_at: '2022-03-02T06:00:04.006080Z',
            created_at: '2022-03-02T06:00:02.204413Z',
            email_address: BUSINESS_EMAIL_ADDRESS,
            reference: 'early token',
            status: 'delivered',
            template: {
              id: mockConfig.notifyConfig.emailTemplates.applyLogin
            }
          },
          {
            completed_at: '2023-03-02T06:00:04.006080Z',
            created_at: '2023-03-02T06:00:02.204413Z',
            email_address: BUSINESS_EMAIL_ADDRESS,
            reference: null,
            status: 'delivered',
            template: {
              id: mockConfig.notifyConfig.emailTemplates.applyLogin
            }
          },
          {
            completed_at: '2023-03-03T06:00:04.006080Z',
            created_at: '2023-03-03T06:00:02.204413Z',
            email_address: BUSINESS_EMAIL_ADDRESS,
            reference: 'latestToken',
            status: 'delivered',
            template: {
              id: mockConfig.notifyConfig.emailTemplates.applyLogin
            }
          }
        ]
      }
    }
    getSignedJwt.mockReturnValue('signed-jwt')

    when(Wreck.get)
      .calledWith(
        'https://api.notifications.service.gov.uk/v2/notifications',
        options
      )
      .mockResolvedValue(wreckExpectedResponse)

    const response = await getMagicLink(BUSINESS_EMAIL_ADDRESS)

    expect(getSignedJwt).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} Magic link for ${BUSINESS_EMAIL_ADDRESS} is ${mockConfig.serviceUri}/verify-login?token=latestToken&email=${BUSINESS_EMAIL_ADDRESS}`)
    expect(response).toEqual(`${mockConfig.serviceUri}/verify-login?token=latestToken&email=${BUSINESS_EMAIL_ADDRESS}`)
  })
})