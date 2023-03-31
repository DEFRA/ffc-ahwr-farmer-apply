const mockSession = require('../../../../../app/session/index')
const Wreck = require('@hapi/wreck')
const base = require('../../../../../app/api-requests/third-party-api/base')
const mockDecodeJwt = require('../../../../../app/auth/access-token/jwt/decode-jwt')
jest.mock('../../../../../app/session/index')
jest.mock('@hapi/wreck')
jest.mock('../../../../../app/auth/access-token/jwt/decode-jwt')

describe('Base', () => {
  test('when get called - returns valid payload', async () => {
    const hostname = 'https://testhost'
    const url = '/get/test'
    const contactName = 'Mr Smith'
    const accessToken = 'access_token'
    const contactId = 1234567
    const wreckResponse = {
      payload: {
        name: contactName,
        id: contactId
      },
      res: {
        statusCode: 200
      }
    }
    const options = {
      headers: { Authorization: accessToken },
      json: true,
      rejectUnauthorized: false
    }
    Wreck.get = jest.fn(async function (_url, _options) {
      return wreckResponse
    })

    mockSession.getToken.mockResolvedValueOnce(accessToken)
    mockDecodeJwt.mockResolvedValue(contactId)

    const result = await base.get(hostname, url, expect.anything(), expect.anything())

    expect(result).not.toBeNull()
    expect(result.name).toMatch(contactName)
    expect(result.id).toEqual(contactId)
    expect(Wreck.get).toHaveBeenCalledTimes(1)
    expect(Wreck.get).toHaveBeenCalledWith(`${hostname}${url}`, options)
  })
})
