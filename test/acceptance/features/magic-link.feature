@smoke
Feature: click on magic link sent to notification email

  Scenario: user navigate to business email to fetch magic link
    Given user navigate to the magic link containing the businessEmail
    Then url should contain <email>
    Examples:
      | email |
      | ibrahim.adekanmi@kainos.com|
