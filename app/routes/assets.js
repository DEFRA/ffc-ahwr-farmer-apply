import { config } from '../config/index.js'

export const assetsRouteHandlers = [{
  method: 'GET',
  path: `${config.urlPrefix}/assets/{path*}`,
  options: {
    auth: false,
    tags: ['assets'],
    handler: {
      directory: {
        path: ['app/frontend/dist', 'node_modules/govuk-frontend/dist/govuk/assets']
      }
    },
    cache: {
      privacy: 'private'
    }
  }
}]
