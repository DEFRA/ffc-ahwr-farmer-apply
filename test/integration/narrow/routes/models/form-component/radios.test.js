const radios = require('../../../../../../app/routes/models/form-component/radios')

describe('radios', () => {
  test.each([
    {
      toString: () => 'Test name',
      given: {
        legendText: 'Legend Text',
        id: 'ID',
        errorText: 'Error Text',
        options: {
          isPageHeading: true,
          legendClasses: 'govuk-fieldset__legend--l',
          inline: false
        }
      },
      when: {
        items: [
          {
            name: 'item name'
          }
        ]
      },
      expect: {
        radios: {
          classes: undefined,
          idPrefix: 'ID',
          name: 'ID',
          fieldset: {
            legend: {
              text: 'Legend Text',
              isPageHeading: true,
              classes: 'govuk-fieldset__legend--l'
            }
          },
          hint: {
            html: ''
          },
          items: [
            { name: 'item name' }
          ],
          errorMessage: {
            text: 'Error Text'
          }
        }
      }
    },
    {
      toString: () => 'Test name',
      given: {
        legendText: 'Legend Text',
        id: 'ID',
        options: {
          isPageHeading: true,
          legendClasses: 'govuk-fieldset__legend--l',
          inline: true
        }
      },
      when: {
        items: [
          {
            name: 'item name'
          }
        ]
      },
      expect: {
        radios: {
          classes: 'govuk-radios--inline',
          idPrefix: 'ID',
          name: 'ID',
          fieldset: {
            legend: {
              text: 'Legend Text',
              isPageHeading: true,
              classes: 'govuk-fieldset__legend--l'
            }
          },
          hint: {
            html: ''
          },
          items: [
            { name: 'item name' }
          ]
        }
      }
    },
    {
      toString: () => 'Test name',
      given: {
        legendText: 'Legend Text',
        id: 'ID'
      },
      when: {
        items: [
          {
            name: 'item name'
          }
        ]
      },
      expect: {
        radios: {
          classes: undefined,
          idPrefix: 'ID',
          name: 'ID',
          fieldset: {
            legend: {
              text: 'Legend Text',
              isPageHeading: true,
              classes: 'govuk-fieldset__legend--l'
            }
          },
          hint: {
            html: ''
          },
          items: [
            { name: 'item name' }
          ]
        }
      }
    }
  ])('%s', async (testCase) => {
    expect(radios(
      testCase.given.legendText,
      testCase.given.id,
      testCase.given.errorText,
      testCase.given.options
    )(testCase.when.items)).toEqual(
      testCase.expect
    )
  })
})
