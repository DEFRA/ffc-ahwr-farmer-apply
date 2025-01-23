import appInsights from 'applicationinsights'
import { PublishEvent } from 'ffc-ahwr-event-publisher'
import { eventQueue } from '../config/messaging.js'

export const raiseEvent = async (event, logger) => {
  try {
    const eventPublisher = new PublishEvent(eventQueue)
    await eventPublisher.sendEvent(event)
  } catch (err) {
    logger.error({ err, event }, 'Apply raiseEvent failed')
    appInsights.defaultClient.trackException({ exception: err })
  }
}
