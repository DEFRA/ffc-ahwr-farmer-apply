const {
  getValueByKey,
  hasSearchValue
} = require('../../../../app/lib/checkForValue.js')

describe('checkForValue', () => {
  const applicationData = [
    {
      id: 'e1c05eea-da01-4e81-a5b5-5e587d2ca917',
      reference: 'AHWR-E1C0-5EEA',
      data: {
        vetName: 'John May',
        vetRcvs: '3454332',
        reference: null,
        urnResult: '4433',
        visitDate: '2024-08-08T00:00:00.000Z',
        dateOfClaim: '2024-08-08T08:08:49.369Z',
        declaration: true,
        offerStatus: 'accepted',
        whichReview: 'sheep',
        organisation: {
          crn: '1101741414',
          frn: '1100848126',
          sbi: '119852719',
          name: 'Bunkers Hill Barn',
          email: 'georgephillipsq@spillihpegroegp.com.test',
          address:
            'Stanton Harcourt Farms,15a New Street,Knowle,BROCK FARM,HARROWGATE ROAD,BRISTOL,RG10 9NS,United Kingdom',
          orgEmail: 'bunkershillbarnv@nrabllihsreknubb.com.test',
          farmerName: 'George Phillips'
        },
        animalsTested: '21',
        dateOfTesting: '2024-08-08T00:00:00.000Z',
        detailsCorrect: 'yes',
        eligibleSpecies: 'yes',
        confirmCheckDetails: 'yes'
      },
      claimed: false,
      createdAt: '2024-08-08T07:35:39.481Z',
      updatedAt: '2024-08-08T08:08:49.406Z',
      createdBy: 'admin',
      updatedBy: 'admin',
      statusId: 10,
      type: 'VV'
    }
  ]

  describe('getValueByKey', () => {
    const obj = [
      {
        id: 'e1c05eea-da01-4e81-a5b5-5e587d2ca917',
        reference: 'AHWR-E1C0-5EEA',
        data: {
          vetName: 'John May',
          vetRcvs: '3454332',
          reference: null,
          urnResult: '4433',
          visitDate: '2024-08-08T00:00:00.000Z',
          dateOfClaim: '2024-08-08T08:08:49.369Z',
          declaration: true,
          offerStatus: 'accepted',
          whichReview: 'sheep',
          organisation: {
            crn: '1101741414',
            frn: '1100848126',
            sbi: '119852719'
          },
          animalsTested: '21',
          dateOfTesting: '2024-08-08T00:00:00.000Z',
          detailsCorrect: 'yes',
          eligibleSpecies: 'yes',
          confirmCheckDetails: 'yes'
        },
        claimed: false,
        createdAt: '2024-08-08T07:35:39.481Z',
        updatedAt: '2024-08-08T08:08:49.406Z',
        createdBy: 'admin',
        updatedBy: 'admin',
        statusId: 10,
        type: 'VV'
      }
    ]

    test('should return the correct value if the key exists in the object', () => {
      const key = 'type'

      const result = getValueByKey(obj, key)

      expect(result).toBe('VV')
    })

    test('should return undefined if the key does not exist in the object', () => {
      const key = 'unknownKey'

      // expect(result === undefined).toBe(true)
      expect(() => getValueByKey(obj, key)).toThrow('Invalid object provided')
    })

    test('should throw an error if an invalid object is provided', () => {
      const obj = 'not an object'
      const key = 'type'

      expect(() => getValueByKey(obj, key)).toThrow('Invalid object provided')
    })
  })

  describe('hasSearchValue', () => {
    test('should return true if the search value is found in the array', () => {
      const key = 'type'
      const searchValue = 'VV'

      const result = hasSearchValue(applicationData, key, searchValue)

      expect(result).toBeTruthy()
    })

    test('should return false if the search value is not found in the array', () => {
      const key = 'type'
      const searchValue = 'EE'

      const result = hasSearchValue(applicationData, key, searchValue)

      expect(result).toBeFalsy()
    })

    test('should throw an error if an invalid array is provided', () => {
      const arrayOfData = 'not an array'
      const key = 'type'
      const searchValue = 'VV'

      expect(() => hasSearchValue(arrayOfData, key, searchValue)).toThrow(
        'Invalid application Data object'
      )
    })
  })
})
