

@smokeTest1
Feature:278300- Review agreement offer screen - Agreement Apply journey
Scenario: AC1 Review and follow up species must be for same species confirmation
    Given the user is on the /apply/endemics/start/ page
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
    Then agree the Minimum number of livestock
     Then Validate if the user had landed on timining and funding
    Then agree Timing of vet visits and funding claims
    Then Validate if the user had landed on review agreement offer


    Scenario: AC-3 Click back link
    Then user clicks on back link
    Then Validate if the user had landed on timining and funding


    Scenario: AC-4 Terms and conditions
    Then agree Timing of vet visits and funding claims
    Then Validate if the user had landed on review agreement offer
    And user read through the full terms and conditions
    And user accept the terms and conditions
    And user accept the terms and conditions
    Then user complete the application
    Then user should see successful message


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
    # # Then Validate if the user had landed on minimun live stock page
    # # Then agree the Minimum number of livestock
    # # Then Validate if the user had landed on timining and funding
    # # Then agree Timing of vet visits and funding claims
    # # Then Validate if the user had landed on review agreement offer
    # # Then Validate the reject agreement offer
