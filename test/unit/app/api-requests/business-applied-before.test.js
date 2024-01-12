const config = require('../../../../app/config')
const status = require('../../../../app/constants/status')
const { appliedBefore } = require('../../../../app/constants/user-types')
const { OutstandingAgreementError, AlreadyAppliedError } = require('../../../../app/exceptions')

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
      await expect(businessAppliedBefore(SBI)).resolves.toEqual(appliedBefore.NEW_USER)
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

  test('Business has already agreed to an endemics application', async () => {
    config.endemics.enabled = true
    const SBI = 123456789
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: '122333'
          }
        },
        createdAt: '2020-06-06T13:52:14.207Z',
        updatedAt: '2020-06-06T13:52:14.207Z',
        statusId: status.AGREED,
        type: 'EE'
      }
    ]
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
    await expect(businessAppliedBefore(SBI)).rejects.toEqual(new AlreadyAppliedError('Business with SBI 122333 already has an endemics agreement'))
  })

  test('Business has an open VV application', async () => {
    const SBI = 123456789
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: '122333'
          }
        },
        createdAt: '2020-06-06T13:52:14.207Z',
        updatedAt: '2020-06-06T13:52:14.207Z',
        statusId: status.AGREED,
        type: 'VV'
      }
    ]
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
    await expect(businessAppliedBefore(SBI)).rejects.toEqual(new OutstandingAgreementError('Business with SBI 122333 must claim or withdraw agreement before creating another.'))
  })

  test('Business has a closed VV application', async () => {
    const SBI = 123456789
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: '122333'
          }
        },
        createdAt: '2020-06-06T13:52:14.207Z',
        updatedAt: '2020-06-06T13:52:14.207Z',
        statusId: status.READY_TO_PAY,
        type: 'VV'
      }
    ]
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
    await expect(businessAppliedBefore(SBI)).resolves.toEqual(appliedBefore.EXISTING_USER)
  })

  test('Business has a closed VV application and a more recent open VV application', async () => {
    const SBI = 123456789
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: '122333'
          }
        },
        createdAt: '2020-06-06T13:52:14.207Z',
        updatedAt: '2020-06-06T13:52:14.207Z',
        statusId: status.READY_TO_PAY,
        type: 'VV'
      },
      {
        data: {
          organisation: {
            sbi: '122333'
          }
        },
        createdAt: '2021-06-06T13:52:14.207Z',
        updatedAt: '2021-06-06T13:52:14.207Z',
        statusId: status.AGREED,
        type: 'VV'
      }
    ]
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
    await expect(businessAppliedBefore(SBI)).rejects.toEqual(new OutstandingAgreementError('Business with SBI 122333 must claim or withdraw agreement before creating another.'))
  })

  test('Business has a closed VV application and an agreed EE application', async () => {
    const SBI = 123456789
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: '122333'
          }
        },
        createdAt: '2021-06-06T13:52:14.207Z',
        updatedAt: '2021-06-06T13:52:14.207Z',
        statusId: status.AGREED,
        type: 'EE'
      },
      {
        data: {
          organisation: {
            sbi: '122333'
          }
        },
        createdAt: '2020-06-06T13:52:14.207Z',
        updatedAt: '2020-06-06T13:52:14.207Z',
        statusId: status.READY_TO_PAY,
        type: 'VV'
      }
    ]
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
    await expect(businessAppliedBefore(SBI)).rejects.toEqual(new AlreadyAppliedError('Business with SBI 122333 already has an endemics agreement'))
  })
})
