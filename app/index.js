require('./insights').setup()
const createServer = require('./server')
const { closeAllConnections } = require('./messaging/create-message-sender')

createServer()
  .then(server => server.start())
  .catch(err => {
    console.error(err)
    closeAllConnections()
    process.exit(1)
  })
