const Joi = require('joi')

const MIN_CRN_NUMBER = 1100000000
const MAX_CRN_NUMBER = 1110000000

module.exports = Joi
  .number()
  .required()
  .integer()
  .min(MIN_CRN_NUMBER)
  .max(MAX_CRN_NUMBER)
  .less(10000000000)
  .greater(999999999.9)
