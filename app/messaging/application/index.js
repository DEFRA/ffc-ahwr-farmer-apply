const { sendMessage, receiveMessage } = require('../')
const { applicationRequestQueue, applicationRequestMsgType, fetchApplicationRequestMsgType, applicationResponseQueue } = require('../../config').mqConfig

async function getApplication (applicationReference, sessionId) {
  await sendMessage({ applicationReference }, fetchApplicationRequestMsgType, applicationRequestQueue, { sessionId })
  return receiveMessage(sessionId, applicationResponseQueue)
}

async function sendApplication (application, sessionId) {
  console.log(`Sending application ${JSON.stringify(application)} to queue ${applicationRequestQueue.address} with sessionID ${sessionId}.`)

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

  console.log(`Received response ${JSON.stringify(response)} from queue ${applicationResponseQueue.address} for sessionID ${sessionId} with state ${response?.applicationState}.`)

  if (response?.applicationState !== 'submitted') {
    // throws an error in the above function
    return
  }
  
  return response?.applicationReference
}

module.exports = {
  getApplication,
  sendApplication
}
