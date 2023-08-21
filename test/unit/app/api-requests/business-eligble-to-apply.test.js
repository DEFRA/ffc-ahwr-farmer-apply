let businessEligibleToApply

describe('Business Eligible to Apply Tests', () => {
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
    await businessEligibleToApply(SBI)
    expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledTimes(1)
    expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledWith(SBI)
    // expect nothing to happen...
    // await expect(businessEligibleToApply(SBI)).rejects.toBeFalsy();
    // await expect(businessEligibleToApply(SBI)).resolves.toBeTruthy();
  })

  test.each([
    { apiResponse: null },
    { apiResponse: undefined }
  ])('Business is not eligible when application API response is null or undefined', async ({ apiResponse }) => {
    const SBI = 123456789
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
    await expect(businessEligibleToApply(SBI)).rejects.toEqual(new Error('Bad response from API'))
    await expect(businessEligibleToApply(SBI)).rejects.toBeTruthy();
  })

  xtest.each([
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
          updatedAt: '2022-05-05T13:52:14.207Z',
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
          updatedAt: '2022-06-06T13:52:14.207Z',
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
    await expect(businessEligibleToApply(SBI)).rejects.toBeFalsy();
    
  })

  xtest.each([
    {
      latestApplications: [
        {
          data: {
            organisation: {
              sbi: '122333'
            }
          },
          updatedAt: '2023-06-06T13:52:14.207Z',
          statusId: 5
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
          statusId: 1
        }
      ]
    }
  ])('Business is not eligible', async ({ latestApplications }) => {
    // Need to expand this to other scenarios
    const SBI = 123456789
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
    const result = await businessEligibleToApply(SBI)
    expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledTimes(1)
    expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledWith(SBI)
    expect(result).toEqual(false)
  })
})
