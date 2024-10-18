const { sendMessage, receiveMessage } = require('../')
const states = require('../../constants/states')
const { applicationRequestQueue, applicationRequestMsgType, fetchApplicationRequestMsgType, applicationResponseQueue } = require('../../config').mqConfig

async function getApplication (applicationReference, sessionId) {
  await sendMessage({ applicationReference }, fetchApplicationRequestMsgType, applicationRequestQueue, { sessionId })
  return receiveMessage(sessionId, applicationResponseQueue)
}

async function sendApplication (application, sessionId) {
  await sendMessage(
    application,
    applicationRequestMsgType,
    applicationRequestQueue,
    { sessionId }
  )
  const response = await receiveMessage(
    sessionId,
    applicationResponseQueue
  )

  if (response?.applicationState !== states.submitted) {
    // throws an error in the above function
    return
  }

  return response?.applicationReference
}

module.exports = {
  getApplication,
  sendApplication
}
