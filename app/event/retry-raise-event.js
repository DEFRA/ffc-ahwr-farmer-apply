import appInsights from 'applicationinsights'
import { raiseEvent } from './raise-event.js'

export const retryRaiseEvent = async (event, maxRetries) => {
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
