const businessSchema = require('../../../../app/api-requests/business.schema')

describe('Business schema', () => {
  test.each([
    {
      validBusiness: {
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        sbi: '441111114',
        crn: '4411111144',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      }
    }
  ])('validate($validBusiness) => no errors', (testCase) => {
    const result = businessSchema.validate(testCase.validBusiness)

    expect(result.value).toEqual(testCase.validBusiness)
    expect(result.error).toBeUndefined()
  })

  test.each([
    {
      invalidBusiness: {
        name: 'David\'s Farm',
        sbi: '441111114',
        crn: '4411111144',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      },
      errorMessage: '"farmerName" is required'
    },
    {
      invalidBusiness: {
        farmerName: 'David Smith',
        sbi: '441111114',
        crn: '4411111144',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      },
      errorMessage: '"name" is required'
    },
    {
      invalidBusiness: {
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        crn: '4411111144',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      },
      errorMessage: '"sbi" is required'
    },
    {
      invalidBusiness: {
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
      invalidBusiness: {
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        sbi: '441111114',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      },
      errorMessage: '"crn" is required'
    },
    {
      invalidBusiness: {
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
      invalidBusiness: {
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        sbi: '441111114',
        crn: '4411111144',
        email: 'name@email.com'
      },
      errorMessage: '"address" is required'
    },
    {
      invalidBusiness: {
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        sbi: '441111114',
        crn: '4411111144',
        address: 'Some Road, London, MK55 7ES'
      },
      errorMessage: '"email" is required'
    }
  ])('validate($invalidBusiness) => $errorMessage', (testCase) => {
    const result = businessSchema.validate(testCase.invalidBusiness)

    expect(result.value).toEqual(testCase.invalidBusiness)
    expect(result.error.message).toEqual(testCase.errorMessage)
  })
})
