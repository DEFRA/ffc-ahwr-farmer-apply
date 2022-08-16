/**
 * Generate GOV.UK radios component.
 *
 * @param {string} legendText heading text for radios.
 * @param {string} id of the radio component.
 * @param {string} previousAnswer - one of the four species.
 * @param {string} [errorText] error message to display.
 * @param {object} [options] an object containing `isPageHeading` (boolean, determines if the legendText is marked as a heading), `legendClasses` (string, contains classes to add to legendText), `inline` (boolean determines if the class to make the radios display as inline is added) and hintHtml (html string to display hint message with the radio button).
 *
 * @return {object} object with `radios` property containing radios component.
 */
function speciesRadios (legendText, id, previousAnswer, errorText = undefined, options = {}) {
  const { isPageHeading = true, legendClasses = 'govuk-fieldset__legend--l', inline = false, hintHtml = '' } = options
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
      items: [
        {
          value: 'beef',
          text: 'Beef cattle',
          checked: previousAnswer === 'beef'
        },
        {
          value: 'dairy',
          text: 'Dairy cattle',
          checked: previousAnswer === 'dairy'
        },
        {
          value: 'sheep',
          text: 'Sheep',
          checked: previousAnswer === 'sheep'
        },
        {
          value: 'pigs',
          text: 'Pigs',
          checked: previousAnswer === 'pigs'
        }
      ],
      ...(errorText ? { errorMessage: { text: errorText } } : {})
    }
  }
}

module.exports = {
  speciesRadios
}
