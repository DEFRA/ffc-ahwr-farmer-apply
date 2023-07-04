const createServer = require('../../../app/server')
const MessageSenders = require('../../../app/messaging/create-message-sender')
const MessageReceivers = require('../../../app/messaging/create-message-receiver')

jest.mock('../../../app/server')
jest.mock('../../../app/messaging/create-message-sender')
jest.mock('../../../app/messaging/create-message-receiver')

describe('Server', () => {
  let server
  let originalProcessOn
  let originalConsoleError

  beforeAll(() => {
    originalProcessOn = process.on
    originalConsoleError = console.error
    process.on = jest.fn()
    console.error = jest.fn()
  })

  afterAll(() => {
    process.on = originalProcessOn
    console.error = originalConsoleError
  })

  beforeEach(() => {
    server = {
      start: jest.fn(),
      stop: jest.fn().mockResolvedValue(),
      initialize: jest.fn().mockResolvedValue()
    }
    createServer.mockResolvedValue(server)
    MessageSenders.closeAllConnections = jest.fn()
    MessageReceivers.closeAllConnections = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should start the server and perform cleanup on SIGINT', async () => {
    expect(createServer).toHaveBeenCalled()
    expect(server.start).toHaveBeenCalled()

    // Simulate SIGINT
    process.on.mock.calls[0][1]()

    expect(server.stop).toHaveBeenCalled()
    expect(MessageSenders.closeAllConnections).toHaveBeenCalled()
    expect(MessageReceivers.closeAllConnections).toHaveBeenCalled()
  })

  it('should log and exit with error on server start failure', async () => {
    const error = new Error('Server start failed')
    createServer.mockRejectedValue(error)
    const originalExit = process.exit
    process.exit = jest.fn()

    expect(createServer).toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith(error)
    expect(MessageSenders.closeAllConnections).toHaveBeenCalled()
    expect(MessageReceivers.closeAllConnections).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)

    process.exit = originalExit
  })
})
