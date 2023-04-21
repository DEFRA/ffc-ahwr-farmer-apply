const cphCheck = require('../../../../../app/api-requests/rpa-api/cph-check')

describe('CPH check', () => {
  test.each([
    {
      toString: () => 'Both CPH numbers are valid',
      given: {
        cphNumbers: [
          '08/178/0064',
          '21/421/0146'
        ]
      },
      expect: {
        error: false
      }
    },
    {
      toString: () => 'Both CPH numbers are invalid',
      given: {
        cphNumbers: [
          '52/178/0064',
          '21/421/8000'
        ]
      },
      expect: {
        error: 'Customer must have at least one valid CPH'
      }
    },
    {
      toString: () => 'Only last CPH is valid',
      given: {
        cphNumbers: [
          '52/178/0064',
          '21/421/8000',
          '21/421/7999'
        ]
      },
      expect: {
        error: false
      }
    },
    {
      toString: () => 'No CPH numbers',
      given: {
        cphNumbers: []
      },
      expect: {
        error: 'Customer must have at least one valid CPH'
      }
    }
  ])('%s', async (testCase) => {
    if (testCase.expect.error) {
      expect(
        () => cphCheck.customerMustHaveAtLeastOneValidCph(testCase.given.cphNumbers)
      ).toThrowError(testCase.expect.error)
    } else {
      expect(
        cphCheck.customerMustHaveAtLeastOneValidCph(testCase.given.cphNumbers)
      ).toEqual(true)
    }
  })
})
