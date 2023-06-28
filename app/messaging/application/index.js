const { sendMessage, receiveMessage } = require('../')
const { applicationRequestQueue, applicationRequestMsgType, fetchApplicationRequestMsgType, applicationResponseQueue } = require('../../config').mqConfig

async function getApplication (applicationReference, sessionId) {
  await sendMessage({ applicationReference }, fetchApplicationRequestMsgType, applicationRequestQueue, { sessionId })
  return receiveMessage(sessionId, applicationResponseQueue)
}

async function sendApplication (application, sessionId) {
  console.log(`Sending application ${JSON.stringify(application)} to queue ${applicationRequestQueue.address} with sessionID ${sessionId}.`)

  console.time(`[Perf] [sendApplication] [${sessionId}] in total`)
  console.time(`[Perf] [sendApplication] [${sessionId}] sendMessage`)
  await sendMessage(
    application,
    applicationRequestMsgType,
    applicationRequestQueue,
    { sessionId }
  )
  console.timeEnd(`[Perf] [sendApplication] [${sessionId}] sendMessage`)

  console.time(`[Perf] [sendApplication] [${sessionId}] receiveMessage`)
  const response = await receiveMessage(
    sessionId,
    applicationResponseQueue
  )
  console.timeEnd(`[Perf] [sendApplication] [${sessionId}] receiveMessage`)
  console.timeEnd(`[Perf] [sendApplication] [${sessionId}] in total`)

  console.log(`Received response ${JSON.stringify(response)} from queue ${applicationResponseQueue.address} for sessionID ${sessionId}.`)

  return response?.applicationReference
}

module.exports = {
  getApplication,
  sendApplication
}
