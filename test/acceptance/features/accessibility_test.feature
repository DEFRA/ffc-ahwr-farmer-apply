
@accessibility
Feature: accessibility test

  Scenario: Apply with valid cred
    Given the user is on the /apply/start page
    And the accessibility should return no violation
    When user start the application
    And the accessibility should return no violation
    When user login with crn and password(for DefraId)
    Then the accessibility should return no violation
