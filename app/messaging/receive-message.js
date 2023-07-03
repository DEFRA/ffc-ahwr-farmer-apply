const { createMessageReceiver } = require('./create-message-receiver')

async function receiveMessage (messageId, config) {
  let result
  const receiver = createMessageReceiver(config)
  const sessionReceiver = await receiver.sbClient.acceptSession(config.address, messageId)
  const messages = await sessionReceiver.receiveMessages(1, { maxWaitTimeInMs: 50000 })
  if (messages.length) {
    result = messages[0].body
    await sessionReceiver.completeMessage(messages[0])
  }
  await sessionReceiver.close()
  return result
}

module.exports = receiveMessage
