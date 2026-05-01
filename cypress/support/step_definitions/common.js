const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");

const COUNTRY_DATA_SET_QUERY = `
  query GetCountry($code: ID!) {
    country(code: $code) {
      code
      name
      phone
      currency
      states {
        code
        name
      }
    }
  }
`;

Given("the GraphQL endpoint is {string}", function (url) {
  this.endpoint = url;
});

When("I send the country data set query with code {string}", function (code) {
  cy.request({
    method: "POST",
    url: this.endpoint,
    failOnStatusCode: false,
    body: {
      query: COUNTRY_DATA_SET_QUERY,
      variables: { code },
    },
  }).then((res) => {
    this.response = res;
  });
});

Then("the response status should be {int}", function (status) {
  expect(this.response.status).to.eq(status);
});

Then("the response should not contain errors", function () {
  expect(this.response.body.errors, "graphql errors").to.be.undefined;
});
