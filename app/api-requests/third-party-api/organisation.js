const { get } = require('./base')
const config = require('../../config')
const session = require('../../session')
const { tokens } = require('../../session/keys')
const decodeJwt = require('../../auth/access-token/jwt/decode-jwt')
const hostname = config.authConfig.ruralPaymentsAgency.hostname
const getOrganisationPermissionsUrl = config.authConfig.ruralPaymentsAgency.getOrganisationPermissionsUrl
const getOrganisationUrl = config.authConfig.ruralPaymentsAgency.getOrganisationUrl
const validPermissions = ['Submit - bps', 'Full permission - business']

function getOrganisationAddress (address) {
  const address1 = address.address1 != null ? address.address1 : ''
  const city = address.city != null ? address.city : ''
  const county = address.county != null ? address.county : ''
  const postalCode = address.postalCode != null ? address.postalCode : ''
  return address1.concat(' ', city, ' ', county, ' ', postalCode).trim().replaceAll(/ +/g, ' ')
}

function parsedAccessToken (request) {
  const accessToken = session.getToken(request, tokens.accessToken)
  return decodeJwt(accessToken)
}

const getOrganisationAuthorisation = async (request) => {
  const organisationId = parsedAccessToken(request).currentRelationshipId
  const response = await get(hostname, getOrganisationPermissionsUrl.replace('organisationId', organisationId), request)
  return response?.data
}

const permissionMatcher = (permissions, permissionToMatch) => {
  return permissions.every(value => permissionToMatch.includes(value))
}

const organisationHasPermission = async (request, permissions, personId) => {
  const organisationAuthorisation = await getOrganisationAuthorisation(request)
  const personPrivileges = organisationAuthorisation.personPrivileges.filter(privilege => privilege.personId === personId)
  const hasPermission = personPrivileges.some(privilege => permissionMatcher(privilege.privilegeNames, permissions))
  return hasPermission
}

const getOrganisation = async (request) => {
  const organisationId = parsedAccessToken(request).currentRelationshipId
  const response = await get(hostname, getOrganisationUrl.replace('organisationId', organisationId), request)
  return response?._data
}

const organisationIsEligible = async (request, personId) => {
  let organisation = {}
  const organisationPermission = await organisationHasPermission(request, validPermissions, personId)

  if (organisationPermission) {
    organisation = await getOrganisation(request)
  }

  return {
    organisationPermission,
    organisation
  }
}

module.exports = {
  organisationIsEligible,
  getOrganisationAddress
}
