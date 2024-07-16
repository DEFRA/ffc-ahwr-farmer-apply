const { PublishEvent } = require('ffc-ahwr-event-publisher')
const { eventQueue } = require('../config').mqConfig

const raiseEvent = async (event, status = 'success') => {
  const eventPublisher = new PublishEvent(eventQueue)

  const eventMessage = {
    name: event.name,
    properties: {
      id: event.id,
      sbi: event.sbi,
      cph: event.cph,
      reference: event.reference,
      checkpoint: process.env.APPINSIGHTS_CLOUDROLE,
      status,
      action: {
        type: event.type,
        message: event.message,
        data: event.data,
        raisedBy: event.email
      }
    }
  }
  try {
    await eventPublisher.sendEvent(eventMessage)
  } catch {
    throw new Error('raiseEvent eventPublisher failed')
  }
}

module.exports = raiseEvent
