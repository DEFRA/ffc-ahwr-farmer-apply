const { is } = require("cheerio/lib/api/traversing")
const status = require("../constants/status")



 const isExistingUser = (userType) => userType.EXISTING_USER === userType
 const getKeyByValue = (object, value) => Object.keys(object).find(key => object[key] === value)
// check status for the correct value to 10 is rejected 
 const checkOfferStatus = (offerStatus) => offerStatus === getKeyByValue(status, 10)

//  10month = check offer is within 10months
 const calculateMonths = (date, months) => {
    const resultantDate = new Date(date);
    resultantDate.setMonth(resultantDate.getMonth() + months)
    return resultantDate
 }

const isWithinPeriodFromDate = (date, periodInMonths) => {
    const today = new Date()
    const targetDate = calculateMonths(date, periodInMonths)
    return today <= targetDate
}

const isOfferWithinTenMonths = (offerDate) => {
    if(!offerDate || !offerDate instanceof Date ){
        throw new Error('Invalid date provided')
    }
    const periodInMonths = 10
    return isWithinPeriodFromDate(offerDate, periodInMonths)
} 

// check all the conditions 
const isUserOldworldRejectWithinTenMonths = (applicationData) => {
    if(!applicationData || typeof applicationData !== 'object'){
        throw new Error('Invalid application Data object')
    }

    const {userType, dateOfClaim, offerStatus } = applicationData

    const checks = [
        {check: isExistingUser(userType), message: 'Not existing user'},
        {check: isOfferWithinTenMonths(dateOfClaim), message: 'Offer is not within 10 months'},
        {check: checkOfferStatus(offerStatus), message: 'Offer is not rejected'}
    ]

    const failedChecks = checks.filter(item => !item.check).map(item => item.message)

    if(failedChecks.length > 0){
        return {isValid: false, message: failedChecks.join(', ')}
    }

    return {isValid: true}

}

module.exports = {
isExistingUser,
getKeyByValue,
checkOfferStatus,
calculateMonths,
isWithinPeriodFromDate,
isOfferWithinTenMonths,
isUserOldworldRejectWithinTenMonths
}