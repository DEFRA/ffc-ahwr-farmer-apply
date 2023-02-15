describe('Get users', () => {
  let mockEligibilityApi
  let users
  beforeAll(() => {
    jest.mock('../../../../app/config')

    jest.mock('../../../../app/api-requests/eligibility-api')
    mockEligibilityApi = require('../../../../app/api-requests/eligibility-api')

    users = require('../../../../app/api-requests/users')
  })

  test('it hits the eligibility api', async () => {
    const emailAddress = 'name@email.com'

    await users.getByEmail(emailAddress)

    expect(mockEligibilityApi.getEligibility).toHaveBeenCalledTimes(1)
    expect(mockEligibilityApi.getEligibility).toHaveBeenCalledWith(emailAddress)
  })
})
