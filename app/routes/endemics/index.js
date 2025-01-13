import { requestAuthorizationCodeUrl } from '../../auth/auth-code-grant/request-authorization-code-url.js'
import { config } from '../../config/index.js'

export const indexRouteHandlers = [{
  method: 'GET',
  path: `${config.urlPrefix}/endemics/start`,
  options: {
    auth: false,
    handler: async (request, h) => {
      return h.view('endemics/index', {
        defraIdLogin: requestAuthorizationCodeUrl(request),
        ruralPaymentsAgency: config.ruralPaymentsAgency
      })
    }
  }
}]
