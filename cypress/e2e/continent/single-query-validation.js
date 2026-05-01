const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");

const COUNTRY_QUERY = `
  query GetCountry($code: ID!) {
    country(code: $code) {
      code
      name
      capital
      currency
      emoji
      languages {
        code
        name
      }
    }
  }
`;

Given("I load expected country data from fixture {string}", function (fixturePath) {
  cy.fixture(fixturePath).then((data) => {
    this.expectedCountry = data;
  });
});

When('I send the "country" query with the fixture code', function () {
  cy.request({
    method: "POST",
    url: this.endpoint,
    body: {
      query: COUNTRY_QUERY,
      variables: { code: this.expectedCountry.code },
    },
  }).then((res) => {
    this.response = res;
  });
});

Then("the country response should match the fixture", function () {
  const country = this.response.body.data.country;
  expect(country.code).to.eq(this.expectedCountry.code);
  expect(country.name).to.eq(this.expectedCountry.name);
  expect(country.capital).to.eq(this.expectedCountry.capital);
  const actualCurrencies = (country.currency || "").split(",").map((c) => c.trim());
  expect(actualCurrencies, "currencies").to.include(this.expectedCountry.currency);
});

Then("the country {string} should not be empty", function (field) {
  const value = this.response.body.data.country[field];
  expect(value, field).to.be.a("string").and.not.be.empty;
});

Then("the country should have at least the expected number of languages", function () {
  const languages = this.response.body.data.country.languages;
  expect(languages).to.be.an("array");
  expect(languages.length).to.be.at.least(this.expectedCountry.minLanguages);
});
