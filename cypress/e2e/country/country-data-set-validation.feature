Feature: Country GraphQL query - data set validation

  Background:
    Given the GraphQL endpoint is "https://countries.trevorblades.com/"
    When I send the country data set query with code "US"
    Then the response status should be 200
    And the response should not contain errors

  Scenario: Country and state fields have correct data types
    Then the country field "code" should be of type "string"
    And the country field "name" should be of type "string"
    And the country field "phone" should be of type "string"
    And the country field "currency" should be of type "string"
    And the country field "states" should be of type "array"
    And every state entry should have "code" of type "string"
    And every state entry should have "name" of type "string"

  Scenario: Non-null fields have non-empty values
    Then the country non-null field "code" should have a value
    And the country non-null field "name" should have a value
    And the country non-null field "phone" should have a value
    And the country non-null field "states" should have a value
    And every state should have a non-empty "name"

  Scenario: Country and states values fall within expected ranges
    Then the country "code" should be a valid ISO country code
    And the country "name" should equal "United States"
    And the country "phone" should be a valid phone code
    And the country "currency" should be a valid currency code
    And the country should have the expected minimum number of US states
    And every state "code" should be a valid US state code
