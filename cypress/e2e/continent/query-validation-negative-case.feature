Feature: Continent GraphQL query - negative scenarios

  Background:
    Given the GraphQL endpoint is "https://countries.trevorblades.com/"

  Scenario: Continent query rejects a null code with a validation error
    When I send the "continent" query with a null code
    Then the response status should be 400
    And the response should contain an error message containing "must not be null"

  Scenario: Continent query returns null data for a non-existent code
    When I send the "continent" query with code "ZZ"
    Then the response status should be 200
    And the response should not contain errors
    And the continent in the response should be null

  Scenario Outline: Continents filter with mixed valid and invalid codes returns only valid continents
    When I send the "continents" query filtering codes in "<input_codes>"
    Then the response status should be 200
    And the response should not contain errors
    And the continents response should contain only valid continents from "<input_codes>"

    Examples:
      | input_codes |
      | AS,SA,AA    |
