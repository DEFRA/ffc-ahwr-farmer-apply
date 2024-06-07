@smoke
Feature:Exception screen for Customer onboarding screen 1 Agreement apply journey
Scenario: AC1 Review and follow up species must be for same species confirmation
    Given the user is on the /apply/start page
    Then start the application
    And user login with Single business crn and password(for DefraId)
    Then Accept the Cookies
    When user check the business details
    And user confirm the org-review page
    And user agreed the business details is correct
    Then user continue to next page
    Then user confirm Review Page
    Then user clicks I do not agree-Reject agreement
    Then validate You cannot continue with your application

    Scenario:AC-2 Validate call charges screen
    Then validate call charges screen
    
    Scenario:AC-3 Gov.uk link on the header
    Then click on gov.uk in the left pane
    Then validate if the user redirected to gov.uk 

    Scenario:AC-4 Service name link on the header

    Given the user is on the /apply/start page
    Then start the application
    When user check the business details
    And user confirm the org-review page
    And user agreed the business details is correct
    Then user continue to next page
    Then user is able to see the Annual health and welfare review of livestock link on the middle top of the header
    Then user clicks on the service name link
    Then user must be redirected to service guidance start pages