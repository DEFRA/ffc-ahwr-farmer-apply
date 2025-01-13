export const apiHeaders = {
  xForwardedAuthorization: 'X-Forwarded-Authorization',
  ocpSubscriptionKey: 'Ocp-Apim-Subscription-Key'
}

export const applicationType = {
  ENDEMICS: 'EE',
  VET_VISITS: 'VV'
}

export const species = {
  beef: 'beef',
  dairy: 'dairy',
  pigs: 'pigs',
  sheep: 'sheep'
}

export const states = {
  alreadyClaimed: 'already_claimed',
  alreadySubmitted: 'already_submitted',
  error: 'error',
  failed: 'failed',
  notExist: 'not_exist',
  notFound: 'not_found',
  notSubmitted: 'not_submitted',
  submitted: 'submitted',
  success: 'success'
}

export const status = {
  AGREED: 1,
  WITHDRAWN: 2,
  IN_CHECK: 5,
  ACCEPTED: 6,
  NOT_AGREED: 7,
  PAID: 8,
  READY_TO_PAY: 9,
  REJECTED: 10,
  ON_HOLD: 11,
  RECOMMENDED_TO_PAY: 12,
  RECOMMENDED_TO_REJECT: 13,
  AUTHORISED: 14,
  SENT_TO_FINANCE: 15,
  PAYMENT_HELD: 16
}

export const farmerApply = 'farmerApply'

export const userType = {
  EXISTING_USER: 'existingUser',
  NEW_USER: 'newUser'
}
