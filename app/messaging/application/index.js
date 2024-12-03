const { sendMessage, receiveMessage } = require('../')
const states = require('../../constants/states')
const { applicationRequestQueue, applicationRequestMsgType, applicationResponseQueue } = require('../../config').mqConfig

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
  sendApplication
}
