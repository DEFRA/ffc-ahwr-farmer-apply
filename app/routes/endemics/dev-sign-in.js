import { config } from '../../config/index.js'
import { setCustomer, setFarmerApplyData } from '../../session/index.js'
import { setAuthCookie } from '../../auth/cookie-auth/cookie-auth.js'
import { keys } from '../../session/keys.js'
import { generateRandomID } from '../../lib/create-temp-reference.js'
import { getPersonName } from '../../api-requests/rpa-api/person.js'
import { getOrganisationAddress } from '../../api-requests/rpa-api/organisation.js'
import { businessEligibleToApply } from '../../api-requests/business-eligible-to-apply.js'
import { farmerApply } from '../../constants/constants.js'
import { AlreadyAppliedError } from '../../exceptions/AlreadyAppliedError.js'

const urlPrefix = config.urlPrefix
const pageUrl = `${urlPrefix}/endemics/dev-sign-in`

const createDevDetails = async (sbi) => {
  const organisationSummary = {
    organisationPermission: {},
    organisation: {
      sbi,
      name: 'madeUpCo',
      email: 'org@company.com',
      frn: '1100918140',
      address: {
        address1: 'Somewhere'
      }
    }
  }
  const personSummary = {
    email: 'farmer@farm.com',
    customerReferenceNumber: '2054561445',
    firstName: 'John',
    lastName: 'Smith'
  }

  return [personSummary, organisationSummary]
}

function setOrganisationSessionData (request, personSummary, { organisation: org }) {
  const organisation = {
    sbi: org.sbi?.toString(),
    farmerName: getPersonName(personSummary),
    name: org.name,
    email: personSummary.email ? personSummary.email : org.email,
    orgEmail: org.email,
    address: getOrganisationAddress(org.address),
    crn: personSummary.customerReferenceNumber,
    frn: org.businessReference
  }
  setFarmerApplyData(
    request,
    keys.farmerApplyData.organisation,
    organisation
  )
}

export const devLoginHandlers = [
  {
    method: 'GET',
    path: pageUrl,
    options: {
      auth: false,
      handler: async (request, h) => {
        return h.view('dev-sign-in', {
        })
      }
    }
  },
  {
    method: 'POST',
    path: pageUrl,
    options: {
      auth: false,
      handler: async (request, h) => {
        const tempApplicationId = generateRandomID()
        setFarmerApplyData(request, keys.farmerApplyData.reference, tempApplicationId)

        const { sbi } = request.payload
        request.logger.setBindings({ sbi })
        const [personSummary, organisationSummary] = await createDevDetails(sbi)

        try {
          const previousApplication = await businessEligibleToApply(organisationSummary.organisation.sbi)

          request.logger.setBindings({ previousApplication })
        } catch (error) {
          if (error instanceof AlreadyAppliedError) {
            const errorMessage = `${sbi} already has an active agreement in the database.`
            return h.view('dev-sign-in-exception', { backLink: `${config.urlPrefix}/endemics/dev-sign-in`, sbi, errorMessage }).code(400).takeover()
          }

          throw error
        }

        setCustomer(request, keys.customer.id, personSummary.id)
        setCustomer(request, keys.customer.crn, personSummary.customerReferenceNumber)
        setOrganisationSessionData(request, personSummary, { ...organisationSummary })

        setAuthCookie(request, personSummary.email, farmerApply)

        return h.redirect(`${urlPrefix}/endemics/check-details`)
      }
    }
  }]
