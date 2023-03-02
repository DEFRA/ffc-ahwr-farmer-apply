/// <reference types="cypress" />
const baseUrl = Cypress.config().baseUrl
class CommonAction {

  static navigateToPage (page) {
    cy.visit( baseUrl+page)
  }

  static clickOn(element) {
    cy.get(element, {timeout: 5000}).click();
  }

  static clickWithText(text) {
    cy.contains(text).click()
  }

  static sendKeysWithEnterKey(element, text) {
    cy.get(element, {timeout: 5000})
      .type(text).type('{enter}');
  }

  static elementShouldIncludeText(element, text){
    cy.get(element).should('include.text',text)
  }

  static getElementText(element) {
    cy.get(element, {timeout: 10000}).invoke('text').then((text) => {
      return text
    })
  }
  static checkIfEleExists(element) {
    cy.get('body').then((body) => {
      if (body.find(element) < 0) {
        cy.log('.......... not found')
        return false
      } else {
        return true;
      }
    })
  }

}

module.exports = CommonAction