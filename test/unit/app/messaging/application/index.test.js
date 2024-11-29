const { sendApplication } = require('../../../../../app/messaging/application')
const { applicationResponseQueue } = require('../../../../../app/config').mqConfig

jest.mock('../../../../../app/messaging')
const { receiveMessage, sendMessage } = require('../../../../../app/messaging')

describe('application messaging tests', () => {
  const sessionId = 'a-session-id'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('sendApplication returns undefined on non submitted state', async () => {
    const application = { test: 123 }
    const receiveMessageRes = { applicationReference: 'test-reference', applicationState: 'failed' }
    receiveMessage.mockResolvedValue(receiveMessageRes)

    const message = await sendApplication(application, sessionId)

    expect(message).toEqual(undefined)
    expect(receiveMessage).toHaveBeenCalledTimes(1)
    expect(receiveMessage).toHaveBeenCalledWith(sessionId, applicationResponseQueue)
    expect(sendMessage).toHaveBeenCalledTimes(1)
  })

  test('sendApplication returns reference on submitted state', async () => {
    const application = { test: 123 }
    const receiveMessageRes = { applicationReference: 'test-reference', applicationState: 'submitted' }
    receiveMessage.mockResolvedValue(receiveMessageRes)

    const message = await sendApplication(application, sessionId)

    expect(message).toEqual('test-reference')
    expect(receiveMessage).toHaveBeenCalledTimes(1)
    expect(receiveMessage).toHaveBeenCalledWith(sessionId, applicationResponseQueue)
    expect(sendMessage).toHaveBeenCalledTimes(1)
  })
})
