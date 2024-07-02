const config = require('../../../../app/config')
const status = require('../../../../app/constants/status')
const { userType } = require('../../../../app/constants/user-types')

let businessAppliedBefore

describe('Business Applied Before Tests', () => {
  let applicationApiMock

  beforeAll(() => {
    applicationApiMock = require('../../../../app/api-requests/application-api')
    jest.mock('../../../../app/api-requests/application-api')
    businessAppliedBefore = require('../../../../app/api-requests/business-applied-before')
    config.endemics.enabled = false
  })

  describe('Business is eligible when no existing applications found', () => {
    test('getLatestApplicationsBySbi is called', async () => {
      const SBI = 123456789
      applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce([])
      await businessAppliedBefore(SBI)
      expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledTimes(1)
      expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledWith(SBI)
    })

    test('No error is thrown', async () => {
      const SBI = 123456789
      applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce([])
      await expect(businessAppliedBefore(SBI)).resolves.toEqual(userType.NEW_USER)
    })
  })

  describe('Throw error when API errors', () => {
    test.each([
      { apiResponse: null },
      { apiResponse: undefined }
    ])('Business is not eligible when application API response is null or undefined', async ({ apiResponse }) => {
      const SBI = 123456789
      applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
      await expect(businessAppliedBefore(SBI)).rejects.toEqual(new Error('Bad response from API'))
    })
  })

  test('Business has a successful VV application within the last 10 months', async () => {
    const SBI = 123456789
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: '122333'
          },
          visitDate: new Date()
        },
        createdAt: '2020-06-06T13:52:14.207Z',
        updatedAt: '2020-06-06T13:52:14.207Z',
        statusId: status.READY_TO_PAY,
        type: 'VV'
      }
    ]
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
    await expect(businessAppliedBefore(SBI)).resolves.toEqual(userType.EXISTING_USER)
  })

  test('Business has a withdrawn VV application within the last 10 months', async () => {
    const SBI = 123456789
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: '122333'
          },
          visitDate: new Date()
        },
        createdAt: '2020-06-06T13:52:14.207Z',
        updatedAt: '2020-06-06T13:52:14.207Z',
        statusId: status.WITHDRAWN,
        type: 'VV'
      }
    ]
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
    await expect(businessAppliedBefore(SBI)).resolves.toEqual(userType.NEW_USER)
  })

  test('Business has a successful VV application NOT within the last 10 months', async () => {
    const SBI = 123456789
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: '122333'
          },
          visitDate: '2020-01-01'
        },
        createdAt: '2020-06-06T13:52:14.207Z',
        updatedAt: '2020-06-06T13:52:14.207Z',
        statusId: status.READY_TO_PAY,
        type: 'VV'
      }
    ]
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
    await expect(businessAppliedBefore(SBI)).resolves.toEqual(userType.NEW_USER)
  })

  test('Business has a withdrawn VV application within the last 10 months', async () => {
    const SBI = 123456789
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: '122333'
          },
          visitDate: '2020-01-01'
        },
        createdAt: '2020-06-06T13:52:14.207Z',
        updatedAt: '2020-06-06T13:52:14.207Z',
        statusId: status.WITHDRAWN,
        type: 'VV'
      }
    ]
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
    await expect(businessAppliedBefore(SBI)).resolves.toEqual(userType.NEW_USER)
  })
})
