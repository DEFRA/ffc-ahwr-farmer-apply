import { getMessagingConfig } from '../../../../app/config/messaging.js'

test('messaging throws an error for invalid config', () => {
  jest.resetModules()
  delete process.env.MESSAGE_QUEUE_HOST

  expect(() => getMessagingConfig())
    .toThrow('The message queue config is invalid. "messageQueue.host" is required')
})
