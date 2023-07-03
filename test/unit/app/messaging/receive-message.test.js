const { createMessageReceiver } = require('../../../../app/messaging/create-message-receiver')
const receiveMessage = require('../../../../app/messaging/receive-message')

jest.mock('../../../../app/messaging/create-message-receiver', () => ({
  createMessageReceiver: jest.fn()
}))

describe('receiveMessage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should receive and process a message', async () => {
    const receiverMock = {
      acceptSession: jest.fn(),
      receiveMessages: jest.fn().mockResolvedValue([{ body: 'Test message' }]),
      completeMessage: jest.fn(),
      receiver: {
        close: jest.fn()
      }
    }

    createMessageReceiver.mockReturnValue(receiverMock)

    // Calling the receiveMessage function
    const messageId = 'test-message-id'
    const config = { /* mock configuration */ }
    const result = await receiveMessage(messageId, config)

    expect(result).toEqual('Test message')
    expect(createMessageReceiver).toHaveBeenCalledWith(config)
    expect(receiverMock.acceptSession).toHaveBeenCalledWith(messageId)
    expect(receiverMock.receiveMessages).toHaveBeenCalledWith(1, { maxWaitTimeInMs: 50000 })
    expect(receiverMock.completeMessage).toHaveBeenCalledWith({ body: 'Test message' })
    expect(receiverMock.receiver.close).toHaveBeenCalled()
  })
})
