Feature: Farmer apply
  @wip
  Scenario: Farmer receives email when signing in
    Given I open the site "/login"
    Then I expect that the title contains "Sign in - Annual health and welfare review of your livestock"
    And I expect that element "h1" contains the text "Enter your email address"
    When I click on the button "#submit"
