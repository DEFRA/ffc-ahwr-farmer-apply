const config = require('../../../../app/config')
const status = require('../../../../app/constants/status')
const { appliedBefore } = require('../../../../app/constants/user-types')
const { CannotReapplyTimeLimitError, OutstandingAgreementError, AlreadyAppliedError } = require('../../../../app/exceptions')

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

  // describe('When 10 month rule toggle is enabled', () => {
  //   beforeEach(() => {
  //     config.tenMonthRule.enabled = true
  //   })
  //   describe('When the previous application was within 10 months', () => {
  //     test.each([
  //       {
  //         latestApplications: [
  //           {
  //             data: {
  //               organisation: {
  //                 sbi: '122333'
  //               }
  //             },
  //             createdAt: '2023-06-06T13:52:14.207Z',
  //             updatedAt: '2023-06-06T13:52:14.207Z',
  //             statusId: 2
  //           },
  //           {
  //             data: {
  //               organisation: {
  //                 sbi: '122333'
  //               }
  //             },
  //             createdAt: '2023-05-06T13:52:14.207Z',
  //             updatedAt: '2023-05-06T13:52:14.207Z',
  //             statusId: 1
  //           }
  //         ]
  //       },
  //       {
  //         latestApplications: [
  //           {
  //             data: {
  //               organisation: {
  //                 sbi: '122333'
  //               }
  //             },
  //             createdAt: '2023-06-06T13:52:14.207Z',
  //             updatedAt: '2023-06-06T13:52:14.207Z',
  //             statusId: 7
  //           }
  //         ]
  //       }
  //     ])('Business is eligible when the last previous application had a status of WITHDRAWN (2) or NOT AGREED (7)', async ({ latestApplications }) => {
  //       const SBI = 123456789
  //       applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
  //       await expect(businessAppliedBefore(SBI)).resolves.not.toThrow(new Error())
  //     })

  //     describe('Business is not eligible when the last previous application had a status of anything other than WITHDRAWN (2), NOT AGREED (7), AGREED (1)', () => {
  //       describe('Time limit error is returned with status of DATA INPUTTED (3), CLAIMED (4), IN CHECK (5), ACCEPTED (6), PAID (8), READY TO PAY (9), REJECTED (10) or ON HOLD (11)', () => {
  //         test.each([
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2023-06-06T13:52:14.207Z',
  //                 updatedAt: '2023-06-06T13:52:14.207Z',
  //                 statusId: 3
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2023-06-06T13:52:14.207Z',
  //                 updatedAt: '2023-06-06T13:52:14.207Z',
  //                 statusId: 4
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2023-06-06T13:52:14.207Z',
  //                 updatedAt: '2023-06-06T13:52:14.207Z',
  //                 statusId: 5
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2023-06-06T13:52:14.207Z',
  //                 updatedAt: '2023-06-06T13:52:14.207Z',
  //                 statusId: 6
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2023-06-06T13:52:14.207Z',
  //                 updatedAt: '2023-06-06T13:52:14.207Z',
  //                 statusId: 8
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2023-06-06T13:52:14.207Z',
  //                 updatedAt: '2023-06-06T13:52:14.207Z',
  //                 statusId: 9
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2023-06-06T13:52:14.207Z',
  //                 updatedAt: '2023-06-06T13:52:14.207Z',
  //                 statusId: 10
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2023-06-06T13:52:14.207Z',
  //                 updatedAt: '2023-06-06T13:52:14.207Z',
  //                 statusId: 11
  //               }
  //             ]
  //           }
  //         ])('Status is DATA INPUTTED (3), CLAIMED (4), IN CHECK (5), ACCEPTED (6), PAID (8), READY TO PAY (9), REJECTED (10) or ON HOLD (11)', async ({ latestApplications }) => {
  //           const SBI = 123456789
  //           applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
  //           await expect(businessAppliedBefore(SBI)).rejects.toEqual(new CannotReapplyTimeLimitError('Business with SBI 122333 is not eligible to apply due to 10 month restrictions since the last agreement.'))
  //         })
  //       })

  //       test('When the last previous application has a status of AGREED (1)', async () => {
  //         const SBI = 123456789
  //         const apiResponse = [
  //           {
  //             data: {
  //               organisation: {
  //                 sbi: '122333'
  //               }
  //             },
  //             createdAt: '2023-06-06T13:52:14.207Z',
  //             updatedAt: '2023-06-06T13:52:14.207Z',
  //             statusId: 1
  //           }
  //         ]
  //         applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
  //         await expect(businessAppliedBefore(SBI)).rejects.toEqual(new OutstandingAgreementError('Business with SBI 122333 must claim or withdraw agreement before creating another.'))
  //       })
  //     })
  //   })

  //   describe('When the previous application was more than 10 months', () => {
  //     describe('Business is eligible when the last previous application had a status of anything other than WITHDRAWN (2), NOT AGREED (7), AGREED (1)', () => {
  //       describe('Time limit error is not returned with status of DATA INPUTTED (3), CLAIMED (4), IN CHECK (5), ACCEPTED (6), PAID (8), READY TO PAY (9), REJECTED (10) or ON HOLD (11)', () => {
  //         test.each([
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2020-06-06T13:52:14.207Z',
  //                 updatedAt: '2020-06-06T13:52:14.207Z',
  //                 statusId: 3
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2020-06-06T13:52:14.207Z',
  //                 updatedAt: '2020-06-06T13:52:14.207Z',
  //                 statusId: 4
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2020-06-06T13:52:14.207Z',
  //                 updatedAt: '2020-06-06T13:52:14.207Z',
  //                 statusId: 5
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2020-06-06T13:52:14.207Z',
  //                 updatedAt: '2020-06-06T13:52:14.207Z',
  //                 statusId: 6
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2020-06-06T13:52:14.207Z',
  //                 updatedAt: '2020-06-06T13:52:14.207Z',
  //                 statusId: 8
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2020-06-06T13:52:14.207Z',
  //                 updatedAt: '2020-06-06T13:52:14.207Z',
  //                 statusId: 9
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2020-06-06T13:52:14.207Z',
  //                 updatedAt: '2020-06-06T13:52:14.207Z',
  //                 statusId: 10
  //               }
  //             ]
  //           },
  //           {
  //             latestApplications: [
  //               {
  //                 data: {
  //                   organisation: {
  //                     sbi: '122333'
  //                   }
  //                 },
  //                 createdAt: '2020-06-06T13:52:14.207Z',
  //                 updatedAt: '2020-06-06T13:52:14.207Z',
  //                 statusId: 11
  //               }
  //             ]
  //           }
  //         ])('status is DATA INPUTTED (3), CLAIMED (4), IN CHECK (5), ACCEPTED (6), PAID (8), READY TO PAY (9), REJECTED (10) or ON HOLD (11)', async ({ latestApplications }) => {
  //           const SBI = 123456789
  //           applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
  //           await expect(businessAppliedBefore(SBI)).resolves.not.toThrow(new CannotReapplyTimeLimitError('Business with SBI 122333 is not eligible to apply due to 10 month restrictions since the last agreement.'))
  //         })
  //       })
  //     })
  //     test('Business is not eligible when the last previous application was longer than 10 months and has a status of AGREED (1)', async () => {
  //       const SBI = 123456789
  //       const apiResponse = [
  //         {
  //           data: {
  //             organisation: {
  //               sbi: '122333'
  //             }
  //           },
  //           createdAt: '2020-06-06T13:52:14.207Z',
  //           updatedAt: '2020-06-06T13:52:14.207Z',
  //           statusId: 1
  //         }
  //       ]
  //       applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
  //       await expect(businessAppliedBefore(SBI)).rejects.toEqual(new OutstandingAgreementError('Business with SBI 122333 must claim or withdraw agreement before creating another.'))
  //     })
  //   })

  //   test('Last application and next application dates are returned with a CannotReapplyTimeLimitError', async () => {
  //     const SBI = 123456789
  //     const apiResponse = [
  //       {
  //         data: {
  //           organisation: {
  //             sbi: '122333'
  //           }
  //         },
  //         createdAt: '2024-02-28T13:52:14.207Z',
  //         updatedAt: '2024-02-28T13:52:14.207Z',
  //         statusId: 4
  //       }
  //     ]
  //     const expectedError = new CannotReapplyTimeLimitError('Business with SBI 122333 is not eligible to apply due to 10 month restrictions since the last agreement.')
  //     const expectedErrorData = { lastApplicationDate: '28 February 2024', nextApplicationDate: '29 December 2024' }
  //     const wrongExpectedErrorData = { lastApplicationDate: '28 January 2024', nextApplicationDate: '29 Januaary 2024' }
  //     applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
  //     const thrownError = await businessAppliedBefore(SBI).catch(error => {
  //       return error
  //     })
  //     expect(thrownError).toEqual(expectedError)
  //     expect(thrownError.lastApplicationDate).toEqual(expectedErrorData.lastApplicationDate)
  //     expect(thrownError.lastApplicationDate).not.toEqual(wrongExpectedErrorData.lastApplicationDate)
  //     expect(thrownError.nextApplicationDate).toEqual(expectedErrorData.nextApplicationDate)
  //     expect(thrownError.nextApplicationDate).not.toEqual(wrongExpectedErrorData.nextApplicationDate)
  //   })
  // })

  // // This has not been updated for a status of On Hold because it should be removed with the feature toggle (at some point)
  // describe('When the 10 month rule toggle is not enabled', () => {
  //   beforeEach(() => {
  //     config.tenMonthRule.enabled = false
  //   })
  //   describe('Any new application is not allowed unless the last application has a status of Withdrawn (2) or Not Agreed (7)', () => {
  //     describe('When the previous application was within 10 months', () => {
  //       test.each([
  //         {
  //           latestApplications: [
  //             {
  //               data: {
  //                 organisation: {
  //                   sbi: '122333'
  //                 }
  //               },
  //               createdAt: '2023-06-06T13:52:14.207Z',
  //               updatedAt: '2023-06-06T13:52:14.207Z',
  //               statusId: 2
  //             },
  //             {
  //               data: {
  //                 organisation: {
  //                   sbi: '122333'
  //                 }
  //               },
  //               createdAt: '2023-05-06T13:52:14.207Z',
  //               updatedAt: '2023-05-06T13:52:14.207Z',
  //               statusId: 1
  //             }
  //           ]
  //         },
  //         {
  //           latestApplications: [
  //             {
  //               data: {
  //                 organisation: {
  //                   sbi: '122333'
  //                 }
  //               },
  //               createdAt: '2023-06-06T13:52:14.207Z',
  //               updatedAt: '2023-06-06T13:52:14.207Z',
  //               statusId: 7
  //             }
  //           ]
  //         }
  //       ])('Business is eligible when the last previous application had a status of WITHDRAWN (2) or NOT AGREED (7)', async ({ latestApplications }) => {
  //         const SBI = 123456789
  //         applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
  //         await expect(businessAppliedBefore(SBI)).resolves.not.toThrow(new Error())
  //       })

  //       describe('Business is not eligible when the last previous application had a status of anything other than WITHDRAWN (2), NOT AGREED (7), AGREED (1)', () => {
  //         describe('Already Applied error is returned with status of DATA INPUTTED (3), CLAIMED (4), IN CHECK (5), ACCEPTED (6), PAID (8), READY TO PAY (9) or REJECTED (10)', () => {
  //           test.each([
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2023-06-06T13:52:14.207Z',
  //                   updatedAt: '2023-06-06T13:52:14.207Z',
  //                   statusId: 3
  //                 }
  //               ]
  //             },
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2023-06-06T13:52:14.207Z',
  //                   updatedAt: '2023-06-06T13:52:14.207Z',
  //                   statusId: 4
  //                 }
  //               ]
  //             },
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2023-06-06T13:52:14.207Z',
  //                   updatedAt: '2023-06-06T13:52:14.207Z',
  //                   statusId: 5
  //                 }
  //               ]
  //             },
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2023-06-06T13:52:14.207Z',
  //                   updatedAt: '2023-06-06T13:52:14.207Z',
  //                   statusId: 6
  //                 }
  //               ]
  //             },
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2023-06-06T13:52:14.207Z',
  //                   updatedAt: '2023-06-06T13:52:14.207Z',
  //                   statusId: 8
  //                 }
  //               ]
  //             },
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2023-06-06T13:52:14.207Z',
  //                   updatedAt: '2023-06-06T13:52:14.207Z',
  //                   statusId: 9
  //                 }
  //               ]
  //             },
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2023-06-06T13:52:14.207Z',
  //                   updatedAt: '2023-06-06T13:52:14.207Z',
  //                   statusId: 10
  //                 }
  //               ]
  //             }
  //           ])('Status is DATA INPUTTED (3), CLAIMED (4), IN CHECK (5), ACCEPTED (6), PAID (8), READY TO PAY (9) or REJECTED (10)', async ({ latestApplications }) => {
  //             const SBI = 123456789
  //             applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
  //             await expect(businessAppliedBefore(SBI)).rejects.toEqual(new AlreadyAppliedError('Business with SBI 122333 is not eligible to apply'))
  //           })
  //         })

  //         test('Business is not eligible when the last previous application was within 10 months and has a status of AGREED (1)', async () => {
  //           const SBI = 123456789
  //           const apiResponse = [
  //             {
  //               data: {
  //                 organisation: {
  //                   sbi: '122333'
  //                 }
  //               },
  //               createdAt: '2023-06-06T13:52:14.207Z',
  //               updatedAt: '2023-06-06T13:52:14.207Z',
  //               statusId: 1
  //             }
  //           ]
  //           applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
  //           await expect(businessAppliedBefore(SBI)).rejects.toEqual(new AlreadyAppliedError('Business with SBI 122333 is not eligible to apply'))
  //         })
  //       })
  //     })

  //     describe('When the previous application was more than 10 months', () => {
  //       describe('Business is not eligible when the last previous application had a status of anything other than WITHDRAWN (2), NOT AGREED (7), AGREED (1)', () => {
  //         // TODO: write out statuses...
  //         describe('AlreadyAppliedError is returned with status of DATA INPUTTED (3), CLAIMED (4), IN CHECK (5), ACCEPTED (6), PAID (8), READY TO PAY (9) or REJECTED (10)', () => {
  //           test.each([
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2020-06-06T13:52:14.207Z',
  //                   updatedAt: '2020-06-06T13:52:14.207Z',
  //                   statusId: 3
  //                 }
  //               ]
  //             },
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2020-06-06T13:52:14.207Z',
  //                   updatedAt: '2020-06-06T13:52:14.207Z',
  //                   statusId: 4
  //                 }
  //               ]
  //             },
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2020-06-06T13:52:14.207Z',
  //                   updatedAt: '2020-06-06T13:52:14.207Z',
  //                   statusId: 5
  //                 }
  //               ]
  //             },
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2020-06-06T13:52:14.207Z',
  //                   updatedAt: '2020-06-06T13:52:14.207Z',
  //                   statusId: 6
  //                 }
  //               ]
  //             },
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2020-06-06T13:52:14.207Z',
  //                   updatedAt: '2020-06-06T13:52:14.207Z',
  //                   statusId: 8
  //                 }
  //               ]
  //             },
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2020-06-06T13:52:14.207Z',
  //                   updatedAt: '2020-06-06T13:52:14.207Z',
  //                   statusId: 9
  //                 }
  //               ]
  //             },
  //             {
  //               latestApplications: [
  //                 {
  //                   data: {
  //                     organisation: {
  //                       sbi: '122333'
  //                     }
  //                   },
  //                   createdAt: '2020-06-06T13:52:14.207Z',
  //                   updatedAt: '2020-06-06T13:52:14.207Z',
  //                   statusId: 10
  //                 }
  //               ]
  //             }
  //           ])('status is DATA INPUTTED (3), CLAIMED (4), IN CHECK (5), ACCEPTED (6), PAID (8), READY TO PAY (9) or REJECTED (10)', async ({ latestApplications }) => {
  //             const SBI = 123456789
  //             applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
  //             await expect(businessAppliedBefore(SBI)).rejects.toEqual(new AlreadyAppliedError('Business with SBI 122333 is not eligible to apply'))
  //           })
  //         })
  //       })
  //       test('Business is not eligible when the last previous application was longer than 10 months and has a status of AGREED (1)', async () => {
  //         const SBI = 123456789
  //         const apiResponse = [
  //           {
  //             data: {
  //               organisation: {
  //                 sbi: '122333'
  //               }
  //             },
  //             createdAt: '2020-06-06T13:52:14.207Z',
  //             updatedAt: '2020-06-06T13:52:14.207Z',
  //             statusId: 1
  //           }
  //         ]
  //         applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
  //         await expect(businessAppliedBefore(SBI)).rejects.toEqual(new AlreadyAppliedError('Business with SBI 122333 is not eligible to apply'))
  //       })
  //     })
  //   })
  // })
})
