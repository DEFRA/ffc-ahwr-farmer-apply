
import { raiseEvent } from './raise-event.js'

export const retryRaiseEvent = async (event, logger) => {
  let retries = 0
  const maxRetries = 2

  while (retries < maxRetries) {
    try {
      await raiseEvent(event, logger)
      return
    } catch (err) {
      retries++
    }
  }
}
