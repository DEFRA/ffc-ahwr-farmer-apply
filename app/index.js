import { setup } from './insights.js'
import { createServer } from './server.js'
import * as MessageSenders from './messaging/create-message-sender.js'
import * as MessageReceivers from './messaging/create-message-receiver.js'

let server
const init = async () => {
  setup()
  server = await createServer()
  await server.start()
}

process.on('unhandledRejection', async (err) => {
  await server.stop()
  await cleanup()
  server.logger.error(err, 'unhandledRejection')
  process.exit(1)
})

process.on('SIGINT', async () => {
  await server.stop()
  await cleanup()
  process.exit(0)
})

async function cleanup () {
  await MessageSenders.closeAllConnections()
  await MessageReceivers.closeAllConnections()
}

//App needs this to be awaited to work correctly, however standardjs does not like it
await init()
