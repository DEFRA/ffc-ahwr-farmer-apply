const { when, resetAllWhenMocks } = require('jest-when')
const mockConfig = require('../../../../app/config')

describe('Get users', () => {
  let mockEligibilityApi
  let mockUsersFile
  let users

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
    resetAllWhenMocks()
  })

  describe('given the eligibilityApi feature toggle is enabled ', () => {
    beforeAll(() => {
      jest.mock('../../../../app/config', () => ({
        ...mockConfig,
        eligibilityApi: {
          enabled: true
        }
      }))

      jest.mock('../../../../app/api-requests/eligibility-api')
      mockEligibilityApi = require('../../../../app/api-requests/eligibility-api')

      jest.mock('../../../../app/api-requests/users-file')
      mockUsersFile = require('../../../../app/api-requests/users-file')

      users = require('../../../../app/api-requests/users')
    })

    test('it hits the eligibility api', async () => {
      const emailAddress = 'name@email.com'

      await users.getByEmail(emailAddress)

      expect(mockEligibilityApi.getEligibility).toHaveBeenCalledTimes(1)
      expect(mockEligibilityApi.getEligibility).toHaveBeenCalledWith(emailAddress)
    })
  })

  describe('given the eligibilityApi feature toggle is disabled', () => {
    beforeAll(() => {
      jest.mock('../../../../app/config', () => ({
        ...mockConfig,
        eligibilityApi: {
          enabled: false
        }
      }))

      jest.mock('../../../../app/api-requests/eligibility-api')
      mockEligibilityApi = require('../../../../app/api-requests/eligibility-api')

      jest.mock('../../../../app/api-requests/users-file')
      mockUsersFile = require('../../../../app/api-requests/users-file')

      users = require('../../../../app/api-requests/users')
    })

    test('it hits the users file', async () => {
      when(mockUsersFile.getUsers).mockResolvedValue([])
      const emailAddress = 'name@email.com'

      jest.mock('../../../../app/config', () => ({
        ...mockConfig,
        eligibilityApi: {
          enabled: false
        }
      }))

      await users.getByEmail(emailAddress)

      expect(mockUsersFile.getUsers).toHaveBeenCalledTimes(1)
    })
  })
})
