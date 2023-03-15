Feature: Test start page

    Scenario: Open start page

        Given I open the url "/start"
        Then I should see "Welcome to the test application"