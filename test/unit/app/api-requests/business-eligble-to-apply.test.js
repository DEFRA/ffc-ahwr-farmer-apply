const config = require('../../../../app/config')
const CannotReapplyTimeLimitError = require('../../../../app/exceptions/CannotReapplyTimeLimitError')
const AlreadyAppliedError = require('../../../../app/exceptions/AlreadyAppliedError')

let businessEligibleToApply

describe('Business Eligible to Apply Tests', () => {
  let applicationApiMock

  beforeAll(() => {
    // jest.mock('../../../../app/config')
    applicationApiMock = require('../../../../app/api-requests/application-api')
    jest.mock('../../../../app/api-requests/application-api')
    businessEligibleToApply = require('../../../../app/api-requests/business-eligble-to-apply')
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('Business is eligible when no existing applications found', () => {
    test('getLatestApplicationsBySbi is called', async () => {
      const SBI = 123456789
      applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce([])
      await businessEligibleToApply(SBI)
      expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledTimes(1)
      expect(applicationApiMock.getLatestApplicationsBySbi).toHaveBeenCalledWith(SBI)
    })

    test('No error is thrown', async () => {
      const SBI = 123456789
      applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce([])
      await expect(businessEligibleToApply(SBI)).resolves.not.toThrow(new Error('Bad response from API'))
    })
  })

  test.each([
    { apiResponse: null },
    { apiResponse: undefined }
  ])('Business is not eligible when application API response is null or undefined', async ({ apiResponse }) => {
    const SBI = 123456789
    applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
    await expect(businessEligibleToApply(SBI)).rejects.toEqual(new Error('Bad response from API'))
  })

  describe('When 10 month rule toggle is enabled', () => {
    // TODO: Add tests for date returned (when appropriate)
    describe('When the previous application was within 10 months', () => {
      test.each([
        {
          latestApplications: [
            {
              data: {
                organisation: {
                  sbi: '122333'
                }
              },
              createdAt: '2023-06-06T13:52:14.207Z',
              updatedAt: '2023-06-06T13:52:14.207Z',
              statusId: 2
            },
            {
              data: {
                organisation: {
                  sbi: '122333'
                }
              },
              createdAt: '2023-05-06T13:52:14.207Z',
              updatedAt: '2023-05-06T13:52:14.207Z',
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
              createdAt: '2023-06-06T13:52:14.207Z',
              updatedAt: '2023-06-06T13:52:14.207Z',
              statusId: 7
            }
          ]
        }
      ])('Business is eligible when the last previous application had a status of WITHDRAWN (2) or NOT AGREED (7)', async ({ latestApplications }) => {
        const SBI = 123456789
        applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
        await expect(businessEligibleToApply(SBI)).resolves.not.toThrow(new Error('Bad response from API'))
      })

      describe('Business is not eligible when the last previous application had a status of anything other than WITHDRAWN (2), NOT AGREED (7), AGREED (1)', () => {
        // TODO: write out statuses...
        describe('Time limit error is returned with status of 3, 4, 5, 6, 8, 9 or 10', () => {
          test.each([
            {
              latestApplications: [
                {
                  data: {
                    organisation: {
                      sbi: '122333'
                    }
                  },
                  createdAt: '2023-06-06T13:52:14.207Z',
                  updatedAt: '2023-06-06T13:52:14.207Z',
                  statusId: 3
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
                  createdAt: '2023-06-06T13:52:14.207Z',
                  updatedAt: '2023-06-06T13:52:14.207Z',
                  statusId: 4
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
                  createdAt: '2023-06-06T13:52:14.207Z',
                  updatedAt: '2023-06-06T13:52:14.207Z',
                  statusId: 5
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
                  createdAt: '2023-06-06T13:52:14.207Z',
                  updatedAt: '2023-06-06T13:52:14.207Z',
                  statusId: 6
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
                  createdAt: '2023-06-06T13:52:14.207Z',
                  updatedAt: '2023-06-06T13:52:14.207Z',
                  statusId: 8
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
                  createdAt: '2023-06-06T13:52:14.207Z',
                  updatedAt: '2023-06-06T13:52:14.207Z',
                  statusId: 9
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
                  createdAt: '2023-06-06T13:52:14.207Z',
                  updatedAt: '2023-06-06T13:52:14.207Z',
                  statusId: 10
                }
              ]
            }
          ])('Status is 3, 4, 5, 6, 8, 9 or 10', async ({ latestApplications }) => {
            const SBI = 123456789
            applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
            await expect(businessEligibleToApply(SBI)).rejects.toEqual(new Error('Business is not eligible to apply due to 10 month restrictions since the last agreement.'))
          })
        })

        test('Business is not eligible when the last previous application was within 10 months and has a status of AGREED (1)', async () => {
          const SBI = 123456789
          const apiResponse = [
            {
              data: {
                organisation: {
                  sbi: '122333'
                }
              },
              createdAt: '2023-06-06T13:52:14.207Z',
              updatedAt: '2023-06-06T13:52:14.207Z',
              statusId: 1
            }
          ]
          applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
          await expect(businessEligibleToApply(SBI)).rejects.toEqual(new Error('Customer must claim or withdraw agreement before creating another.'))
        })
      })
    })

    describe('When the previous application was more than 10 months', () => {
      describe('Business is eligible when the last previous application had a status of anything other than WITHDRAWN (2), NOT AGREED (7), AGREED (1)', () => {
        // TODO: write out statuses...
        describe('Time limit error is not returned with status of 3, 4, 5, 6, 8, 9 or 10', () => {
          test.each([
            {
              latestApplications: [
                {
                  data: {
                    organisation: {
                      sbi: '122333'
                    }
                  },
                  createdAt: '2020-06-06T13:52:14.207Z',
                  updatedAt: '2020-06-06T13:52:14.207Z',
                  statusId: 3
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
                  createdAt: '2020-06-06T13:52:14.207Z',
                  updatedAt: '2020-06-06T13:52:14.207Z',
                  statusId: 4
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
                  createdAt: '2020-06-06T13:52:14.207Z',
                  updatedAt: '2020-06-06T13:52:14.207Z',
                  statusId: 5
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
                  createdAt: '2020-06-06T13:52:14.207Z',
                  updatedAt: '2020-06-06T13:52:14.207Z',
                  statusId: 6
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
                  createdAt: '2020-06-06T13:52:14.207Z',
                  updatedAt: '2020-06-06T13:52:14.207Z',
                  statusId: 8
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
                  createdAt: '2020-06-06T13:52:14.207Z',
                  updatedAt: '2020-06-06T13:52:14.207Z',
                  statusId: 9
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
                  createdAt: '2020-06-06T13:52:14.207Z',
                  updatedAt: '2020-06-06T13:52:14.207Z',
                  statusId: 10
                }
              ]
            }
          ])('status is 3, 4, 5, 6, 8, 9 or 10', async ({ latestApplications }) => {
            const SBI = 123456789
            applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
            await expect(businessEligibleToApply(SBI)).resolves.not.toThrow(new Error('Business is not eligible to apply due to 10 month restrictions since the last agreement.'))
          })
        })
      })
      test('Business is not eligible when the last previous application was longer than 10 months and has a status of AGREED (1)', async () => {
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
            statusId: 1
          }
        ]
        applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
        await expect(businessEligibleToApply(SBI)).rejects.toEqual(new Error('Customer must claim or withdraw agreement before creating another.'))
      })
    })

    test('Last application and next application dates are returned with a CannotReapplyTimeLimitError', async () => {
      const SBI = 123456789
      const apiResponse = [
        {
          data: {
            organisation: {
              sbi: '122333'
            }
          },
          createdAt: '2024-02-28T13:52:14.207Z',
          updatedAt: '2024-02-28T13:52:14.207Z',
          statusId: 4
        }
      ]
      const expectedError = new CannotReapplyTimeLimitError('Business is not eligible to apply due to 10 month restrictions since the last agreement.')
      const expectedErrorData = { lastApplicationDate: '28 February 2024', nextApplicationDate: '29 December 2024' }
      const wrongExpectedErrorData = { lastApplicationDate: '28 January 2024', nextApplicationDate: '29 Januaary 2024' }
      applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
      const thrownError = await businessEligibleToApply(SBI).catch(error => {
        return error
      })
      expect(thrownError).toEqual(expectedError)
      expect(thrownError.lastApplicationDate).toEqual(expectedErrorData.lastApplicationDate)
      expect(thrownError.lastApplicationDate).not.toEqual(wrongExpectedErrorData.lastApplicationDate)
      expect(thrownError.nextApplicationDate).toEqual(expectedErrorData.nextApplicationDate)
      expect(thrownError.nextApplicationDate).not.toEqual(wrongExpectedErrorData.nextApplicationDate)
    })
  })

  describe('When the 10 month rule toggle is not enabled', () => {
    beforeEach(() => {
      config.tenMonthRule.enabled = false
    })
    describe('Any new application is not allowed unless the last application has a status of Withdrawn (2) or Not Agreed (7)', () => {
      describe('When the previous application was within 10 months', () => {
        test.each([
          {
            latestApplications: [
              {
                data: {
                  organisation: {
                    sbi: '122333'
                  }
                },
                createdAt: '2023-06-06T13:52:14.207Z',
                updatedAt: '2023-06-06T13:52:14.207Z',
                statusId: 2
              },
              {
                data: {
                  organisation: {
                    sbi: '122333'
                  }
                },
                createdAt: '2023-05-06T13:52:14.207Z',
                updatedAt: '2023-05-06T13:52:14.207Z',
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
                createdAt: '2023-06-06T13:52:14.207Z',
                updatedAt: '2023-06-06T13:52:14.207Z',
                statusId: 7
              }
            ]
          }
        ])('Business is eligible when the last previous application had a status of WITHDRAWN (2) or NOT AGREED (7)', async ({ latestApplications }) => {
          const SBI = 123456789
          applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
          await expect(businessEligibleToApply(SBI)).resolves.not.toThrow(new Error('Bad response from API'))
        })

        describe('Business is not eligible when the last previous application had a status of anything other than WITHDRAWN (2), NOT AGREED (7), AGREED (1)', () => {
          // TODO: write out statuses...
          describe('Already Applied error is returned with status of 3, 4, 5, 6, 8, 9 or 10', () => {
            test.each([
              {
                latestApplications: [
                  {
                    data: {
                      organisation: {
                        sbi: '122333'
                      }
                    },
                    createdAt: '2023-06-06T13:52:14.207Z',
                    updatedAt: '2023-06-06T13:52:14.207Z',
                    statusId: 3
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
                    createdAt: '2023-06-06T13:52:14.207Z',
                    updatedAt: '2023-06-06T13:52:14.207Z',
                    statusId: 4
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
                    createdAt: '2023-06-06T13:52:14.207Z',
                    updatedAt: '2023-06-06T13:52:14.207Z',
                    statusId: 5
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
                    createdAt: '2023-06-06T13:52:14.207Z',
                    updatedAt: '2023-06-06T13:52:14.207Z',
                    statusId: 6
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
                    createdAt: '2023-06-06T13:52:14.207Z',
                    updatedAt: '2023-06-06T13:52:14.207Z',
                    statusId: 8
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
                    createdAt: '2023-06-06T13:52:14.207Z',
                    updatedAt: '2023-06-06T13:52:14.207Z',
                    statusId: 9
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
                    createdAt: '2023-06-06T13:52:14.207Z',
                    updatedAt: '2023-06-06T13:52:14.207Z',
                    statusId: 10
                  }
                ]
              }
            ])('Status is 3, 4, 5, 6, 8, 9 or 10', async ({ latestApplications }) => {
              const SBI = 123456789
              applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
              await expect(businessEligibleToApply(SBI)).rejects.toEqual(new AlreadyAppliedError('Business with SBI 122333 is not eligble to apply'))
            })
          })

          test('Business is not eligible when the last previous application was within 10 months and has a status of AGREED (1)', async () => {
            const SBI = 123456789
            const apiResponse = [
              {
                data: {
                  organisation: {
                    sbi: '122333'
                  }
                },
                createdAt: '2023-06-06T13:52:14.207Z',
                updatedAt: '2023-06-06T13:52:14.207Z',
                statusId: 1
              }
            ]
            applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
            await expect(businessEligibleToApply(SBI)).rejects.toEqual(new AlreadyAppliedError('Business with SBI 122333 is not eligble to apply'))
          })
        })
      })

      describe('When the previous application was more than 10 months', () => {
        describe('Business is eligible when the last previous application had a status of anything other than WITHDRAWN (2), NOT AGREED (7), AGREED (1)', () => {
          // TODO: write out statuses...
          describe('Time limit error is not returned with status of 3, 4, 5, 6, 8, 9 or 10', () => {
            test.each([
              {
                latestApplications: [
                  {
                    data: {
                      organisation: {
                        sbi: '122333'
                      }
                    },
                    createdAt: '2020-06-06T13:52:14.207Z',
                    updatedAt: '2020-06-06T13:52:14.207Z',
                    statusId: 3
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
                    createdAt: '2020-06-06T13:52:14.207Z',
                    updatedAt: '2020-06-06T13:52:14.207Z',
                    statusId: 4
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
                    createdAt: '2020-06-06T13:52:14.207Z',
                    updatedAt: '2020-06-06T13:52:14.207Z',
                    statusId: 5
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
                    createdAt: '2020-06-06T13:52:14.207Z',
                    updatedAt: '2020-06-06T13:52:14.207Z',
                    statusId: 6
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
                    createdAt: '2020-06-06T13:52:14.207Z',
                    updatedAt: '2020-06-06T13:52:14.207Z',
                    statusId: 8
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
                    createdAt: '2020-06-06T13:52:14.207Z',
                    updatedAt: '2020-06-06T13:52:14.207Z',
                    statusId: 9
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
                    createdAt: '2020-06-06T13:52:14.207Z',
                    updatedAt: '2020-06-06T13:52:14.207Z',
                    statusId: 10
                  }
                ]
              }
            ])('status is 3, 4, 5, 6, 8, 9 or 10', async ({ latestApplications }) => {
              const SBI = 123456789
              applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications)
              await expect(businessEligibleToApply(SBI)).rejects.toEqual(new AlreadyAppliedError('Business with SBI 122333 is not eligble to apply'))
            })
          })
        })
        test('Business is not eligible when the last previous application was longer than 10 months and has a status of AGREED (1)', async () => {
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
              statusId: 1
            }
          ]
          applicationApiMock.getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse)
          await expect(businessEligibleToApply(SBI)).rejects.toEqual(new AlreadyAppliedError('Business with SBI 122333 is not eligble to apply'))
        })
      })
    })
  })
})
