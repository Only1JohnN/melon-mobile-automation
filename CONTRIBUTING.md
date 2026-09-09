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
