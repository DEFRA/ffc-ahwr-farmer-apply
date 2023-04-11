
const requestAccessToken = require('../../../../../app/auth/client-credential-grant/request-access-token')
const Wreck = require('@hapi/wreck')
jest.mock('@hapi/wreck')

describe('Request Access Token', () => {
  test('when requestAccessToken called - returns valid access token', async () => {
    const token = 'access-token'
    const wreckResponse = {
      payload: {
        access_token: token
      },
      res: {
        statusCode: 200
      }
    }

    Wreck.post = jest.fn(async function (_url, _options) {
      return wreckResponse
    })

    const result = await requestAccessToken()

    expect(result).not.toBeNull()
    expect(result).toMatch(token)
    expect(Wreck.post).toHaveBeenCalledTimes(1)
  })

  test('when requestAccessToken called - returns error when not 200 status code', async () => {
    const error = new Error('HTTP 404 (Call failed)')
    const wreckResponse = {
      res: {
        statusCode: 404,
        statusMessage: 'Call failed'
      }
    }

    Wreck.post = jest.fn(async function (_url, _options) {
      return wreckResponse
    })

    expect(async () =>
      await requestAccessToken()
    ).rejects.toThrowError(error)

    expect(Wreck.post).toHaveBeenCalledTimes(1)
  })
})
