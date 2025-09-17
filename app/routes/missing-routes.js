import { StatusCodes } from 'http-status-codes'
import { config } from '../config/index.js'
import { getFarmerApplyData } from '../session/index.js'
import { keys } from '../session/keys.js'

const { farmerApplyData: { organisation: organisationKey } } = keys

export const missingPagesRoutes = [{
  method: 'GET',
  path: '/{any*}',
  options: {
    auth: { mode: 'try' },
    handler: (request, h) => {
      const userIsSignedIn = Boolean(getFarmerApplyData(request, organisationKey))

      return h
        .view('error-pages/404',
          {
            signInLink: !userIsSignedIn ? `${config.dashboardServiceUri}/sign-in` : undefined,
            applyStartLink: `${config.serviceUri}/endemics/you-can-claim-multiple`
          })
        .code(StatusCodes.NOT_FOUND)
    }
  }
}]