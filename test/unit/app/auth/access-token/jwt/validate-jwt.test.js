const Wreck = require('@hapi/wreck')
const { when, resetAllWhenMocks } = require('jest-when')

jest.mock('@hapi/wreck')

describe('validateJwt', () => {
  let validateJwt

  beforeAll(() => {
    jest.mock('../../../../../../app/config', () => ({
      ...jest.requireActual('../../../../../../app/config'),
      authConfig: {
        defraId: {
          hostname: 'hostname',
          tenantName: 'azdcuspoc5'
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
              kid: 'xlefxE6JUu71Sm4d2p484HtEf82b8h58xto47x82dH8',
              use: 'sig',
              kty: 'RSA',
              e: 'AQAB',
              n: '311vB5yxY-Ena-fKDzxBPz_Q3F1xY-L_3GX6a8piFYpFtag_7asO_6gSq51AWH6asHGPH7y5bFb5b0P4BsDOpxLRQNhOgUGW3uPRfSqLUIvTEYd_oeRAqWBIMZApm-7YQwX0ZLjn-7jwI85NsKvP3CGIAf6EVVN51mz4OI3LOKP3lPnftTHn8FXCFSg1iLmdsto12k7eIQ13kAjq9jjBtunAHkbHYEpWV-AYpz4qFkDqScVwfUs6UsgvGREv3luXWiWK3pVpxlroV8A4VYvBpELKJnM51psDmp2InKZaz1LpDSY55hEwI_Z8-1oKe39O1PVUkRD7z4Yz8ukEo30LLQ'
            }
          ]
        }
      })

    validateJwt = require('../../../../../../app/auth/access-token/jwt/validate-jwt')
  })

  afterEach(() => {
    jest.clearAllMocks()
    resetAllWhenMocks()
  })

  test.each([
    {
      toString: () => 'validateJwt',
      given: {
        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6InhsZWZ4RTZKVXU3MVNtNGQycDQ4NEh0RWY4MmI4aDU4eHRvNDd4ODJkSDgifQ.eyJpc3MiOiJodHRwczovL2F6ZGN1c3BvYzUuYjJjbG9naW4uY29tLzY0YzlkNGY1LWE1NjAtNGI2NS05MDA0LTZkMWU1Y2NlZTUxZC92Mi4wLyIsImV4cCI6MTY3OTY2ODMzNCwibmJmIjoxNjc5NjY0NzM0LCJhdWQiOiI4M2QyYjE2MC03NGNlLTQzNTYtOTcwOS0zZjhkYTc4NjhlMzUiLCJhYWwiOiIxIiwic2VydmljZUlkIjoiMmE2NzJlZTYtNzc1MC1lZDExLWJiYTMtMDAwZDNhZGY3MDQ3IiwiY29ycmVsYXRpb25JZCI6IjE2NzZlZTFiLTZmYjktNGYxMi1iMDYwLTIwYmUzMGEwNTgzZSIsImN1cnJlbnRSZWxhdGlvbnNoaXBJZCI6IjUzODQ3NjkiLCJzZXNzaW9uSWQiOiJkNmM2OGE1NS0wMjk3LTQzOGYtOGU1Yi0xNThjNTM1M2MxYzgiLCJzdWIiOiIwN2ZmNzQ2Ny02YTEyLTRmOGItYTg0ZS0yNDllMzY5YjBmODEiLCJlbWFpbCI6InN0ZXBoZW5jcmF3Zm9yZGRAZHJvZndhcmNuZWhwZXRzYi5jb20udGVzdCIsImNvbnRhY3RJZCI6IjExMDQ1NTMwOTAiLCJmaXJzdE5hbWUiOiJTdGVwaGVuIiwibGFzdE5hbWUiOiJDcmF3Zm9yZCIsImxvYSI6MSwiZW5yb2xtZW50Q291bnQiOjUwNSwiZW5yb2xtZW50UmVxdWVzdENvdW50IjowLCJyZWxhdGlvbnNoaXBzIjpbIjUzODQ3Njk6MTA3MTY2NjU1OkEgRSBTIEpBUlJFVFQ6MTpFeHRlcm5hbDowIl0sInJvbGVzIjpbIjUzODQ3Njk6QWdlbnQ6MyJdLCJub25jZSI6IjRmMmY4YjZmLTcxMTktNDk5Zi05ZjUyLWE4OTg3Mzg2ZmVhNCIsImF6cCI6IjgzZDJiMTYwLTc0Y2UtNDM1Ni05NzA5LTNmOGRhNzg2OGUzNSIsInZlciI6IjEuMCIsImlhdCI6MTY3OTY2NDczNH0.W0JADbZdrtDqz1IC0n4kCjFj7HXvDXYTPuRX3dojr9x5EsBuIhIRqzpGrOI-xBLXc63S-bvu9f1EjYq5fhAkShOQXE2yzNyRYWWq2qvVD0K2W156l_tjVwTeI0LeeW_CAbBtzPjaw-2l4Ad4Q09dZccj5vETJC3MypCpYjoVGrAuod4b9mt6w4049HfPcfsNikvcqplC58fVQ9mhwwX1LOsFhZ8sNfkXQfMExG7WzlkEIH8LSUW2L6L2kAREpe0qbLQ-xDJVYVOLW_Mj2E01GurZjNb2sVxtF66Tfo08KyGKfZTk3mobi6hRzVJKaIeefohvuKH0c9jpUUvoaIhcqA'
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
