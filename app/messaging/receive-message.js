const cloneDeep = require('rfdc')()
const { createMessageReceiver } = require('./create-message-receiver')

async function receiveMessage (messageId, config) {
  let result
  const receiver = createMessageReceiver(config)
  const receiverCopy = cloneDeep(receiver)
  await receiverCopy.acceptSession(messageId)
  const messages = await receiverCopy.receiveMessages(1, { maxWaitTimeInMs: 50000 })
  if (messages.length) {
    result = messages[0].body
    await receiverCopy.completeMessage(messages[0])
  }
  await receiverCopy.closeConnection()
  return result
}

module.exports = receiveMessage
