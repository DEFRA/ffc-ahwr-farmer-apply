describe('business-email.schema', () => {
  const BUSINESS_EMAIL_SCHEMA = require('../../../../app/schemas/business-email.schema')

  test.each([
    {
      toString: () => 'valid email',
      given: {
        businessEmail: 'business@email.com'
      },
      expect: {
        result: {
          value: 'business@email.com'
        }
      }
    },
    {
      toString: () => 'valid uppercase email',
      given: {
        businessEmail: 'Business@email.com'
      },
      expect: {
        result: {
          value: 'business@email.com'
        }
      }
    },
    {
      toString: () => 'valid untrimmed email',
      given: {
        businessEmail: ' Business@email.com  '
      },
      expect: {
        result: {
          value: 'business@email.com'
        }
      }
    },
    {
      toString: () => 'invalid email',
      given: {
        businessEmail: 'business'
      },
      expect: {
        result: {
          value: 'business',
          error: {
            message: '"value" must be a valid email'
          }
        }
      }
    },
    {
      toString: () => 'not a string',
      given: {
        businessEmail: 1
      },
      expect: {
        result: {
          value: 1,
          error: {
            message: '"value" must be a string'
          }
        }
      }
    },
    {
      toString: () => 'empty email',
      given: {
        businessEmail: ''
      },
      expect: {
        result: {
          value: '',
          error: {
            message: '"value" is not allowed to be empty'
          }
        }
      }
    },
    {
      toString: () => 'invalid email - local part exceeds maximum length of 64',
      given: {
        businessEmail: 'a'.repeat(65) + '@email.com'
      },
      expect: {
        result: {
          value: 'a'.repeat(65) + '@email.com',
          error: {
            message: '"value" must be a valid email'
          }
        }
      }
    },
    {
      toString: () => 'invalid email - domain part exceeds maximum length of 255',
      given: {
        businessEmail: 'business@' + 'a'.repeat(256) + '.com'
      },
      expect: {
        result: {
          value: 'business@' + 'a'.repeat(256) + '.com',
          error: {
            message: '"value" must be a valid email'
          }
        }
      }
    },
    {
      toString: () => 'invalid email - tld is below the minimum length of 2',
      given: {
        businessEmail: 'business@email.c'
      },
      expect: {
        result: {
          value: 'business@email.c',
          error: {
            message: '"value" with value "business@email.c" fails to match the required pattern: /^([a-zA-Z0-9._+-]{1,64})@([a-zA-Z0-9.-]{1,255}\\.[a-zA-Z]{2,})$/'
          }
        }
      }
    },
    {
      toString: () => 'invalid email - contains invalid special characters',
      given: {
        businessEmail: 'business£5@email.com'
      },
      expect: {
        result: {
          value: 'business£5@email.com',
          error: {
            message: '"value" with value "business£5@email.com" fails to match the required pattern: /^([a-zA-Z0-9._+-]{1,64})@([a-zA-Z0-9.-]{1,255}\\.[a-zA-Z]{2,})$/'
          }
        }
      }
    },
    {
      toString: () => 'valid email - contains special characters',
      given: {
        businessEmail: 'business.-@email.com'
      },
      expect: {
        result: {
          value: 'business.-@email.com'
        }
      }
    }
  ])('%s', async (testCase) => {
    const result = BUSINESS_EMAIL_SCHEMA.validate(testCase.given.businessEmail)
    expect(result.value).toEqual(testCase.expect.result.value)
    if (typeof result.error === 'undefined') {
      expect(result.error).toBeUndefined()
    } else {
      expect(result.error.message).toEqual(testCase.expect.result.error.message)
    }
  })
})
