const { when, resetAllWhenMocks } = require('jest-when')
const validateJwt = require('../../../../../app/auth/access-token/jwt/validate-jwt')
const decodeJwt = require('../../../../../app/auth/access-token/jwt/decode-jwt')
const setAuthTokens = require('../../../../../app/auth/access-token/set-auth-tokens')
const session = require('../../../../../app/session')
const { tokens, person } = require('../../../../../app/session/keys')

jest.mock('../../../../../app/auth/access-token/jwt/validate-jwt')
jest.mock('../../../../../app/auth/access-token/jwt/decode-jwt')
jest.mock('../../../../../app/session')

const MOCK_NOW = new Date()

describe('setAuthTokens', () => {
  let logSpy
  const COOKIE_AUTH_SET = jest.fn()

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    logSpy = jest.spyOn(console, 'log')
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
    resetAllWhenMocks()
  })

  test.each([
    {
      toString: () => 'setAuthTokens - valid access token - the session contains a matching nonce - auth successful',
      given: {
        request: {
          cookieAuth: {
            set: COOKIE_AUTH_SET
          }
        },
        response: {
          data: {
            access_token: 'access_token...',
            id_token: 'id_token...',
            refresh_token: 'refresh_token...',
            expires_in: 10
          }
        }
      },
      when: {
        isAccessTokenValid: true,
        decodedNonce: {
          nonce: 'nonce'
        },
        session: {
          nonce: 'nonce'
        },
        decodedAccessToken: {
          roles: [
            '5384769:Agent:3'
          ],
          contactId: '1234567890',
          currentRelationshipId: '123456789',
          email: 'business@email.com',
          firstName: 'firstName',
          lastName: 'lastName'
        }
      },
      expect: {
        authSuccessful: true,
        consoleLogs: [
          'Authentication successful.'
        ]
      }
    },
    {
      toString: () => 'setAuthTokens - valid access token - the session contains no nonce',
      given: {
        request: {
        },
        response: {
          data: {
            access_token: 'access_token...',
            id_token: 'id_token...'
          }
        }
      },
      when: {
        isAccessTokenValid: true,
        session: {
          nonce: undefined
        }
      },
      expect: {
        authSuccessful: false,
        consoleLogs: [
          'Nonce returned does not match original nonce.'
        ]
      }
    },
    {
      toString: () => 'setAuthTokens - valid access token - the session contains a mismatched nonce',
      given: {
        request: {
        },
        response: {
          data: {
            access_token: 'access_token...',
            id_token: 'id_token...'
          }
        }
      },
      when: {
        isAccessTokenValid: true,
        decodedNonce: {
          nonce: 'decoded_nonce'
        },
        session: {
          nonce: 'mismatched_nonce'
        }
      },
      expect: {
        authSuccessful: false,
        consoleLogs: [
          'Nonce returned does not match original nonce.'
        ]
      }
    },
    {
      toString: () => 'setAuthTokens - invalid access token',
      given: {
        request: {
        },
        response: {
          data: {
            access_token: 'ey...'
          }
        }
      },
      when: {
        isAccessTokenValid: false,
        session: {
        }
      },
      expect: {
        authSuccessful: false,
        consoleLogs: [
        ]
      }
    }
  ])('%s', async (testCase) => {
    when(validateJwt)
      .calledWith(testCase.given.response.data.access_token)
      .mockReturnValue(testCase.when.isAccessTokenValid)

    when(session.getToken)
      .calledWith(
        testCase.given.request,
        tokens.nonce
      )
      .mockReturnValue(testCase.when.session.nonce)

    when(decodeJwt)
      .calledWith(testCase.given.response.data.id_token)
      .mockReturnValue(testCase.when.decodedNonce)

    when(decodeJwt)
      .calledWith(testCase.given.response.data.access_token)
      .mockReturnValue(testCase.when.decodedAccessToken)

    const authSuccessful = await setAuthTokens(testCase.given.request, testCase.given.response)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(authSuccessful).toEqual(testCase.expect.authSuccessful)

    if (authSuccessful) {
      expect(session.setToken).toHaveBeenNthCalledWith(1,
        testCase.given.request,
        tokens.accessToken,
        testCase.given.response.data.access_token
      )
      expect(session.setToken).toHaveBeenNthCalledWith(2,
        testCase.given.request,
        tokens.tokenExpiry,
        new Date(MOCK_NOW.getTime() + 10 * 1000).toISOString()
      )
      expect(session.setToken).toHaveBeenNthCalledWith(3,
        testCase.given.request,
        tokens.idToken,
        testCase.given.response.data.id_token
      )
      expect(session.setToken).toHaveBeenNthCalledWith(4,
        testCase.given.request,
        tokens.refreshToken,
        testCase.given.response.data.refresh_token
      )
      expect(session.setPerson).toHaveBeenNthCalledWith(1,
        testCase.given.request,
        person.crn,
        testCase.when.decodedAccessToken.contactId
      )
      expect(session.setPerson).toHaveBeenNthCalledWith(2,
        testCase.given.request,
        person.organisationId,
        testCase.when.decodedAccessToken.currentRelationshipId
      )
      expect(COOKIE_AUTH_SET).toHaveBeenCalledTimes(1)
      expect(COOKIE_AUTH_SET).toHaveBeenCalledWith({
        scope: [
          'Agent'
        ],
        account: {
          email: testCase.when.decodedAccessToken.email,
          name: `${testCase.when.decodedAccessToken.firstName} ${testCase.when.decodedAccessToken.lastName}`
        }
      })
    }
  })

  test.each([
    {
      toString: () => 'setAuthTokens - when validateJwt fails',
      given: {
        response: {
          data: {
            access_token: 'access_token...'
          }
        }
      },
      when: {
        error: 'err'
      },
      expect: {
        authSuccessful: false,
        consoleLogs: [
          'Error validating token: '
        ]
      }
    }
  ])('%s', async (testCase) => {
    when(validateJwt)
      .calledWith(testCase.given.response.data.access_token)
      .mockRejectedValue(testCase.when.error)

    const authSuccessful = await setAuthTokens(testCase.given.request, testCase.given.response)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog, testCase.when.error)
    )
    expect(authSuccessful).toEqual(testCase.expect.authSuccessful)
  })
})
