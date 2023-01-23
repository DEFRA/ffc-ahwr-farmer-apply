const Joi = require('joi')

module.exports = Joi
  .string()
  .trim()
  .email()
  .required()
