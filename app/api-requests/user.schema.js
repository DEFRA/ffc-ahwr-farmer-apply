const Joi = require('joi')

const userSchema = Joi.object({
  farmerName: Joi
    .string()
    .trim()
    .required(),
  name: Joi
    .string()
    .trim()
    .required(),
  sbi: Joi
    .string()
    .trim()
    .regex(/^\d{9}$/)
    .required(),
  crn: Joi
    .string()
    .trim()
    .regex(/^\d{10}$/)
    .required(),
  address: Joi
    .string()
    .trim()
    .required(),
  email: Joi
    .string()
    .trim()
    .email()
    .required(),
})

module.exports = userSchema
