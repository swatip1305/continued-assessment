Feature: Country GraphQL schema - introspection contract

  Background:
    Given the GraphQL endpoint is "https://countries.trevorblades.com/"

  Scenario Outline: query field is exposed with the expected argument contract
    When I introspect the GraphQL Query type
    Then the response status should be 200
    And the response should not contain errors
    And the Query type should expose a "<field>" field
    And the "<field>" field should accept argument "<arg>" of type "<argType>"

    Examples:
      | field   | arg  | argType |
      | country | code | ID!     |

  Scenario Outline: introspected named type is the expected kind
    When I introspect the "<typeName>" type
    Then the response status should be 200
    And the response should not contain errors
    And the introspected type kind should be "<kind>"

    Examples:
      | typeName | kind   |
      | Country  | OBJECT |
