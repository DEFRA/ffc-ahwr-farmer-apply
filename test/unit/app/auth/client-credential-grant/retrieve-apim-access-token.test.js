import Wreck from '@hapi/wreck'
import { retrieveApimAccessToken } from '../../../../../app/auth/client-credential-grant/retrieve-apim-access-token.js'

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
})
