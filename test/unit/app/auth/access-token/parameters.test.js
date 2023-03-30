const { when, resetAllWhenMocks } = require('jest-when')
const session = require('../../../../../app/session')
const { pkcecodes, tokens } = require('../../../../../app/session/keys')

jest.mock('../../../../../app/session')

const MOCK_APPEND = jest.fn()

describe('parameters', () => {
  let parameters

  beforeAll(() => {
    jest.mock('form-data', () => {
      return jest.fn().mockImplementation(() => {
        return {
          append: MOCK_APPEND
        }
      })
    })

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

    parameters = require('../../../../../app/auth/auth-code-grant/redeem-authorization-code-for-access-token')
  })

  afterEach(() => {
    jest.clearAllMocks()
    resetAllWhenMocks()
  })

  afterAll(() => {
    jest.resetModules()
  })

  test.each([
    {
      toString: () => 'buildAuthFormData',
      given: {
        request: {
          query: {
            code: 'code...'
          }
        }
      },
      when: {
        pkce: false
      },
      expect: {
        codeVerifier: undefined
      }
    },
    {
      toString: () => 'buildAuthFormData with pkce',
      given: {
        request: {
          query: {
            code: 'code...'
          }
        }
      },
      when: {
        pkce: true
      },
      expect: {
        codeVerifier: 'verifier'
      }
    }
  ])('%s', async (testCase) => {
    when(session.getPkcecodes)
      .calledWith(
        testCase.given.request,
        pkcecodes.verifier
      )
      .mockReturnValue(testCase.expect.codeVerifier)

    parameters.buildAuthFormData(
      testCase.given.request,
      testCase.when.pkce
    )

    expect(MOCK_APPEND).toHaveBeenCalledWith('client_id', 'clientId')
    expect(MOCK_APPEND).toHaveBeenCalledWith('client_secret', 'clientSecret')
    expect(MOCK_APPEND).toHaveBeenCalledWith('scope', 'scope')
    expect(MOCK_APPEND).toHaveBeenCalledWith('code', testCase.given.request.query.code)
    expect(MOCK_APPEND).toHaveBeenCalledWith('grant_type', 'authorization_code')
    expect(MOCK_APPEND).toHaveBeenCalledWith('redirect_uri', 'redirectUri')
    if (testCase.when.pkce) {
      expect(MOCK_APPEND).toHaveBeenCalledTimes(7)
      expect(MOCK_APPEND).toHaveBeenNthCalledWith(7, 'code_verifier', testCase.expect.codeVerifier)
    } else {
      expect(MOCK_APPEND).toHaveBeenCalledTimes(6)
    }
  })

  test.each([
    {
      toString: () => 'buildRefreshFormData',
      given: {
        request: {}
      },
      expect: {
        refreshToken: 'refreshToken...'
      }
    }
  ])('%s', async (testCase) => {
    when(session.getToken)
      .calledWith(
        testCase.given.request,
        tokens.refreshToken
      )
      .mockReturnValue(testCase.expect.refreshToken)

    parameters.buildRefreshFormData(
      testCase.given.request
    )

    expect(MOCK_APPEND).toHaveBeenCalledWith('client_id', 'clientId')
    expect(MOCK_APPEND).toHaveBeenCalledWith('client_secret', 'clientSecret')
    expect(MOCK_APPEND).toHaveBeenCalledWith('scope', 'scope')
    expect(MOCK_APPEND).toHaveBeenCalledWith('refresh_token', testCase.expect.refreshToken)
    expect(MOCK_APPEND).toHaveBeenCalledWith('grant_type', 'refresh_token')
    expect(MOCK_APPEND).toHaveBeenCalledWith('redirect_uri', 'redirectUri')
    expect(MOCK_APPEND).toHaveBeenCalledTimes(6)
  })

  test.each([
    {
      toString: () => 'buildSignoutFormData',
      given: {
        request: {}
      },
      expect: {
        signoutToken: 'signoutToken...'
      }
    }
  ])('%s', async (testCase) => {
    when(session.getToken)
      .calledWith(
        testCase.given.request,
        tokens.idToken
      )
      .mockReturnValue(testCase.expect.signoutToken)

    parameters.buildSignoutFormData(
      testCase.given.request
    )

    expect(MOCK_APPEND).toHaveBeenCalledWith('post_logout_redirect_uri', 'https://localhost:3000')
    expect(MOCK_APPEND).toHaveBeenCalledWith('id_token_hint', testCase.expect.signoutToken)
    expect(MOCK_APPEND).toHaveBeenCalledTimes(2)
  })
})
