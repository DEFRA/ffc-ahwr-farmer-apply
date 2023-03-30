describe('decodeJwt', () => {
  let decodeJwt
  let logSpy

  beforeAll(() => {
    logSpy = jest.spyOn(console, 'log')

    decodeJwt = require('../../../../../../app/auth/token-verify/decode-jwt')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    {
      toString: () => 'decodeJwt - successful',
      given: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      },
      expect: {
        payload: {
          sub: '1234567890',
          name: 'John Doe',
          iat: 1516239022
        },
        consoleLogs: [
        ]
      }
    },
    {
      toString: () => 'decodeJwt - failure',
      given: {
        token: 'ey.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      },
      expect: {
        payload: {},
        consoleLogs: [
          'Token decode failed.'
        ]
      }
    }
  ])('%s', async (testCase) => {
    const payload = decodeJwt(testCase.given.token)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(payload).toEqual(testCase.expect.payload)
  })
})
