import { createServer } from '../app/server.js'

beforeEach(async () => {
  // Set reference to server in order to close the server during teardown.
  jest.setTimeout(10000)
  const server = await createServer()
  await server.initialize()
  global.__SERVER__ = server
})
