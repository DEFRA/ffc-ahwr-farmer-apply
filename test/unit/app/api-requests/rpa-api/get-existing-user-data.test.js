const { getExistingUserData } = require('../../../../../app/api-requests/rpa-api/get-existing-user-Data')
const wreck = require('@hapi/wreck')
const config = require('../../../../../app/config')

jest.mock('@hapi/wreck')

describe('getExistingUserData', () => {
  test('should return the response payload when the request is successful', async () => {
    const crn = '123456789'
    const expectedResponse = [{
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
          address: 'Stanton Harcourt Farms,15a New Street,Knowle,BROCK FARM,HARROWGATE ROAD,BRISTOL,RG10 9NS,United Kingdom',
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
    }]

    wreck.get.mockResolvedValueOnce({ res: { statusCode: 200 }, payload: expectedResponse })

    const result = await getExistingUserData(crn)

    expect(result).toEqual(expectedResponse)
    expect(wreck.get).toHaveBeenCalledWith(`${config.authConfig.ruralPaymentsAgency.applicationApiUri}/application/${crn}`, { json: true })
  })

  test('should throw an error when the request fails', async () => {
    const crn = '123456789'
    // const expectedError = new Error('HTTP 500 (Internal Server Error)')

    wreck.get.mockResolvedValueOnce({ res: { statusCode: 500, statusMessage: 'Internal Server Error' } })

    await expect(getExistingUserData(crn)).resolves.not.toThrow()
    expect(wreck.get).toHaveBeenCalledWith(`${config.authConfig.ruralPaymentsAgency.applicationApiUri}/application/${crn}`, { json: true })
  })

  test('should return null when an error occurs', async () => {
    const crn = '123456789'

    wreck.get.mockRejectedValueOnce(new Error('Some error occurred'))

    const result = await getExistingUserData(crn)

    expect(result).toBeNull()
    expect(wreck.get).toHaveBeenCalledWith(`${config.authConfig.ruralPaymentsAgency.applicationApiUri}/application/${crn}`, { json: true })
  })
})
