const { Then } = require("@badeball/cypress-cucumber-preprocessor");

const ISO_COUNTRY_CODE = /^[A-Z]{2}$/;
const PHONE_CODE = /^[\d\s,-]+$/;
const CURRENCY_CODE = /^[A-Z]{3}(,[A-Z]{3})*$/;
const US_STATE_CODE = /^[A-Z]{2}$/;
const MIN_US_STATES = 56
;

function getCountry(ctx) {
  return ctx.response.body.data.country;
}

function actualType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

Then("the country field {string} should be of type {string}", function (field, expectedType) {
  const value = getCountry(this)[field];
  expect(actualType(value), `country.${field}`).to.eq(expectedType);
});

Then("every state entry should have {string} of type {string}", function (field, expectedType) {
  const states = getCountry(this).states;
  expect(states, "country.states").to.be.an("array").and.not.empty;
  states.forEach((state, idx) => {
    expect(actualType(state[field]), `states[${idx}].${field}`).to.eq(expectedType);
  });
});

Then("the country non-null field {string} should have a value", function (field) {
  const value = getCountry(this)[field];
  expect(value, `country.${field}`).to.not.be.null;
  expect(value, `country.${field}`).to.not.be.undefined;
  if (typeof value === "string") {
    expect(value, `country.${field}`).to.not.equal("");
  } else if (Array.isArray(value)) {
    expect(value.length, `country.${field}.length`).to.be.greaterThan(0);
  }
});

Then("every state should have a non-empty {string}", function (field) {
  const states = getCountry(this).states;
  states.forEach((state, idx) => {
    expect(state[field], `states[${idx}].${field}`).to.be.a("string").and.not.empty;
  });
});

Then("the country {string} should be a valid ISO country code", function (field) {
  expect(getCountry(this)[field], `country.${field}`).to.match(ISO_COUNTRY_CODE);
});

Then("the country {string} should equal {string}", function (field, expected) {
  expect(getCountry(this)[field], `country.${field}`).to.eq(expected);
});

Then("the country {string} should be a valid phone code", function (field) {
  expect(getCountry(this)[field], `country.${field}`).to.match(PHONE_CODE);
});

Then("the country {string} should be a valid currency code", function (field) {
  expect(getCountry(this)[field], `country.${field}`).to.match(CURRENCY_CODE);
});

Then("the country should have the expected minimum number of US states", function () {
  const states = getCountry(this).states;
  expect(states, "country.states").to.be.an("array");
  expect(states.length, "country.states.length").to.be.at.least(MIN_US_STATES);
});

Then("every state {string} should be a valid US state code", function (field) {
  const states = getCountry(this).states;
  states.forEach((state, idx) => {
    expect(state[field], `states[${idx}].${field}`).to.match(US_STATE_CODE);
  });
});
