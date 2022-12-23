const userSchema = require('../../../../app/api-requests/user.schema')

describe('User schema', () => {
  test.each([
    {
      validUser: {
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        sbi: '441111114',
        crn: '4411111144',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      }
    }
  ])('validate($validUser) => no errors', (testCase) => {
    const result = userSchema.validate(testCase.validUser)

    expect(result.value).toEqual(testCase.validUser)
    expect(result.error).toBeUndefined()
  })

  test.each([
    {
      invalidUser: {
        name: 'David\'s Farm',
        sbi: '441111114',
        crn: '4411111144',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      },
      errorMessage: '"farmerName" is required'
    },
    {
      invalidUser: {
        farmerName: 'David Smith',
        sbi: '441111114',
        crn: '4411111144',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      },
      errorMessage: '"name" is required'
    },
    {
      invalidUser: {
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        crn: '4411111144',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      },
      errorMessage: '"sbi" is required'
    },
    {
      invalidUser: {
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        sbi: '44111111',
        crn: '4411111144',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      },
      errorMessage: '"sbi" with value "44111111" fails to match the required pattern: /^\\d{9}$/'
    },
    {
      invalidUser: {
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        sbi: '441111114',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      },
      errorMessage: '"crn" is required'
    },
    {
      invalidUser: {
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        sbi: '441111114',
        crn: '441111114',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      },
      errorMessage: '"crn" with value "441111114" fails to match the required pattern: /^\\d{10}$/'
    },
    {
      invalidUser: {
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        sbi: '441111114',
        crn: '4411111144',
        email: 'name@email.com'
      },
      errorMessage: '"address" is required'
    },
    {
      invalidUser: {
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        sbi: '441111114',
        crn: '4411111144',
        address: 'Some Road, London, MK55 7ES'
      },
      errorMessage: '"email" is required'
    }
  ])('validate($invalidUser) => $errorMessage', (testCase) => {
    const result = userSchema.validate(testCase.invalidUser)

    expect(result.value).toEqual(testCase.invalidUser)
    expect(result.error.message).toEqual(testCase.errorMessage)
  })
})
