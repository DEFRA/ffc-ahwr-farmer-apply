@smoke-reg1
Feature:285796-Dev 10 Customer onboarding screen 3 Agreement apply journey
Scenario: AC1 Review and follow up species must be for same species confirmation
    Given the user is on the /apply/start page
    Then start the application
    And user login with Single business crn and password(for DefraId)
    #Then Accept the Cookies
    When user check the business details
    And user confirm the org-review page
    And user agreed the business details is correct
    Then user continue to next page

    Scenario:AC2-Review and follow up species must be for same species confirmation
    #Then user confirm Review Page
    Then agree Reviews and follow up for the same species
    Then Validate if the user had landed on minimun live stock page
    Then agree the Minimum number of livestock
    Then Validate if the user had landed on timining and funding
    Then agree Timing of vet visits and funding claims
    Then Validate if the user had landed on review agreement offer
    Then user complete the application
    Then user should see successful message

