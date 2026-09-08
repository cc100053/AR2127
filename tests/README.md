# Local workflow checks

No application build or new runtime dependency is needed. Serve the repository with `python3 -m http.server 8128 --bind 127.0.0.1` and open:

- `studies.html?lab=1&test=1`: 12 segmentation / mask geometry checks.
- `studies.html?object=bottle&test=1`: 10 checks.
- `studies.html?object=bottle-b&test=1`: 12 checks.
- `studies.html?object=suica&test=1`: 7 checks.
- `phone.html?test=1`: 9 checks.
- `index.html?test=1`: 67 legacy checks.

## Browser workflow regression

`browser.cjs` uses plain Node assertions and an existing Playwright installation with Chrome. It starts its own temporary loopback server, exercises the real UI, saves screenshots/PNG exports and `previews/input-tests/workflow-results.json`, and exits nonzero on failure.

```sh
node tests/browser.cjs
```

If Playwright is supplied outside this repository, set `PLAYWRIGHT_MODULE` to that installed package directory. In this Codex workspace:

```sh
PLAYWRIGHT_MODULE=/Users/fatboy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node tests/browser.cjs
```

Coverage includes opt-in enclosed-region cleanup, reversible reset, PNG download/alpha round-trip, invalid inputs, rapid sample switching, unsupported-mask recovery, both prepared-mask bottle recipes, calibrated phone/card uploads, local card corner proposals, curved-outline rejection, baseline restoration and 390px layout. Calibration uses translated/padded fixture photos, not new physical objects. Quantitative geometry checks do not establish arbitrary-photo recognition, artistic quality or exhibition reliability.
