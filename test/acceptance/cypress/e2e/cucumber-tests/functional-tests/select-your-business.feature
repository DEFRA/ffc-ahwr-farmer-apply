Feature: select the business that's applying

  Scenario: select your business-apply page
    Given user is on the business page
    When user select the business that's applying
    And user confirm the credentials are correct
    And user select the livestock to review
    And user confirm the numbers of livestock
    Then user accept the terms and condition