const Wreck = require('@hapi/wreck')
const { when, resetAllWhenMocks } = require('jest-when')
const session = require('../../../../../app/session')
const { pkcecodes, tokens } = require('../../../../../app/session/keys')

jest.mock('@hapi/wreck')
jest.mock('../../../../../app/session')

const MOCK_NOW = new Date()

describe('retrieveToken', () => {
  let logSpy
  let errorSpy
  let retrieveToken

  beforeAll(() => {
    logSpy = jest.spyOn(console, 'log')
    errorSpy = jest.spyOn(console, 'error')

    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../../app/config', () => ({
      ...jest.requireActual('../../../../../app/config'),
      authConfig: {
        defraId: {
          hostname: 'https://localhost',
          oAuthAuthorisePath: '/',
          clientId: 'clientId',
          clientSecret: 'clientSecret',
          scope: 'scope',
          redirectUri: 'redirectUri'
        }
      }
    }))

    retrieveToken = require('../../../../../app/auth/access-token/retrieve-token')
  })

  afterEach(() => {
    jest.clearAllMocks()
    resetAllWhenMocks()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test.each([
    {
      toString: () => 'HTTP 200',
      given: {
        request: {
          query: {
            code: 'code'
          }
        },
        response: {
          res: {
            statusCode: 200
          },
          payload: {
            access_token: 'access_token...'
          }
        },
        codeVerifier: 'codeVerifier'
      },
      when: {
        refresh: false
      },
      expect: {
        response: {
          access_token: 'access_token...'
        },
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Retrieving the access token: ${JSON.stringify({
            refresh: false
          })}`
        ]
      }
    },
    {
      toString: () => 'HTTP 200 - refresh',
      given: {
        request: {
          query: {
            code: 'code'
          }
        },
        response: {
          res: {
            statusCode: 200
          },
          payload: {
            access_token: 'access_token...'
          }
        },
        codeVerifier: 'codeVerifier',
        refreshToken: 'refresh_token...'
      },
      when: {
        refresh: true
      },
      expect: {
        response: {
          access_token: 'access_token...'
        },
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Retrieving the access token: ${JSON.stringify({
            refresh: true
          })}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    when(session.getPkcecodes)
      .calledWith(
        testCase.given.request,
        pkcecodes.verifier
      )
      .mockReturnValue(testCase.given.codeVerifier)
    when(session.getToken)
      .calledWith(
        testCase.given.request,
        tokens.refreshToken
      )
      .mockReturnValue(testCase.given.refreshToken)
    when(Wreck.post)
      .calledWith(
        'https://localhost/b2c_1a_signupsigninsfi/oauth2/v2.0/token',
        {
          headers: expect.anything(),
          payload: expect.anything(),
          json: true
        }
      )
      .mockReturnValue(testCase.given.response)

    const response = await retrieveToken(
      testCase.given.request,
      testCase.when.refresh
    )

    expect(response).toEqual(testCase.expect.response)
    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
  })

  test.each([
    {
      toString: () => 'HTTP 500',
      given: {
        request: {
          query: {
            code: 'code'
          }
        },
        response: 'error',
        codeVerifier: 'codeVerifier'
      },
      when: {
        refresh: false
      },
      expect: {
        response: undefined,
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Retrieving the access token: ${JSON.stringify({
            refresh: false
          })}`,
          `${MOCK_NOW.toISOString()} Retrieving the access token failed: ${JSON.stringify({
            refresh: false
          })}`
        ],
        errorLogs: [
          'error'
        ]
      }
    }
  ])('%s', async (testCase) => {
    when(session.getPkcecodes)
      .calledWith(
        testCase.given.request,
        pkcecodes.verifier
      )
      .mockReturnValue(testCase.given.codeVerifier)
    when(Wreck.post)
      .calledWith(
        'https://localhost/b2c_1a_signupsigninsfi/oauth2/v2.0/token',
        {
          headers: expect.anything(),
          payload: expect.anything(),
          json: true
        }
      )
      .mockRejectedValue(testCase.given.response)

    const response = await retrieveToken(
      testCase.given.request,
      testCase.when.refresh
    )

    expect(response).toEqual(testCase.expect.response)
    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    testCase.expect.errorLogs.forEach(
      (errorLog, idx) => expect(errorSpy).toHaveBeenNthCalledWith(idx + 1, errorLog)
    )
  })
})
