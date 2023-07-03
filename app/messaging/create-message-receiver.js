const { MessageReceiver } = require('ffc-messaging')

const cachedReceivers = {}

const createMessageReceiver = (config) => {
  if (cachedReceivers[config.address]) {
    return cachedReceivers[config.address]
  }

  const sender = new MessageReceiver(config)
  cachedReceivers[config.address] = sender

  return sender
}

const closeAllConnections = async () => {
  const senderKeys = Object.keys(cachedReceivers)

  for (const key of senderKeys) {
    const sender = cachedReceivers[key]
    await sender.closeConnection()
    delete cachedReceivers[key]
  }
}

module.exports = {
  createMessageReceiver,
  closeAllConnections,
  cachedReceivers
}
