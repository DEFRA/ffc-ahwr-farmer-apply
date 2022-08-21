const raiseEvent = require('./raise-event')

const sendSessionEvent = async (organisation, sessionId, entryKey, key, value) => {
  if (sessionId) {
    const event = {
      id: sessionId,
      sbi: organisation.sbi,
      email: organisation.email,
      name: 'send-session-event',
      type: 'Session set',
      message: `Session set for ${entryKey}.`,
      data: { [key]: value }
    }
    await raiseEvent(event)
  }
}

module.exports = sendSessionEvent
