import { config } from '../config/index.js'

const deprecatedOldEntryPoint = `${config.urlPrefix}/start`
const newAppEntryPoint = `${config.urlPrefix}/endemics/start`

export const oldWorldStartRouteHandlers = [{
  method: 'GET',
  path: deprecatedOldEntryPoint,
  options: {
    auth: false,
    handler: async (_request, h) => {
      // old world apply is no longer active, redirect user to new world start
      return h.redirect(newAppEntryPoint)
    }
  }
}]
