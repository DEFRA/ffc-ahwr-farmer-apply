require('./insights').setup()
const createServer = require('./server')
const MessageSenders = require('./messaging/create-message-sender')
const MessageReceivers = require('./messaging/create-message-receiver')

createServer()
  .then(server => server.start())
  .catch(err => {
    console.error(err)
    MessageSenders.closeAllConnections()
    MessageReceivers.closeAllConnections()
    process.exit(1)
  })
