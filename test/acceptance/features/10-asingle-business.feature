
@smokeRegression

Feature: select business

  Scenario: Apply with valid cred
    Given the user is on the /apply/start page
    Then start the application
    And user login with Single business crn and password(for DefraId)

  Scenario: org-review page
    When user check the business details
    And user confirm the org-review page
    And user agreed the business details is correct
    Then user continue to next page
    

  Scenario Outline: user select the livestock to apply
    When user is on the livestock page
    And user check if livestock are listed
    And user choose <LiveStockName> cattle for review
    Then User continue the application
    Examples:
      | LiveStockName |
      | Sheep         |
  #choose the livestock from the example, eg:Beef, Diary and Pigs
  Scenario: users animal eligibility
    When user check the minimum number of livestock required to qualify for the review
    And user confirm to meet the requirement
    Then the user continue the application
    And user check the answer
   

  Scenario: user accept terms and condition to complete the journey
    When user is on the declaration page
    When user view the page title
    And user read through the full terms and conditions
    And user accept the terms and conditions
    Then user complete the application
    Then user should see successful message

    








