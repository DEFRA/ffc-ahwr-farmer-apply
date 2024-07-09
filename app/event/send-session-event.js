const raiseEvent = require('./raise-event')
const appInsights = require('applicationinsights')

async function retryRaiseEvent (event, maxRetries) {
  let retries = 0
  while (retries < maxRetries) {
    try {
      await raiseEvent(event)
      return
    } catch (error) {
      console.error(`Apply raiseEvent error ${retries + 1}:`, error)
      appInsights.defaultClient.trackException({ exception: error })
      retries++
    }
  }
  console.error(`Apply raiseEvent for event ${event} failed after ${maxRetries} attempts.`)
}

const sendSessionEvent = (organisation, sessionId, entryKey, key, value, ip, reference = '') => {
  if (sessionId && organisation) {
    const event = {
      id: sessionId,
      sbi: organisation.sbi,
      cph: 'n/a',
      reference,
      email: organisation.email,
      name: 'send-session-event',
      type: `${entryKey}-${key}`,
      message: `Session set for ${entryKey} and ${key}.`,
      data: { reference, [key]: value },
      ip
    }
    retryRaiseEvent(event, 2)
  }
}

module.exports = sendSessionEvent
