function selectYourBusinessRadioOptions (businesses, legendText, id, previousAnswer, errorText = undefined, options = {}) {
  const { isPageHeading = true, legendClasses = 'govuk-fieldset__legend--l', inline = false, hintHtml = '' } = options
  const items = []
  businesses.forEach(business => {
    const item = {
      value: business.sbi,
      text: `${business.sbi} - ${business.name}`,
      checked: previousAnswer === business.sbi
    }
    items.push(item)
  })
  return {
    radios: {
      classes: inline ? 'govuk-radios--inline' : undefined,
      idPrefix: id,
      name: id,
      fieldset: {
        legend: {
          text: legendText,
          isPageHeading,
          classes: legendClasses
        }
      },
      hint: {
        html: hintHtml
      },
      items,
      ...(errorText ? { errorMessage: { text: errorText } } : {})
    }
  }
}

module.exports = {
  selectYourBusinessRadioOptions
}
