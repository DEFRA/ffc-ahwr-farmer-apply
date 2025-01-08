import { config } from '../config/index.js'

export const privacyPolicyRouteHandlers = [{
  method: 'GET',
  path: `${config.urlPrefix}/privacy-policy`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('privacy-policy')
    }
  }
}]
