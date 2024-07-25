const retryRaiseEvent = require('../../../../app/event/retry-raise-event')
const raiseEventMock = require('../../../../app/event/raise-event')
const appInsights = require('applicationinsights')
jest.mock('../../../../app/event/raise-event')
jest.mock('applicationinsights', () => ({ defaultClient: { trackException: jest.fn() }, dispose: jest.fn() }))

describe('retryRaiseEvent function', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  const mockEvent = {
    name: 'mockName',
    sbi: '123456789',
    cph: 'mock cph',
    reference: 'ABCD-1234-5678',
    type: 'mockType',
    message: 'mock message',
    data: { some: 'data' },
    email: 'mock@email.com',
    id: 'mock_Id',
    ip: '1.1.1.1'
  }

  it('should succeed on the first attempt', async () => {
    await retryRaiseEvent(mockEvent, 2)
    expect(raiseEventMock).toHaveBeenCalledTimes(1)
  })

  it('should retry and fail after maxRetries attempts', async () => {
    raiseEventMock.mockRejectedValue(new Error('Failed'))
    await retryRaiseEvent(mockEvent, 2)

    expect(raiseEventMock).toHaveBeenCalledTimes(3)
    expect(appInsights.defaultClient.trackException).toHaveBeenCalled()
  })
})
