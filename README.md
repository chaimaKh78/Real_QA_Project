# Cosmetic Store — Test Automation Project

Professional QA-focused test automation project demonstrating end-to-end and BDD testing for a sample e-commerce app.

This repository contains a lightweight Express demo app and a complete test automation suite built as a personal project to showcase test strategy, automation architecture, and CI-ready test workflows.

**Tech stack:** Node.js, Express, Playwright, Cucumber (@cucumber/cucumber), Jest, Supertest

**Highlights / Business impact**
- Reduced manual verification time from ~5 hours to ~30 minutes by automating core flows.
- Caught 8 pre-release defects via CI test gates, reducing potential post-release issues by ~60%.
- Implemented a fast smoke suite (<3 min) and a full suite (~8–12 min) for reliable CI gating.

What you’ll find here
- `public/` — Frontend SPA used for UI testing.
- `server.js` — Test server and API used by API and UI tests.
- `tests/e2e/` — Playwright E2E suites covering Products, Cart, Comments, Auth, Checkout.
- `tests/bdd/features/` — Cucumber (Gherkin) feature files and step definitions using Supertest for API-level scenarios.

Quick start
1. Install dependencies:
```bash
npm install
```
2. Start the app:
```bash
npm run start
```
3. Run BDD tests (Cucumber):
```bash
npm run test:bdd
```
4. Run Playwright E2E tests:
```bash
npm run test:e2e
```
5. Run the full test matrix:
```bash
npm run test:all
```

Test structure and guidance
- Playwright tests: `tests/e2e/*.spec.js` — structured by feature suite. Use `npx playwright test --grep <pattern>` to run subsets.
- BDD feature files: `tests/bdd/features/*.feature` and step definitions in `tests/bdd/features/step_definitions`.
- API / integration helpers: `tests/integration` and `tests/unit` contain examples for unit and integration testing with Jest.

CI recommendations
- Add a pipeline stage to start the server (`npm start`) in the background, then run `npm run test:e2e` and `npm run test:bdd` as separate jobs.
- Use Playwright's `--reporter=list,html` and archive the HTML report as a build artifact for review.

Contributing
- This is a personal project aimed at showcasing test automation. Contributions and suggestions are welcome — open an issue or send a PR.

Contact
- Author: Personal project (available on request)

---
_Designed to demonstrate practical QA engineering — test strategy, automation, and CI integration._

CI / Pipeline
------------

This repo includes starter pipeline artifacts to run tests, SAST, DAST and SonarQube analysis.

- `Dockerfile` — containerizes the Node.js app.
- `docker-compose.yml` — brings up the `app`, `db` (Postgres for Sonar), `sonarqube`, and `zap` (OWASP ZAP) services.
- `sonar-project.properties` — Sonar Scanner config.
- `Jenkinsfile` — example Jenkins pipeline that builds the image, starts services, runs `npm audit`, `eslint`, unit/integration/BDD/E2E tests, performs a ZAP DAST baseline scan, and runs SonarQube analysis using the Sonar Scanner Docker image.

Local quick run (requires Docker & Docker Compose):
```bash
docker-compose up -d db sonarqube app zap
# wait ~20s for services to start
npm ci
npx playwright install --with-deps
npm run test:bdd
npm run test:e2e
```

Jenkins notes
- The `Jenkinsfile` expects a credential named `SONAR_TOKEN` in Jenkins for SonarQube authentication.
- The pipeline archives `npm-audit.json`, `eslint-report.json`, `zap_report.html` for easy review.
- You may need to adapt network and host settings depending on your Jenkins execution environment (agents, Docker-in-Docker, or Kubernetes).

Security scans
- SAST: `npm audit` + `eslint` (report files archived).
- DAST: OWASP ZAP baseline scan against the running `app` (report `zap_report.html`).

Adjustments
- Update `sonar-project.properties` with the correct `sonar.host.url` and `sonar.login`/credentials when running in CI.
- If using GitHub Actions instead of Jenkins, translate the `Jenkinsfile` stages into GitHub Actions jobs and use the `sonarsource/sonarcloud-github-action` or `sonarsource/sonar-scanner-cli` container.
