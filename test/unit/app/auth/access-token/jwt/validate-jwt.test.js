const Wreck = require('@hapi/wreck')
const jwktopem = require('jwk-to-pem')
const jwt = require('jsonwebtoken')
const { when, resetAllWhenMocks } = require('jest-when')

jest.mock('@hapi/wreck')
jest.mock('jwk-to-pem')
jest.mock('jsonwebtoken')

describe('validateJwt', () => {
  let validateJwt

  beforeAll(() => {
    jest.mock('../../../../../../app/config', () => ({
      ...jest.requireActual('../../../../../../app/config'),
      authConfig: {
        defraId: {
          hostname: 'hostname',
          tenantName: 'tenantName',
          jwtIssuerId: 'issuerId'
        }
      }
    }))

    when(Wreck.get)
      .calledWith(
        'hostname/discovery/v2.0/keys?p=b2c_1a_signupsignin',
        { json: true }
      )
      .mockResolvedValue({
        payload: {
          keys: [
            {
              kid: 'xle...',
              use: 'sig',
              kty: 'RSA',
              e: 'AQAB',
              n: '311v...'
            }
          ]
        }
      })

    when(jwktopem)
      .calledWith({
        kid: 'xle...',
        use: 'sig',
        kty: 'RSA',
        e: 'AQAB',
        n: '311v...'
      })
      .mockReturnValue('-----BEGIN PUBLIC KEY-----')

    when(jwt.decode)
      .calledWith(expect.anything(), expect.anything())
      .mockReturnValue({
        payload: {
          iss: 'https://tenantName.b2clogin.com/issuerId/v2.0/'
        }
      })

    when(jwt.verify)
      .calledWith(expect.anything(), expect.anything(), expect.anything())
      .mockResolvedValue({})

    validateJwt = require('../../../../../../app/auth/auth-code-grant/jwt/validate-jwt')
  })

  afterEach(() => {
    jest.clearAllMocks()
    resetAllWhenMocks()
  })

  test.each([
    {
      toString: () => 'validateJwt',
      given: {
        token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiaXNzIjoiaHR0cHM6Ly90ZW5hbnQuYjJjbG9naW4uY29tLzY0YzlkNGY1LWE1NjAtNGI2NS05MDA0LTZkMWU1Y2NlZTUxZC92Mi4wLyJ9.ebMgCus6xlprrdmamM0CpfqXwnxzASh8O2r8u-OXG3eakHYIdy4sd-HSyQlLlvJv3qkCk5gV2Tg3x-j918Fm1RaYEslGt6xNffcgg9wazB1JNF3_AmAwi5m0N11htwlFuVylvlGrYMyzO16oNZTANCKEj12br-_flWvgKUt9CsuWeLTPsc_8rhnXX1Nzd1nWvzfn8kahmNvjiAmJ4Ywp295gvhOGoJDa2M-fme_sGWGhAW9T4mWvG8PhgMsf3jQ67h2h261mWZvt6mrHzm5U2ey3fIMa2KkB71Jkv3q7f9wsKOBIJNd131TnW56qji-M4L0Pt4N3Ld8xqmhriJBWfA'
      },
      expect: {
        result: true
      }
    }
  ])('%s', async (testCase) => {
    const result = await validateJwt(testCase.given.token)

    expect(result).toEqual(testCase.expect.result)
  })
})
