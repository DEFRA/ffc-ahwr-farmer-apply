test('messaging throws an error for invalid config', () => {
  jest.resetModules()
  delete process.env.MESSAGE_QUEUE_HOST

  expect(() => require('../../../../app/config/messaging'))
    .toThrow('The message queue config is invalid. "messageQueue.host" is required')
})
