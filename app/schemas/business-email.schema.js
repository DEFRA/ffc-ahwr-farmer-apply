const Joi = require('joi')

module.exports = Joi
  .string()
  .trim()
  .lowercase()
  .email({ tlds: false })
  .pattern(/^([a-zA-Z0-9._+-]{1,64})@([a-zA-Z0-9.-]{1,255}\.[a-zA-Z]{2,})$/)
  .required()
