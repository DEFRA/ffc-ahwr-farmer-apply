const DoesNotHaveAnyValidCph = require('./does-not-have-any-valid-cph')

const between = (x, min, max) => {
  return x >= min && x <= max
}

const inEngland = (cphNumber) => {
  // CPHs must be in England, therefore start with 01 to 51
  const england = {
    MIN: 1,
    MAX: 51
  }
  return between(cphNumber.slice(0, 2), england.MIN, england.MAX)
}

const restrictedToCattlePigAndSheepLivestock = (cphNumber) => {
  // Need customers' associated CPH to not include slaughter houses or poultry
  const slaughterHousesOrPoultry = {
    MIN: 8000,
    MAX: 9999
  }
  return !between(cphNumber.slice(-4), slaughterHousesOrPoultry.MIN, slaughterHousesOrPoultry.MAX)
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
