Feature: Country GraphQL query - currency data consistency

  Background:
    Given the GraphQL endpoint is "https://countries.trevorblades.com/"

  Scenario Outline: country.currency and country.currencies fields are present and correctly typed
    When I send the country currency query with code "<code>"
    Then the response status should be 200
    And the response should not contain errors
    And the country field "currency" should be of type "string"
    And the country field "currencies" should be of type "array"

    Examples:
      | code |
      | PA   |

  Scenario Outline: every currency in the CSV string is present in the currencies array and vice versa
    When I send the country currency query with code "<code>"
    Then the response status should be 200
    And the response should not contain errors
    And every currency in the "currency" CSV should appear in the "currencies" array
    And every currency in the "currencies" array should appear in the "currency" CSV
    And the "currency" CSV count should equal the "currencies" array count
    And the "currency" CSV and the "currencies" array should not contain duplicate values

    Examples:
      | code |
      | PA   |
