# Contributing

## Branch strategy

Trunk-based, no long-lived `develop` branch:

- `main` is always green — every commit on it should pass `npm test` against the emulator.
- Work happens on short-lived branches cut from `main`, named `<type>/<short-description>`:
  - `feature/` — new specs or page objects (e.g. `feature/wallet-topup-spec`)
  - `fix/` — fixing a broken or flaky test
  - `chore/` — config, deps, CI, tooling
- Open a PR into `main` using the PR template. Squash-merge, then delete the branch.
- No direct pushes to `main` once collaborators are added — merge via PR even for solo work, so there's a review trail.

## Commits

Keep messages imperative and scoped to one logical change (e.g. `Add login page object`, not `updates`).

## Tagging tests

Mocha (this project's framework) has no built-in tag system, so tags are plain
words in the `it(...)` title, filtered at run time with Mocha's `--grep`:

- `@smoke` — small, critical-path set (e.g. login). Must always pass; run on every change.
- `@regression` — full suite, including `@smoke`. Run before a release.

Give every test at least one tag; give smoke-worthy tests both:

```ts
it('@smoke @regression logs in with a valid phone number and PIN', async () => { ... });
```

Run by tag:

```bash
npm run test:smoke
npm run test:regression
```

## CI and reports

Every push to `main` and every PR runs the suite in GitHub Actions
(`.github/workflows/test.yml`), on a hosted emulator — no local Mac resource
issues to fight, unlike running it on a laptop. Each run produces an Allure
report: pass/fail per test, the step-by-step timeline, the screen recording,
and (on failure) a screenshot and the error. On `main`, that report is
published to GitHub Pages at:

```
https://only1johnn.github.io/melon-mobile-automation/
```

A summary and that link are also posted to the team's Zoho Cliq channel after
every run.

To view a report locally instead:

```bash
npm test                # writes results to ./allure-results
npm run report:generate # builds the HTML report into ./allure-report
npm run report:open     # opens it in your browser
```

**One-time setup for whoever owns the repo:**
- Add repo secrets `MELON_APK_URL` (a URL the workflow can download the
  staging APK from) and `CLIQ_WEBHOOK_URL` (the Cliq channel's incoming
  webhook — Cliq: channel → Settings → Webhooks → Incoming Webhook).
- Enable Pages once: **Settings → Pages → Source: GitHub Actions**.
