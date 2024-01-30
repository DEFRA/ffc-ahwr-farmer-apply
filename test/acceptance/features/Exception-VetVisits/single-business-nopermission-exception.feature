@smoke

Feature: Business Exceptions Validation- Single Business exceptions - No Permission

 Scenario: Apply with valid cred
    Given the user is on the /apply/start page
    Then start the application
     And user login with Exception-SB-NP business crn and password(for DefraId)

Scenario:Validate Exception Message for Apply - Single Business exceptions - No Permission
   When validate the error message in the Header
   And validate exception error message for SB-NO Permission
   Then validate call charges screen