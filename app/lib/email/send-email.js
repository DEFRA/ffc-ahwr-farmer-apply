const notifyClient = require('./notify-client')

module.exports = async (templateId, email, options) => {
  try {
    console.log(`Attempting to send email with template ID ${templateId} to email ${email}`)
    await notifyClient.sendEmail(templateId, email, options)
    console.log(`Successfully sent email with template ID ${templateId} to email ${email}.`)
    return true
  } catch (e) {
    console.error(`Error ${JSON.stringify(e.response.data.errors)} occurred during sending of email to address ${email} with template ID ${templateId}.`)
    return false
  }
}
