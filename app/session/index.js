const { sendSessionEvent } = require('../event')

const entries = {
  application: 'application',
  farmerApplyData: 'farmerApplyData',
  organisation: 'organisation',
  answers: 'answers'
}

function set (request, entryKey, key, value) {
  const entryValue = request.yar?.get(entryKey) || {}
  entryValue[key] = typeof (value) === 'string' ? value.trim() : value
  request.yar.set(entryKey, entryValue)
  const organisation = getFarmerApplyData(request, entries.organisation)
  sendSessionEvent(organisation, request.yar.id, entryKey, key, value)
}

function get (request, entryKey, key) {
  return key ? request.yar?.get(entryKey)?.[key] : request.yar?.get(entryKey)
}

function clear (request) {
  request.yar.clear(entries.farmerApplyData)
  request.yar.clear(entries.application)
  request.yar.clear(entries.organisation)
  request.yar.clear(entries.answers)
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

module.exports = {
  clear,
  getApplication,
  getFarmerApplyData,
  setApplication,
  setFarmerApplyData
}
