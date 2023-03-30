const { when, resetAllWhenMocks } = require('jest-when')
const tokenExpiry = require('../../../../../app/auth/auth-code-grant/token-expiry')
const session = require('../../../../../app/session')
const { tokens } = require('../../../../../app/session/keys')

const MOCK_NOW = new Date()

jest.mock('../../../../../app/session')

describe('tokenExpiry', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
    resetAllWhenMocks()
  })

  test.each([
    {
      toString: () => 'expiryToISODate',
      given: {
        expiresIn: 10
      },
      expect: {
        isoDate: new Date(MOCK_NOW.getTime() + 10 * 1000).toISOString()
      }
    }
  ])('%s', async (testCase) => {
    const isoDate = tokenExpiry.expiryToISODate(testCase.given.expiresIn)

    expect(isoDate).toEqual(testCase.expect.isoDate)
  })

  test.each([
    {
      toString: () => 'hasExpired - the stoken still has 10 seconds left',
      given: {
        request: {}
      },
      when: {
        tokenExpiry: new Date(MOCK_NOW.getTime() + 10 * 1000).toISOString()
      },
      expect: {
        hasExpired: false
      }
    },
    {
      toString: () => 'hasExpired - the token expired 10 seconds ago',
      given: {
        request: {}
      },
      when: {
        tokenExpiry: new Date(MOCK_NOW.getTime() - 10 * 1000).toISOString()
      },
      expect: {
        hasExpired: true
      }
    },
    {
      toString: () => 'hasExpired - the session contains no tokenExpiry date',
      given: {
        request: {}
      },
      when: {
        tokenExpiry: undefined
      },
      expect: {
        hasExpired: true
      }
    }
  ])('%s', async (testCase) => {
    when(session.getToken)
      .calledWith(
        testCase.given.request,
        tokens.tokenExpiry
      )
      .mockReturnValue(testCase.when.tokenExpiry)

    const hasExpired = tokenExpiry.hasExpired(testCase.given.request)

    expect(hasExpired).toEqual(testCase.expect.hasExpired)
  })
})
