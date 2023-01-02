const { sendSessionEvent } = require('../event')

const entries = {
  application: 'application',
  farmerApplyData: 'farmerApplyData',
  organisation: 'organisation',
  answers: 'answers',
  registerYourInterestData: 'registerYourInterestData'
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
  const xForwardedForHeader = request.headers['x-forwarded-for']
  const ip = xForwardedForHeader ? xForwardedForHeader.split(',')[0] : request.info.remoteAddress
  sendSessionEvent(organisation, request.yar.id, entryKey, key, value, ip)
}

function get (request, entryKey, key) {
  return key ? request.yar?.get(entryKey)?.[key] : request.yar?.get(entryKey)
}

function clear (request) {
  request.yar.clear(entries.farmerApplyData)
  request.yar.clear(entries.application)
  request.yar.clear(entries.organisation)
  request.yar.clear(entries.answers)
  request.yar.clear(entries.registerYourInterestData)
}

function setApplication (request, key, value) {
  set(request, entries.application, key, value)
}

function setFarmerApplyData (request, key, value) {
  set(request, entries.farmerApplyData, key, value)
}

function getApplication (request, key) {
  return get(request, entries.application, key)
}

function getFarmerApplyData (request, key) {
  return get(request, entries.farmerApplyData, key)
}

function getRegisterYourInterestData (request, key) {
  return get(request, entries.registerYourInterestData, key)
}

function setRegisterYourInterestData (request, key, value) {
  set(request, entries.registerYourInterestData, key, value)
}

module.exports = {
  entries,
  lacksAny,
  clear,
  getApplication,
  getFarmerApplyData,
  setApplication,
  setFarmerApplyData,
  getRegisterYourInterestData,
  setRegisterYourInterestData
}
