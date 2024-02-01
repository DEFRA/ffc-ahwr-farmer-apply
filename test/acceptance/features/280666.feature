@smoke

Feature: 280666-Choose a business screen exceptions for mid and high multi

Scenario: AC1 Exception screen for ineligible SBI (no CPH registered to it)
 Given the user is on the /apply/start page
    Then start the application
    And user login with Exception-MB-NCPH business crn and password(for DefraId)

Scenario Outline: org-review page
    When select the <business> for application
    When click on continue button
    Examples:
    |business|
    |Mr R Chapman |

Scenario:Validate Exception Message for Apply - Multi Business exceptions - No CPH
   When validate the error message in the Header
   And validate exception error message for MB-NO CPH
   Then validate call charges screen

Scenario: AC2 Error screen for ineligible SBI (no permission to act on behalf of SBI)
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

Scenario: AC4 Error for no SBI selected (Mid Multi use case)
 Given the user is on the /apply/start page
    Then start the application
    And user login with Exception-MB-NCPH business crn and password(for DefraId)

Scenario Outline: org-review page
     When click on continue button
    

Scenario:Validate Exception Message for Apply - Multi Business exceptions - No CPH
   When validate the error message in the Header
   And validate exception error message for MB-NO CPH
   Then validate call charges screen

Scenario: AC4 Error for no SBI selected (Mid Multi use case)
 Given the user is on the /apply/start page
    Then start the application
    And user login with Exception-MB-NCPH business crn and password(for DefraId)

Scenario Outline: org-review page
     When click on continue button
    

Scenario:Validate Exception Message for Apply - Multi Business exceptions - No CPH
   When validate the error message in the Header
   And validate exception error message for MB-NO CPH
   Then validate call charges screen