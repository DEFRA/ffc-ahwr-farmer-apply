import { retryRaiseEvent } from './retry-raise-event.js'

export const sendSessionEvent = (organisation, sessionId, entryKey, key, value, ip, reference = '') => {
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
