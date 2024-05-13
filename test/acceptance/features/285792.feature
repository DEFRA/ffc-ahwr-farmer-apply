@smokeTest1
Feature:US-285792- Exception screens for Customer onboarding screen 2 Agreement apply journey
Scenario: AC1 Review and follow up species must be for same species confirmation
    Given the user is on the /apply/start page
    Then start the application
    And user login with Single business crn and password(for DefraId)
    Then Accept the Cookies
    When user check the business details
    And user confirm the org-review page
    And user agreed the business details is correct
    Then user continue to next page

    Scenario:AC2-Review and follow up species must be for same species confirmation
    Then user confirm Review Page
    Then agree Reviews and follow up for the same species
    Then Validate if the user had landed on minimun live stock page
    Then user click on Reject
    Then Validate the reject agreement offer

    
    Scenario:AC- 6 Validate call charges screen
    Then validate call charges screen

    Scenario:AC4-Gov.uk link on the header
    Then click on gov.uk in the left pane
    Then validate if the user redirected to gov.uk 

    Scenario:AC-5 Service name link on the header

    Given the user is on the /apply/start page
    Then start the application
    When user check the business details
    And user confirm the org-review page
    And user agreed the business details is correct
    Then user continue to next page
    Then user is able to see the Annual health and welfare review of livestock link on the middle top of the header
    Then user clicks on the service name link
    Then user must be redirected to service guidance start pages