@wip
Feature: Farmer apply


  Scenario: Farmer applies for magic link with wrong email.
    Given I am on the landing page
    Then I click on startNow
    When I enter my invalid "livsey.willaism@rpa.com"
    Then I should see an error "livsey.willaism@rpa.com"


  Scenario: Farmer applies for magic link
    Given I am on the landing page
    Then I click on startNow
    When I enter my valid "livsey-erubamie.williams@capgemini.com"


  Scenario: Farmer details incorrect
     Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
     And I select No my details are not correct on farmer review page
     Then I should presented with "Update your details" on the org-review page
     And I should see the link "update your details with the Rural Payments Agency" on the org-review page


  Scenario:  Farmer completes application for Beef Cattle
     Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
     When I select yes my details are correct on farmer review page
     And I select beef cattle on the livestock review page
     And I select yes option from farmer eligibility
     And I select confirm from check your answers
     And  I check the terms and condition checkbox and click submit application


  Scenario:  Farmer not eligible for Beef Cattle application
    Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
    When I select yes my details are correct on farmer review page
    And I select beef cattle on the livestock review page
    And I select no option from farmer eligibility
    Then I should presented with "You're not eligible to apply" on the not-eligible page
    And I should see the link "find out if you could be eligible for other farming schemes." on the not-eligible page

  Scenario:  Farmer rejects offer for Beef Cattle
    Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
    When I select yes my details are correct on farmer review page
    And I select beef cattle on the livestock review page
    Then I select yes option from farmer eligibility
    And I select confirm from check your answers
    Then  I select reject offer
    And I should see "You’ve rejected the agreement offer"

  Scenario:  Farmer completes application for Dairy Cattle
    Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
    When I select yes my details are correct on farmer review page
    And I select dairy cattle on the livestock review page
    And I select yes option from farmer eligibility
    And I select confirm from check your answers
    And  I check the terms and condition checkbox and click submit application

  Scenario:  Farmer not eligible for Dairy Cattle application
    Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
    When I select yes my details are correct on farmer review page
    And I select dairy cattle on the livestock review page
    And I select no option from farmer eligibility
    Then I should presented with "You're not eligible to apply" on the not-eligible page
    And I should see the link "find out if you could be eligible for other farming schemes." on the not-eligible page

  Scenario:  Farmer rejects offer for Dairy Cattle
    Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
    When I select yes my details are correct on farmer review page
    And I select dairy cattle on the livestock review page
    And I select yes option from farmer eligibility
    And I select confirm from check your answers
    Then  I select reject offer
    And I should see "You’ve rejected the agreement offer"

  Scenario:  Farmer completes application for Sheep Cattle
    Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
    When I select yes my details are correct on farmer review page
    Then I select sheep cattle on the livestock review page
    And I select yes option from farmer eligibility
    And I select confirm from check your answers
    And  I check the terms and condition checkbox and click submit application

  Scenario:  Farmer not eligible for Sheep Cattle application
    Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
    When I select yes my details are correct on farmer review page
    Then I select sheep cattle on the livestock review page
    And I select no option from farmer eligibility
    Then I should presented with "You're not eligible to apply" on the not-eligible page
    And I should see the link "find out if you could be eligible for other farming schemes." on the not-eligible page

  Scenario:  Farmer rejects offer for Sheep Cattle
    Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
    When I select yes my details are correct on farmer review page
    Then I select sheep cattle on the livestock review page
    And I select yes option from farmer eligibility
    And I select confirm from check your answers
    Then  I select reject offer
    And I should see "You’ve rejected the agreement offer"


  Scenario:  Farmer completes application for Pig
    Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
    When I select yes my details are correct on farmer review page
    Then I select pig on the livestock review page
    And I select yes option from farmer eligibility
    And I select confirm from check your answers
    And  I check the terms and condition checkbox and click submit application

  Scenario:  Farmer not eligible for Pig Application
    Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
    When I select yes my details are correct on farmer review page
    Then I select pig on the livestock review page
    And I select no option from farmer eligibility
    Then I should presented with "You're not eligible to apply" on the not-eligible page
    And I should see the link "find out if you could be eligible for other farming schemes." on the not-eligible page

  Scenario:  Farmer reject application for Pig
    Given farmer clicks on email link "fd51a82f-2030-45f1-83e6-775f7ed86091" "livsey-erubamie.williams@capgemini.com"
    When I select yes my details are correct on farmer review page
    Then I select pig on the livestock review page
    And I select yes option from farmer eligibility
    And I select confirm from check your answers
    Then  I select reject offer
    And I should see "You’ve rejected the agreement offer"





