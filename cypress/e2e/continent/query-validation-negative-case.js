const { When, Then } = require("@badeball/cypress-cucumber-preprocessor");

const VALID_CONTINENT_CODES = ["AF", "AN", "AS", "EU", "NA", "OC", "SA"];

const CONTINENT_QUERY = `
  query GetContinent($code: ID!) {
    continent(code: $code) {
      code
      name
    }
  }
`;

function sendContinentQuery(endpoint, code) {
  return cy.request({
    method: "POST",
    url: endpoint,
    failOnStatusCode: false,
    body: {
      query: CONTINENT_QUERY,
      variables: { code },
    },
  });
}

When('I send the "continent" query with a null code', function () {
  sendContinentQuery(this.endpoint, null).then((res) => {
    this.response = res;
    cy.log("status: " + res.status);
    cy.log("body: " + JSON.stringify(res.body));
  });
});

When('I send the "continent" query with code {string}', function (code) {
  sendContinentQuery(this.endpoint, code).then((res) => {
    this.response = res;
  });
});

Then("the response should contain an error message containing {string}", function (expected) {
  expect(this.response.body.errors, "errors").to.be.an("array").and.not.be.empty;
  const messages = this.response.body.errors.map((e) => e.message).join(" | ");
  expect(messages).to.include(expected);
});

Then("the continent in the response should be null", function () {
  expect(this.response.body.data.continent).to.be.null;
});

Then("the response error code should be {string}", function (expected) {
  const code = this.response.body.errors?.[0]?.extensions?.stellate?.code;
  expect(code, "stellate error code").to.eq(expected);
});

Then("the continents response should contain only valid continents from {string}", function (codesCsv) {
  const inputCodes = codesCsv
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const expectedValid = inputCodes.filter((c) => VALID_CONTINENT_CODES.includes(c));
  const expectedInvalid = inputCodes.filter((c) => !VALID_CONTINENT_CODES.includes(c));
  cy.log(`valid input codes: ${expectedValid.join(",") || "(none)"}`);
  cy.log(`invalid input codes (filtered out): ${expectedInvalid.join(",") || "(none)"}`);

  const continents = this.response.body.data.continents;
  expect(continents, "continents").to.be.an("array");
  const actualCodes = continents.map((c) => c.code);
  expect(actualCodes, "returned continent codes").to.have.members(expectedValid);
  expect(actualCodes.length, "returned continents count").to.eq(expectedValid.length);
});
