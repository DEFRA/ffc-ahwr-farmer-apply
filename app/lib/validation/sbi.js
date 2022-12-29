const Joi = require('joi')
const { sbi: sbiErrorMessages } = require('../error-messages')

module.exports = {
  sbi: Joi.string().trim().regex(/^\d{9}$/).required()
    .messages({
      'any.required': sbiErrorMessages.enterSbi,
      'string.base': sbiErrorMessages.enterSbi,
      'string.empty': sbiErrorMessages.enterSbi,
      'string.pattern.base': sbiErrorMessages.enterSbiNumberThatHas9Digits
    })
}