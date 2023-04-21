const DoesNotHaveAnyValidCph = require('./does-not-have-any-valid-cph')

const between = (x, min, max) => {
  return x >= min && x <= max
}

const inEngland = (cphNumber) => {
  return between(cphNumber.slice(0, 2), 1, 51)
}

const restrictedToCattlePigAndSheepLivestock = (cphNumber) => {
  return !between(cphNumber.slice(-4), 8000, 9999)
}

const customerMustHaveAtLeastOneValidCph = (cphNumbers) => {
  if (typeof cphNumbers === 'undefined' || !Array.isArray(cphNumbers)) {
    throw new DoesNotHaveAnyValidCph('Customer must have at least one valid CPH')
  }
  const hasAtLeastOneValidCph = cphNumbers.some(
    cphNumber => inEngland(cphNumber) && restrictedToCattlePigAndSheepLivestock(cphNumber)
  )
  if (!hasAtLeastOneValidCph) {
    throw new DoesNotHaveAnyValidCph('Customer must have at least one valid CPH')
  }
  return hasAtLeastOneValidCph
}

module.exports = {
  customerMustHaveAtLeastOneValidCph
}
