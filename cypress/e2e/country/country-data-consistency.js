const { When, Then } = require("@badeball/cypress-cucumber-preprocessor");

const COUNTRY_CURRENCY_QUERY = `
  query GetCountryCurrency($code: ID!) {
    country(code: $code) {
      code
      name
      currency
      currencies
    }
  }
`;

function parseCsv(csv) {
  return (csv || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

When("I send the country currency query with code {string}", function (code) {
  cy.request({
    method: "POST",
    url: this.endpoint,
    failOnStatusCode: false,
    body: {
      query: COUNTRY_CURRENCY_QUERY,
      variables: { code },
    },
  }).then((res) => {
    this.response = res;
    const country = res.body?.data?.country || {};
    this.stringDerived = parseCsv(country.currency);
    this.arrayDerived = Array.isArray(country.currencies) ? country.currencies : [];
  });
});

Then('every currency in the "currency" CSV should appear in the "currencies" array', function () {
  this.stringDerived.forEach((c) => {
    expect(this.arrayDerived, `arrayDerived should include ${c}`).to.include(c);
  });
});

Then('every currency in the "currencies" array should appear in the "currency" CSV', function () {
  this.arrayDerived.forEach((c) => {
    expect(this.stringDerived, `stringDerived should include ${c}`).to.include(c);
  });
});

Then('the "currency" CSV count should equal the "currencies" array count', function () {
  expect(this.stringDerived.length, "stringDerived count").to.eq(this.arrayDerived.length);
});

Then('the "currency" CSV and the "currencies" array should not contain duplicate values', function () {
  const stringUnique = new Set(this.stringDerived).size === this.stringDerived.length;
  const arrayUnique = new Set(this.arrayDerived).size === this.arrayDerived.length;
  expect(stringUnique, "stringDerived has no duplicates").to.be.true;
  expect(arrayUnique, "arrayDerived has no duplicates").to.be.true;
});
