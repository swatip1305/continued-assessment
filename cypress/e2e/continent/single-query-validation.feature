Feature: Country GraphQL query

  Background:
    Given the GraphQL endpoint is "https://countries.trevorblades.com/"

  Scenario: Fetch a country by its ISO code returns full country details
    Given I load expected country data from fixture "countries/US"
    When I send the "country" query with the fixture code
    Then the response status should be 200
    And the response should not contain errors
    And the country response should match the fixture
    And the country "emoji" should not be empty
    And the country should have at least the expected number of languages
