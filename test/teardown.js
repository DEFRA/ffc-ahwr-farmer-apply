import appInsights from 'applicationinsights'

afterEach(async () => {
  if (global.__SERVER__) {
    await global.__SERVER__.stop()
  }
  appInsights?.dispose()
})
