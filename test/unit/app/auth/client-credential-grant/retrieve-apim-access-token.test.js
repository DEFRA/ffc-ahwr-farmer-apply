const retrieveApimAccessToken = require('../../../../../app/auth/client-credential-grant/retrieve-apim-access-token')
const Wreck = require('@hapi/wreck')
jest.mock('@hapi/wreck')

describe('Retrieve apim access token', () => {
  test('when retrieveApimAccessToken called - returns valid access token', async () => {
    const tokenType = 'Bearer'
    const token = 'access-token'
    const wreckResponse = {
      payload: {
        token_type: tokenType,
        access_token: token
      },
      res: {
        statusCode: 200
      }
    }

    Wreck.post = jest.fn(async function (_url, _options) {
      return wreckResponse
    })

    const result = await retrieveApimAccessToken()

    expect(result).not.toBeNull()
    expect(result).toMatch(`${tokenType} ${token}`)
    expect(Wreck.post).toHaveBeenCalledTimes(1)
  })

  test('when retrieveApimAccessToken called - error thrown when not 200 status code', async () => {
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
      await retrieveApimAccessToken()
    ).rejects.toThrowError(error)

    expect(Wreck.post).toHaveBeenCalledTimes(1)
  })
})
