const { getApplication, sendApplication } = require('../../../../../app/messaging/application')
const { applicationRequestQueue, applicationResponseQueue, fetchApplicationRequestMsgType } = require('../../../../../app/config').mqConfig

jest.mock('../../../../../app/messaging')
const { receiveMessage, sendMessage } = require('../../../../../app/messaging')

describe('application messaging tests', () => {
  const sessionId = 'a-session-id'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('getApplication sends and receives message', async () => {
    const reference = 'VV-1234-5678'
    const receiveMessageRes = { id: 1 }
    receiveMessage.mockResolvedValue(receiveMessageRes)

    const message = await getApplication(reference, sessionId)

    expect(message).toEqual(receiveMessageRes)
    expect(receiveMessage).toHaveBeenCalledTimes(1)
    expect(receiveMessage).toHaveBeenCalledWith(sessionId, applicationResponseQueue)
    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect(sendMessage).toHaveBeenCalledWith({ applicationReference: reference }, fetchApplicationRequestMsgType, applicationRequestQueue, { sessionId })
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
