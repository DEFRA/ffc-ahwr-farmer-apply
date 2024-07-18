const raiseEvent = require('../../../../app/event/raise-event')

jest.mock('ffc-ahwr-event-publisher')
const mockEventPublisher = require('ffc-ahwr-event-publisher')

describe('raise-event', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  test('raise-event call sendEvent with the right params', async () => {
    const mockEvent = {
      name: 'mock Name',
      sbi: '123456789',
      cph: ' mock cph',
      reference: 'ABCD-1234-5678',
      type: 'macktype',
      message: 'the mock message',
      data: { some: 'data' },
      email: 'mock@emial.com'
    }

    await raiseEvent(mockEvent, 'mockStatus')

    expect(mockEventPublisher.PublishEvent).toBeCalled()
  })
})
