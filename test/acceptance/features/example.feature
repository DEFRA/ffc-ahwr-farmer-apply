@smoke
Feature: Apply journey smoke tests

  Scenario Outline: Apply with invalid cred
    Given the user is on the /apply/start page
    When user start the application
    Examples:
      | invalid credential   |
      | lalal_@email         |