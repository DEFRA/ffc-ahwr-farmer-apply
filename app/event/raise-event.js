const { PublishEvent } = require('ffc-ahwr-event-publisher')
const { eventQueue } = require('../config').mqConfig

const raiseEvent = async (event, status = 'success') => {
  try {
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
    await eventPublisher.sendEvent(eventMessage)
  } catch (err) {
    if (event.type) {
      console.error(`Apply raiseEvent for ${event.type} failed`, err)
    } else {
      console.error('Apply raiseEvent failed', err)
    }
  }
}

module.exports = raiseEvent
