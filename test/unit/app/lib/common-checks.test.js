const { calculateMonths, isWithinPeriodFromDate, isOfferWithinTenMonths, isUserOldWorldRejectWithinTenMonths, isUserOldWorldReadyToPayWithinTenMonths } = require('../../../../app/lib/common-checks')
const { hasSearchValue } = require('../../../../app/lib/checkForValue')
const { getValueWhereCondition } = require('../../../../app/lib/getValueFromObjectCondition')

jest.mock('../../../../app/lib/checkForValue')
jest.mock('../../../../app/lib/getValueFromObjectCondition')

describe('calculateMonths', () => {
  test.each([
    { date: '2023-01-01', months: 10, expected: new Date('2023-11-01').getTime() },
    { date: '2023-01-01', months: -10, expected: new Date('2022-03-01').getTime() },
    { date: '2023-01-01', months: 0, expected: new Date('2023-01-01').getTime() }
  ])('returns $expected when date is $date and months is $months', ({ date, months, expected }) => {
    const result = calculateMonths(date, months)
    expect(result).toBe(expected)
  })
})

describe('isWithinPeriodFromDate', () => {
  test.each([
    { date: new Date('2023-01-01'), periodInMonths: 10, expected: false },
    { date: new Date('2022-01-01'), periodInMonths: 10, expected: false },
    { date: new Date('2024-04-04'), periodInMonths: 10, expected: true }
  ])('returns $expected when date is $date and periodInMonths is $periodInMonths', ({ date, periodInMonths, expected }) => {
    const result = isWithinPeriodFromDate(date, periodInMonths)
    expect(result).toBe(expected)
  })
})

describe('isOfferWithinTenMonths', () => {
  test.each([
    { offerDate: new Date('2023-01-01'), expected: false },
    { offerDate: new Date('2022-01-01'), expected: false },
    { offerDate: new Date('2024-04-04'), expected: true }
  ])('returns $expected when offerDate is $offerDate', ({ offerDate, expected }) => {
    const result = isOfferWithinTenMonths(offerDate)
    expect(result).toBe(expected)
  })
})

describe('isUserOldWorldRejectWithinTenMonths', () => {
  test.each([
    { applicationData: [], expected: { isExistingUserRejectedAgreementWithin10months: false } },
    { applicationData: [{ dateOfClaim: 'invalid date' }, { dateOfClaim: 'invalid date' }], expected: { isExistingUserRejectedAgreementWithin10months: false } },
    { applicationData: [{ dateOfClaim: new Date('2021-01-01') }, { dateOfClaim: new Date('2021-01-01') }], expected: { isExistingUserRejectedAgreementWithin10months: false } },
    { applicationData: [{ type: 'VV' }, { type: 'EE' }], expected: { isExistingUserRejectedAgreementWithin10months: false } },
    { applicationData: [{ statusId: 2 }, { statusId: 2 }], expected: { isExistingUserRejectedAgreementWithin10months: false } },
    { applicationData: [{ dateOfClaim: '2024-01-01', type: 'VV', statusId: 10 }, { dateOfClaim: new Date(), type: 'VV', statusId: 10 }], expected: expect.objectContaining({ isExistingUserRejectedAgreementWithin10months: false }) }
  ])('returns $expected when $applicationData is passed', ({ applicationData, expected }) => {
    getValueWhereCondition.mockReturnValueOnce(new Date('2023-01-01'))
    hasSearchValue.mockReturnValueOnce(true).mockReturnValueOnce(true)
    const result = isUserOldWorldRejectWithinTenMonths(applicationData)
    expect(result).toEqual(expected)
  })
})

describe('isUserOldWorldReadyToPayWithinTenMonths', () => {
  test.each([
    { applicationData: [], expected: { isExistingUserRejectedAgreementWithin10months: false } },
    { applicationData: [{ dateOfClaim: 'invalid date' }, { dateOfClaim: 'invalid date' }], expected: { isExistingUserRejectedAgreementWithin10months: false } },
    { applicationData: [{ dateOfClaim: new Date('2021-01-01') }, { dateOfClaim: new Date('2021-01-01') }], expected: { isExistingUserRejectedAgreementWithin10months: false } },
    { applicationData: [{ type: 'VV' }, { type: 'EE' }], expected: { isExistingUserRejectedAgreementWithin10months: false } },
    { applicationData: [{ statusId: 2 }, { statusId: 2 }], expected: { isExistingUserRejectedAgreementWithin10months: false } },
    { applicationData: [{ dateOfClaim: '2024-01-01', type: 'VV', statusId: 9 }, { dateOfClaim: new Date(), type: 'VV', statusId: 9 }], expected: expect.objectContaining({ isExistingUserRejectedAgreementWithin10months: false }) }
  ])('returns $expected when $applicationData is passed', ({ applicationData, expected }) => {
    getValueWhereCondition.mockReturnValueOnce(new Date('2023-01-01'))
    hasSearchValue.mockReturnValueOnce(true).mockReturnValueOnce(true)
    const result = isUserOldWorldReadyToPayWithinTenMonths(applicationData)
    expect(result).toEqual(expected)
  })
})
