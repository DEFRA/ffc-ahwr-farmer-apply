const { sendRegisterYourInterestMessage } = require('../../../../../app/messaging/register-your-interest')
const { registerYourInterestRequestQueue } = require('../../../../../app/config').mqConfig

jest.mock('../../../../../app/messaging')
const { sendMessage } = require('../../../../../app/messaging')

describe('register your interest message send tests', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('sendRegisterYourInterestMessage sends message', async () => {
    const message = { sbi: '1234567890', crn: '123456789', email: 'test.email.com' }
    await sendRegisterYourInterestMessage(message.sbi, message.crn, message.email)
    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect(sendMessage).toHaveBeenCalledWith(message, registerYourInterestRequestQueue.messageType, registerYourInterestRequestQueue)
  })
})
