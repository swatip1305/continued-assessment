const { When, Then } = require("@badeball/cypress-cucumber-preprocessor");

const CONTINENTS_FILTER_QUERY = `
  query GetContinents($filter: ContinentFilterInput) {
    continents(filter: $filter) {
      code
      name
    }
  }
`;

function parseCodes(csv) {
  return csv
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

function getContinents(ctx) {
  return ctx.response.body.data.continents;
}

When('I send the "continents" query filtering codes in {string}', function (codesCsv) {
  const codes = parseCodes(codesCsv);
  this.requestedCodes = codes;
  cy.request({
    method: "POST",
    url: this.endpoint,
    failOnStatusCode: false,
    body: {
      query: CONTINENTS_FILTER_QUERY,
      variables: { filter: { code: { in: codes } } },
    },
  }).then((res) => {
    this.response = res;
  });
});

Then("the continents response should contain exactly the codes {string}", function (codesCsv) {
  const expected = parseCodes(codesCsv);
  const continents = getContinents(this);
  expect(continents, "continents").to.be.an("array");
  const actual = continents.map((c) => c.code);
  expect(actual, "returned continent codes").to.have.members(expected);
  expect(actual.length, "returned continents count").to.eq(expected.length);
});

Then("the continents response should be empty", function () {
  const continents = getContinents(this);
  expect(continents, "continents").to.be.an("array").that.is.empty;
});

Then('every continent in the response should have a non-empty {string}', function (field) {
  const continents = getContinents(this);
  expect(continents, "continents").to.be.an("array").and.not.empty;
  continents.forEach((continent, idx) => {
    expect(continent[field], `continents[${idx}].${field}`).to.be.a("string").and.not.empty;
  });
});
