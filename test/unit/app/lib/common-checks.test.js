const { isUserOldWorldRejectWithinTenMonths } = require('../../../../app/lib/common-checks')

describe('isUserOldWorldRejectWithinTenMonths', () => {
  test.each([
    { applicationData: [], expected: { isExistingUserRejectedAgreementWithin10months: false, message: 'new user, Offer is not rejected' } },
    { applicationData: [{ dateOfClaim: 'invalid date' }, { dateOfClaim: 'invalid date' }], expected: { isExistingUserRejectedAgreementWithin10months: false, message: 'new user, Offer is not rejected' } },
    { applicationData: [{ dateOfClaim: new Date('2021-01-01') }, { dateOfClaim: new Date('2021-01-01') }], expected: { isExistingUserRejectedAgreementWithin10months: false, message: 'new user, Offer is not rejected' } },
    { applicationData: [{ type: 'VV' }, { type: 'EE' }], expected: { isExistingUserRejectedAgreementWithin10months: false, message: 'Offer is not rejected' } },
    { applicationData: [{ statusId: 2 }, { statusId: 2 }], expected: { isExistingUserRejectedAgreementWithin10months: false, message: 'new user, Offer is not rejected' } },
    { applicationData: [{ dateOfClaim: '2024-01-01', type: 'VV', statusId: 10 }, { dateOfClaim: new Date(), type: 'VV', statusId: 10 }], expected: expect.objectContaining({ isExistingUserRejectedAgreementWithin10months: false }) }
  ])('returns $expected when $applicationData is passed', ({ applicationData, expected }) => {
    const result = isUserOldWorldRejectWithinTenMonths(applicationData)
    expect(result).toEqual(expected)
  })
})
