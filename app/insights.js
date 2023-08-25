const appInsights = require('applicationinsights')

function setup () {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    appInsights.setup().start()
    console.log('App Insights Running')
    const cloudRoleTag = appInsights.defaultClient.context.keys.cloudRole
    const appName = process.env.APPINSIGHTS_CLOUDROLE
    appInsights.defaultClient.context.tags[cloudRoleTag] = appName
  } else {
    console.log('App Insights Not Running!')
  }
}

function logException (request, event) {
  try {
    const client = appInsights.defaultClient
    client?.trackException({
      exception: event.error ?? new Error('unknown'),
      properties: {
        statusCode: request ? request.statusCode : '',
        sessionId: request ? request.yar?.id : '',
        payload: request ? request.payload : '',
        request: event.request ?? 'Server Error'
      }
    })
  } catch (err) {
    console.error(err, 'App Insights')
  }
}
module.exports = { setup, logException }
