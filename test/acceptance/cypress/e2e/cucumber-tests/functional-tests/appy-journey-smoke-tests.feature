@smoke
Feature: Apply journey smoke tests


  Scenario Outline: Apply with invalid cred
    Given the user is on the apply/start page
    When user start the application
    And user apply with <invalid credential>
    Then an email error is displayed
    Examples:
      | invalid credential   |
      | lalal_@email         |

  Scenario Outline: Apply with valid cred
    Given the user is on the apply/start page
    When user start the application
    And user apply with <valid credential>
    Then magic link is sent to user email
    Examples:
      | valid credential   |
      | ibrahim.adekanmi@kainos.com|
