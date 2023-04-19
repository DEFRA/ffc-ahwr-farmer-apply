@smoke
Feature: select business

  Scenario: : user navigate to business email to fetch magic link
    Given user navigate to the magic link containing the businessEmail
    When user confirm the magic link page

  Scenario: user business is listed in select your business page
    When user is on the business page
    And user business is listed
    And user select the business
    And user click on the rpa support tab
    Then user should see the rpa contact details
    Then user start application

  Scenario: org-review page
    When user check the business details
    And user confirm the org-review page
    And user agreed the business details is correct
    Then user continue to next page

  Scenario: user select the livestock to apply
    When user is on the livestock page
    And user check if livestock are listed
    And user choose the livestock to review
    Then User continue the application

  Scenario: users animal eligibility
    When user check the minimum number of livestock required to qualify for the review
    And user confirm to meet the requirement
    And user continue the application
    And user check the answer

  Scenario: user accept terms and condition to complete the journey
    When user is on the declaration page
    When user view the page title
    And user read through the full terms and conditions
    And user accept the terms and conditions
#    Then user complete the application
#    Then user should see successful message






