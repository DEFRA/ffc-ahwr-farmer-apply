import { getCustomer, getFarmerApplyData } from '../session/index.js'
import { keys } from '../session/keys.js'

function addBindings (request) {
  const applyData = getFarmerApplyData(request)
  request.logger.setBindings({
    sbi: applyData?.organisation?.sbi,
    crn: getCustomer(request, keys.customer.crn),
    reference: applyData?.reference
  })
}

export const loggingContextPlugin = {
  plugin: {
    name: 'logging-context',
    register: (server, _) => {
      server.ext('onPreHandler', (request, h) => {
        if (!request.path.includes('assets') && !request.path.includes('health')) {
          addBindings(request)
        }

        return h.continue
      })
    }
  }
}
