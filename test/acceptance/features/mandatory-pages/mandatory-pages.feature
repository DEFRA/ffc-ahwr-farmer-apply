Feature: Mandatory pages
  Scenario: Cookie page
    Given I open the site "/cookies"
    Then I expect that the title contains "Annual health and welfare review of livestock - GOV.UK"
