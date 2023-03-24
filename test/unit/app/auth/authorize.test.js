const { when, resetAllWhenMocks } = require('jest-when')

let auth

describe('Generate authentication url test', () => {
  let sessionMock
  let verificationMock

  beforeAll(() => {
    jest.resetModules()

    jest.mock('../../../../app/config', () => ({
      ...jest.requireActual('../../../../app/config'),
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

    sessionMock = require('../../../../app/session')
    jest.mock('../../../../app/session')

    verificationMock = require('../../../../app/auth/verification')
    jest.mock('../../../../app/auth/verification')

    jest.mock('axios')

    auth = require('../../../../app/auth')
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  afterAll(() => {
    resetAllWhenMocks()
  })

  test('when getAuthenticationUrl with pkce true challenge parameter added', async () => {
    const setPkcecodesMock = jest.fn()
    const setTokenMock = jest.fn()
    const session = {
      setPkcecodes: setPkcecodesMock,
      setToken: setTokenMock
    }
    const result = auth.getAuthenticationUrl(session, undefined)
    const params = new URL(result).searchParams
    expect(params.get('code_challenge')).not.toBeNull()
  })

  test('when getAuthenticationUrl with pkce false no challenge parameter is added', async () => {
    const setPkcecodesMock = jest.fn()
    const setTokenMock = jest.fn()
    const session = {
      setPkcecodes: setPkcecodesMock,
      setToken: setTokenMock
    }
    const result = auth.getAuthenticationUrl(session, undefined, false)
    const params = new URL(result).searchParams
    expect(params.get('code_challenge')).toBeNull()
  })

  test('when authenticate successfull returns access token', async () => {
    when(sessionMock.getPkcecodes)
      .calledWith(expect.anything(), expect.anything())
      .mockReturnValue('verifier')
    verificationMock.stateIsValid.mockReturnValueOnce(true)
    const result = await auth.authenticate({
      query: {
        code: 'code'
      }
    }, sessionMock)
    expect(result).toEqual('dummy_access_token')
  })

  test('when invalid state error is thrown', async () => {
    verificationMock.stateIsValid.mockReturnValueOnce(false)
    try {
      await auth.authenticate({ yar: { id: '33' } }, sessionMock)
    } catch (e) {
      expect(e.message).toBe('Invalid state')
    }
  })
})
