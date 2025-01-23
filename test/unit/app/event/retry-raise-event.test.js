import { retryRaiseEvent } from '../../../../app/event/retry-raise-event.js'
import { raiseEvent } from '../../../../app/event/raise-event.js'

jest.mock('../../../../app/event/raise-event')

afterEach(() => {
  jest.resetAllMocks()
})

afterAll(() => {
  jest.restoreAllMocks()
})

test('should succeed on the first attempt', async () => {
  const event = {}
  await retryRaiseEvent(event)
  expect(raiseEvent).toHaveBeenCalledTimes(1)
})

test('should retry and fail after maxRetries attempts', async () => {
  const event = {}
  raiseEvent.mockRejectedValue(new Error('Failed'))
  await retryRaiseEvent(event)

  expect(raiseEvent).toHaveBeenCalledTimes(2)
})
