const { sendMessage } = require('../')
const { registerYourInterestRequestQueue } = require('../../config').mqConfig

async function sendRegisterYourInterestMessage (sbi, crn, email) {
  const message = { sbi, crn, email }
  console.log(`Sending register your interest message to queue for sbi(${sbi}) - ${registerYourInterestRequestQueue.address}`)
  await sendMessage(
    message,
    registerYourInterestRequestQueue.messageType,
    registerYourInterestRequestQueue
  )
}

async function sendDefraIdRegisterYourInterestMessage (email) {
  const message = { email }
  console.log(`Sending register your interest message to queue for email(${email}) - ${registerYourInterestRequestQueue.address}`)
  await sendMessage(
    message,
    registerYourInterestRequestQueue.messageType,
    registerYourInterestRequestQueue
  )
}

module.exports = {
  sendRegisterYourInterestMessage,
  sendDefraIdRegisterYourInterestMessage
}
