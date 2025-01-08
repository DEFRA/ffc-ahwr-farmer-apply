import { config } from '../config/index.js'

export const accessibilityRouteHandlers = [{
  method: 'GET',
  path: `${config.urlPrefix}/accessibility`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('accessibility')
    }
  }
}]
