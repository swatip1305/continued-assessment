# API Automation — Cypress + Cucumber + GraphQL

End-to-end API test suite for the [trevorblades countries GraphQL API](https://countries.trevorblades.com/), written in Gherkin and executed with Cypress.

**Author:** Swati Patel
**Stack:** Cypress 15 · `@badeball/cypress-cucumber-preprocessor` · `@bahmutov/cypress-esbuild-preprocessor` · esbuild

---

## Prerequisites

- **Node.js** 18+ and **npm**
- Network access to `https://countries.trevorblades.com/`

Verify:
```bash
node -v
npm -v
```

---

## Install

From the project root:

```bash
npm install
```

This installs Cypress and the cucumber preprocessor plugins listed in `package.json`.

---

## Run the tests

### Headless (CI / one-shot run)
```bash
npm test
```
or equivalently:
```bash
npm run cypress:run
```

### Interactive runner (open Cypress GUI)
```bash
npm run cypress:open
```
Then pick **E2E Testing**, choose a browser, and click any `.feature` file to run it.

### Run a single feature file
```bash
npx cypress run --spec "cypress/e2e/Country/country-data-set-validation.feature"
```

### Run all features in one folder
```bash
npx cypress run --spec "cypress/e2e/Country/**/*.feature"
npx cypress run --spec "cypress/e2e/continent/**/*.feature"
```

### Run only scenarios with a specific tag
Cucumber tags can be added to any scenario (e.g., `@smoke`, `@negative`). To run only tagged scenarios:
```bash
npx cypress run --env tags="@smoke"
```

---

## Test suite layout

```
cypress/
├── e2e/
│   ├── countries/                            # original happy-path test
│   │   └── happy-path-scenario-query-validation.{feature,js}
│   ├── continent/                            # continent-related queries
│   │   ├── single-query-validation.{feature,js}
│   │   ├── string-query-operation.{feature,js}
│   │   └── query-validation-negative-case.{feature,js}
│   └── Country/                              # country-related queries
│       ├── country-data-set-validation.{feature,js}
│       ├── country-data-consistency.{feature,js}
│       └── country-schema-introspection.{feature,js}
└── support/
    └── step_definitions/
        └── common.js                         # shared steps (endpoint, status, errors, country query)
```

Each `.feature` file pairs with a `.js` step file in the same folder. Shared steps live in `cypress/support/step_definitions/common.js`.

---

## What each test covers

| Feature file | What it validates |
|---|---|
| `countries/happy-path-scenario-query-validation.feature` | Happy-path country query for US — name, capital, currency (handles multi-currency CSVs), languages count |
| `Country/country-data-set-validation.feature` | Field types, non-null fields, value ranges (ISO codes, phone, currency, US states ≥ 50) |
| `Country/country-data-consistency.feature` | `country.currency` (CSV) and `country.currencies` (array) are present, set-consistent in both directions, equal in length, free of duplicates |
| `Country/country-schema-introspection.feature` | GraphQL schema contract — `country` query exists with `code: ID!`; `Country` is an `OBJECT` type |
| `continent/single-query-validation.feature` | Country/continent fixture-driven happy path |
| `continent/string-query-operation.feature` | `continents(filter: { code: { in: [...] } })` filtering — exact match for any list size (1, 2, 3, 7 codes) plus empty-result cases |
| `continent/query-validation-negative-case.feature` | Null code → 400 + "must not be null"; `"ZZ"` → 200 + null data; mixed valid/invalid codes return only valid continents |

---

## Reports

After a headless run, a Cucumber JSON report is written to:
```
cypress/reports/cucumber-report.json
```

Configure further outputs via the `cypress-cucumber-preprocessor.json` block in `package.json` (the [preprocessor docs](https://github.com/badeball/cypress-cucumber-preprocessor) cover HTML reports, JUnit, multi-format).

Failing-run artifacts:
- Screenshots → `cypress/screenshots/`
- (Videos disabled by default — enable in `cypress.config.js` if needed.)

---

## Adding a new test

1. **Create the feature file** in the appropriate folder, e.g. `cypress/e2e/Country/my-new-feature.feature`.
2. **Create a matching step file** alongside it (`my-new-feature.js`). Reuse steps from `common.js` and other step files where possible — the preprocessor scans every `.js` under `cypress/e2e/**` and `cypress/support/step_definitions/**`.
3. Place any reusable regex / domain constants / GraphQL queries at the top of the step file (keep `.feature` files semantic — no regex strings inside Gherkin).
4. Run only your new feature first:
   ```bash
   npx cypress run --spec "cypress/e2e/Country/my-new-feature.feature"
   ```

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `Step implementation missing for "..."` | The cucumber preprocessor couldn't find the step. Confirm the step file is under one of the globs in `package.json → cypress-cucumber-preprocessor.stepDefinitions`. The default globs cover `cypress/e2e/**/*.{js,ts}` and `cypress/support/step_definitions/**/*.{js,ts}`. |
| `A fixture file could not be found at...` | Restore the fixture under `cypress/fixtures/`. Cypress resolves fixture paths relative to that root. |
| 400 "did not contain a valid GraphQL request" | The request body was malformed (e.g., null variable on a non-null arg). For tests asserting this, set `failOnStatusCode: false` in `cy.request`. |
| Shape of `errors[*].extensions` looks unexpected | Trevorblades is fronted by Stellate CDN. Stellate wraps responses with `extensions.stellate.code` only when *its* parser rejects the request; for valid requests that fail server-side validation, the response comes from Apollo origin without `stellate`. Assert against `errors[*].message`, not the Stellate code. |
| Test hangs in `cypress open` | Make sure no other Cypress instance is open. Close and re-run. |

---

## Project documents

- **`cypress.config.js`** — Cypress + cucumber preprocessor wiring.
- **`package.json`** — scripts and cucumber configuration.

---

## License

ISC
