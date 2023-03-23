@wip
Feature: select business

  Background: business page
    Given the user is on select business page
    When user select the business that's applying

  Scenario: user business not listed
    When user confirm the business page
    And user business is not listed
    Then user should see the Rural Payment Agency contact

  Scenario: user business is listed
    When user confirm the business is listed
    And user select the business
    And user click on start application
    And user confirm the business details and continue
    And user select the livestock to review
    And user confirm to have the minimum number of livestock required
    And user confirm the answers
    And user accept the terms and conditions
    Then user application should be accepted
    And application number should be printed

  Scenario: user reject the terms and conditions
    When user confirm the business is listed
    And user select the business
    And user continue the application
    And user confirm the business details and continue
    And user select the livestock to review
    And user confirm to have the minimum number of livestock required
    And user confirm the answers
    And user reject the terms and conditions
    Then application should be rejected









#
#    Given user is on the business page
#    When user select the business that's applying
#    And user confirm the credentials are correct
#    And user select the livestock to review
#    And user confirm the numbers of livestock
#    Then user accept the terms and condition
