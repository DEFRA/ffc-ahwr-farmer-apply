const { isUserOldWorldRejectWithinTenMonths } = require('../lib/common-checks')

describe('isUserOldWorldRejectWithinTenMonths', () => {

    test.each([
        {applicationData: null, expected: { isValid: false, message: 'Invalid application Data object' }},
        {applicationData: [], expected: { isValid: false, message: 'No old World aggreement' }},
        {applicationData: [{ dateOfClaim: 'invalid date' }, { dateOfClaim: 'invalid date' }], expected: { isValid: false, message: 'Invalid date provided invalid date' }},
        {applicationData: [{ dateOfClaim: new Date('2021-01-01') }, { dateOfClaim: new Date('2021-01-01') }], expected: { isValid: false, message: 'Offer is not within 10 months' }},
        {applicationData: [{ type: 'VV' }, { type: 'VV' }], expected: { isValid: false, message: 'existing user' }},
        {applicationData: [{ statusId: 2 }, { statusId: 2 }], expected: { isValid: false, message: 'Offer is rejected' }},
        {applicationData: [{ dateOfClaim: new Date(), type: 'VV', statusId: 1 }, { dateOfClaim: new Date(), type: 'VV', statusId: 1 }], expected: { isValid: true }}
    ])('returns $expected when $applicationData is passed', ({ applicationData, expected }) => {
        const result = isUserOldWorldRejectWithinTenMonths(applicationData)
        expect(result).toEqual(expected)
    })

})