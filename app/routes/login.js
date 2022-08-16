const Joi = require('joi')
const { getByEmail } = require('../api-requests/users')
const { email: emailValidation } = require('../lib/validation/email')
const { clear, setFarmerApplyData } = require('../session')
const { organisation: organisationKey } = require('../session/keys').farmerApplyData

module.exports = [{
  method: 'GET',
  path: '/login',
  options: {
    handler: async (_, h) => {
      return h.view('login')
    }
  }
},
{
  method: 'POST',
  path: '/login',
  options: {
    validate: {
      payload: Joi.object({
        email: emailValidation
      }),
      failAction: async (request, h, error) => {
        return h.view('login', { ...request.payload, errorMessage: { text: error.details[0].message }, hintText: 'Oh dear!!' }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email } = request.payload
      const organisation = await getByEmail(email)

      if (!organisation) {
        return h.view('login', { ...request.payload, errorMessage: { text: `No user found with email address "${email}"` }, hintText: 'Oh dear!!' }).code(400).takeover()
      }

      clear(request)
      setFarmerApplyData(request, organisationKey, organisation)

      return h.redirect('/org-review')
    }
  }
}]
