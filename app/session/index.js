const { sendSessionEvent } = require('../event')

const entries = {
  farmerApplyData: 'farmerApplyData',
  selectYourBusiness: 'selectYourBusiness',
  organisation: 'organisation',
  answers: 'answers',
  pkcecodes: 'pkcecodes',
  tokens: 'tokens',
  customer: 'customer'
}

function lacksAny (request, entryKey, keys) {
  let result = false
  keys.forEach(key => {
    if (!get(request, entryKey, key)) {
      result = true
    }
  })
  return result
}

function set (request, entryKey, key, value) {
  const entryValue = request.yar?.get(entryKey) || {}
  entryValue[key] = typeof (value) === 'string' ? value.trim() : value
  request.yar.set(entryKey, entryValue)
  const organisation = getFarmerApplyData(request, entries.organisation)
  const reference = getFarmerApplyData(request, 'reference')
  const xForwardedForHeader = request.headers['x-forwarded-for']
  const ip = xForwardedForHeader ? xForwardedForHeader.split(',')[0] : request.info.remoteAddress
  sendSessionEvent(organisation, reference, request.yar.id, entryKey, key, value, ip)
}

function get (request, entryKey, key) {
  return key ? request.yar?.get(entryKey)?.[key] : request.yar?.get(entryKey)
}

function clear (request) {
  request.yar.clear(entries.farmerApplyData)
  request.yar.clear(entries.organisation)
  request.yar.clear(entries.answers)
  request.yar.clear(entries.selectYourBusiness)
  request.yar.clear(entries.customer)
}

function setFarmerApplyData (request, key, value) {
  set(request, entries.farmerApplyData, key, value)
}

function setSelectYourBusiness (request, key, value) {
  set(request, entries.selectYourBusiness, key, value)
}

function getSelectYourBusiness (request, key) {
  return get(request, entries.selectYourBusiness, key)
}

function getFarmerApplyData (request, key) {
  return get(request, entries.farmerApplyData, key)
}

function setToken (request, key, value) {
  set(request, entries.tokens, key, value)
}

function getToken (request, key) {
  return get(request, entries.tokens, key)
}

function setPkcecodes (request, key, value) {
  set(request, entries.pkcecodes, key, value)
}

function getPkcecodes (request, key) {
  return get(request, entries.pkcecodes, key)
}

const setCustomer = (request, key, value) => {
  set(request, entries.customer, key, value)
}

const getCustomer = (request, key) => {
  return get(request, entries.customer, key)
}

module.exports = {
  entries,
  lacksAny,
  clear,
  getFarmerApplyData,
  setFarmerApplyData,
  getSelectYourBusiness,
  setSelectYourBusiness,
  getToken,
  setToken,
  getPkcecodes,
  setPkcecodes,
  setCustomer,
  getCustomer
}
