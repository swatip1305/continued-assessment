Feature: Continents GraphQL query - string query operation (filter by code IN list)

  Background:
    Given the GraphQL endpoint is "https://countries.trevorblades.com/"

  Scenario Outline: Filter continents by code IN list returns only the requested codes
    When I send the "continents" query filtering codes in "<codes>"
    Then the response status should be 200
    And the response should not contain errors
    And the continents response should contain exactly the codes "<codes>"
    And every continent in the response should have a non-empty "code"
    And every continent in the response should have a non-empty "name"

    Examples:
      | codes             |
      | AS                |
      | AS,SA             |
      | AF,AS,EU          |
      | AF,AN,AS,EU,NA,OC,SA |

  Scenario Outline: Filter continents by code IN with no matching codes returns empty list
    When I send the "continents" query filtering codes in "<codes>"
    Then the response status should be 200
    And the response should not contain errors
    And the continents response should be empty

    Examples:
      | codes  |
      | ZZ     |
      | XX,YY  |
