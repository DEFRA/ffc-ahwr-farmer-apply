const parseRole = require('../../../../../app/auth/access-token/parse-role')

describe('parseRole', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    {
      toString: () => 'parseRole',
      given: {
        rolesToParse: [
          '5384769:Agent:3'
        ]
      },
      expect: {
        result: {
          roleNames: [
            'Agent'
          ],
          roles: [
            {
              relationshipId: '5384769',
              roleName: 'Agent',
              status: '3'
            }
          ]
        }
      }
    }
  ])('%s', async (testCase) => {
    const result = parseRole(testCase.given.rolesToParse)

    expect(result).toEqual(testCase.expect.result)
  })
})
