const raiseEvent = require('./raise-event')

const sendIneligibilityEvent = async (sessionId, sbi, crn, exception, status = 'alert') => {
  if (sessionId && exception) {
    const event = {
      id: sessionId,
      sbi,
      cph: 'n/a',
      email: 'unknown',
      name: 'send-ineligibility-event',
      type: 'ineligibility-event',
      message: `Apply: ${exception}`,
      data: {
        sbi,
        crn,
        exception,
        raisedAt: new Date(),
        journey: 'apply'
      },
      status
    }
    await raiseEvent(event, status)
  }
}

module.exports = sendIneligibilityEvent
