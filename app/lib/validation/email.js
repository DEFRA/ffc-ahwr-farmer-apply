import joi from 'joi'

module.exports = {
  email: joi.string().trim().email().lowercase().required()
    .messages({
      'any.required': 'Enter an email address',
      'string.base': 'Enter an email address',
      'string.email': 'Enter an email address in the correct format, like name@example.com',
      'string.empty': 'Enter an email address'
    })
}
