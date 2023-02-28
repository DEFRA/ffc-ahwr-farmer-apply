/// <reference types="cypress" />
//const TEST_ENV = 'https://ffc-ahwr-farmer-test.azure.defra.cloud/'
const TEST_ENV = 'http://localhost:3000/'
//require("dotenv").config({ path: `./.env.${process.env.NODE_ENV}`})
class CommonAction {

  static navigateToPage (page) {
    cy.visit( process.env.URL+page)
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