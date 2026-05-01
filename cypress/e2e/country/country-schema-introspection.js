const { When, Then } = require("@badeball/cypress-cucumber-preprocessor");

const introspectionQuery = `
    query IntrospectQuery {
      __schema {
        queryType {
          fields {
            name
            args {
              name
              type {
                kind
                name
                ofType { kind name ofType { kind name } }
              }
            }
            type {
              kind
              name
              ofType { kind name ofType { kind name } }
            }
          }
        }
      }
    }
  `;

const introspectionTypeQuery = `
    query IntrospectType($name: String!) {
      __type(name: $name) {
        name
        kind
        fields {
          name
          type {
            kind
            name
            ofType { kind name ofType { kind name } }
          }
        }
      }
    }
  `;

function typeRefToString(typeRef) {
  if (!typeRef) return "<unknown>";
  if (typeRef.kind === "NON_NULL") return `${typeRefToString(typeRef.ofType)}!`;
  if (typeRef.kind === "LIST") return `[${typeRefToString(typeRef.ofType)}]`;
  return typeRef.name || "<anon>";
}

function getQueryFields(ctx) {
  const fields = ctx.response.body?.data?.__schema?.queryType?.fields;
  expect(fields, "__schema.queryType.fields").to.be.an("array").and.not.empty;
  return fields;
}

When("I introspect the GraphQL Query type", function () {
  cy.request({
    method: "POST",
    url: this.endpoint,
    failOnStatusCode: false,
    body: { query: introspectionQuery },
  }).then((res) => {
    this.response = res;
  });
});

When("I introspect the {string} type", function (typeName) {
  cy.request({
    method: "POST",
    url: this.endpoint,
    failOnStatusCode: false,
    body: {
      query: introspectionTypeQuery,
      variables: { name: typeName },
    },
  }).then((res) => {
    this.response = res;
  });
});

Then("the Query type should expose a {string} field", function (fieldName) {
  const names = getQueryFields(this).map((f) => f.name);
  expect(names, "Query fields").to.include(fieldName);
});

Then("the introspected type kind should be {string}", function (expectedKind) {
  const type = this.response.body?.data?.__type;
  expect(type, "__type").to.exist;
  expect(type.kind, `__type(${type.name}).kind`).to.eq(expectedKind);
});

Then(
  "the {string} field should accept argument {string} of type {string}",
  function (fieldName, argName, expectedType) {
    const field = getQueryFields(this).find((f) => f.name === fieldName);
    expect(field, `Query.${fieldName}`).to.exist;

    const arg = field.args.find((a) => a.name === argName);
    expect(arg, `Query.${fieldName}.${argName}`).to.exist;

    const actualType = typeRefToString(arg.type);
    expect(actualType, `Query.${fieldName}.${argName} type`).to.eq(expectedType);
  }
);

