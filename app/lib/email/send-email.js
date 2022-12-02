const notifyClient = require('./notify-client')

module.exports = async (templateId, email, options) => {
  let success = true
  try {
    console.log(`Attempting to send email with template ID ${templateId} to email ${email}`)
    await notifyClient.sendEmail(templateId, email, options)
  } catch (e) {
    success = false
    console.error(`Error occurred during sending email of to ${email} with template ID ${{templateId}}.`, e.response.data)
  }
  console.log(`Successfully sent email with template ID ${templateId} to email ${email}.`)
  return success
}
