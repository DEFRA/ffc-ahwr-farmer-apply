let businessEligibleToApply

describe('Business Eligble to Apply Tests', () => {
  let applicationApiMock

  beforeAll(() => {
    jest.mock('../../../../app/config')
    applicationApiMock = require('../../../../app/api-requests/application-api')
    jest.mock('../../../../app/api-requests/application-api')
    businessEligibleToApply = require('../../../../app/api-requests/business-eligble-to-apply')
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Business is eligible when no existing applications found', async () => {
    const SBI = 123456789
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce([])
    const result = await businessEligibleToApply(SBI)
    expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledTimes(1)
    expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledWith(SBI)
    expect(result).toEqual(true)
  })

  test.each([
    { apiResponse: null },
    { apiResponse: undefined }
  ])('Business is not eligible when application API response is null or undefined', async ({ apiResponse }) => {
    const SBI = 123456789
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
    const result = await businessEligibleToApply(SBI)
    expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledTimes(1)
    expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledWith(SBI)
    expect(result).toEqual(false)
  })

  test.each([
    {
      latestApplications: [
        {
          data: {
            organisation: {
              sbi: '122333'
            }
          },
          updatedAt: '2023-06-06T13:52:14.207Z',
          statusId: 2
        },
        {
          data: {
            organisation: {
              sbi: '122333'
            }
          },
          updatedAt: '2023-05-05T13:52:14.207Z',
          statusId: 1
        }
      ]
    },
    {
      latestApplications: [
        {
          data: {
            organisation: {
              sbi: '122333'
            }
          },
          updatedAt: '2023-06-06T13:52:14.207Z',
          statusId: 7
        }
      ]
    }
  ])('Business is eligible', async ({ latestApplications }) => {
    const SBI = 123456789
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
    const result = await businessEligibleToApply(SBI)
    expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledTimes(1)
    expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledWith(SBI)
    expect(result).toEqual(true)
  })
})
