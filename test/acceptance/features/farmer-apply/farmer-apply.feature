Feature: Farmer apply

  @wip
  Scenario: Farmer applies for magic link with wrong email.
    Given I am on the landing page
#    Then I click on farmer Apply
    Then I click on startNow
    When I enter my invalid "livsey.willaism@rpa.com"
    Then I should see an error "livsey.willaism@rpa.com"

  @wip
  Scenario: Farmer applies for magic link
    Given I am on the landing page
#    Then I click on farmer Apply
    Then I click on startNow
    When I enter my valid "livsey-erubamie.williams@capgemini.com"

 @wip
  Scenario: Farmer completes application
     Given farmer clicks on email link "afc64e3c-ee87-4509-a582-382b01ddfb4f" "livsey-erubamie.williams@capgemini.com"
     When I select yes my details are correct on farmer review page
     And I select beef cattle on the livestock review page
     And I select yes option from farmer eligibility
     And I select confirm from check your answers
     And  I check the terms and condition checkbox and click submit application
     Then I go back to start page
     And I click startNow
     And I select yes my details are correct on farmer review page
     And I select dairy cattle on the livestock review page
     And I select yes option from farmer eligibility
     And I select confirm from check your answers
     And I check the terms and condition checkbox and click submit application
     Then I go back to start page
     Then I click startNow
     When I select yes my details are correct on farmer review page
     Then I select sheep cattle on the livestock review page
     Then I select yes option from farmer eligibility
     Then I select confirm from check your answers
     And I check the terms and condition checkbox and click submit application
     Given I go back to start page
     Then I click startNow
     When I select yes my details are correct on farmer review page
     Then I select pig cattle on the livestock review page
     Then I select yes option from farmer eligibility
     Then I select confirm from check your answers
     And I check the terms and condition checkbox and click submit application
     #Given I go back to start page







