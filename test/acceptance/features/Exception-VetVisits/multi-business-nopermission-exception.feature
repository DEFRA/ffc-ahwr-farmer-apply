@smoke

Feature: Business Exceptions Validation- Multi Business exceptions - No Permission

Scenario: Apply with valid cred
    Given the user is on the /apply/start page
   Then start the application
    And user login with Exception-MB-NP business crn and password(for DefraId)

Scenario Outline: org-review page
    When select the <business> for application
    When click on continue button
    Examples:
    |business|
    |Lonsdale Health - SBI 106240540|

Scenario:Validate Exception Message for Apply - Multi Business exceptions - No CPH
   When validate the error message in the Header
   And validate exception error message for MB-NO Permission
   Then validate call charges screen