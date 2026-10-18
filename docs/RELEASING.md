# Releasing Plurid

The release has separate preparation, verification and publishing phases. Running `pnpm release`
alone prints a read-only plan. Publishing belongs to the maintainer and always needs an explicit
`--publish` command. That command builds and verifies automatically when this commit has no verified
artifacts yet. The script manages output directories and never commits or pushes source.

## Prepared October 18 versions

These versions are prepared locally; this table does not establish that they have been published.

| Package (`@plurid/`) | Previous | Prepared |
| --- | --- | --- |
| plurid-themes | 0.0.0-4 | 0.0.0-5 |
| plurid-functions | 0.0.0-32 | 0.0.0-33 |
| plurid-functions-react | 0.0.0-7 | 0.0.0-8 |
| plurid-data | 0.0.0-26 | 0.0.0-27 |
| plurid-pubsub | 0.0.0-12 | 0.0.0-13 |
| plurid-engine | 0.0.0-23 | 0.0.0-24 |
| plurid-icons-react | 0.0.0-12 | 0.0.0-13 |
| plurid-ui-state-react | 0.0.0-15 | 0.0.0-16 |
| plurid-ui-components-react | 0.0.0-36 | 0.0.0-37 |
| plurid-react | 0.0.0-40 | 0.0.0-41 |
| plurid-react-server | 0.0.0-19 | 0.0.0-20 |
| plurid-kit | 0.0.0-6 | 0.0.0-7 |
| generate-plurid-app | 0.0.0-16 | 0.0.0-17 |

All thirteen ship manifest changes, including separate ESM/CommonJS declaration conditions and
Node 22 requirements. The generator builds `distribution/versions.json` from the prepared kit,
React and server manifests. See [migration](./MIGRATION.md) for the opt-in wheel policy and the
other changes since September 29.

## Prepare and commit

```sh
pnpm release --dry-run --all
pnpm release --prepare --all
```

The dry run reads the workspace, git diff and public registry metadata. It does not require login,
fetch refs, create temporary files, invoke lifecycle hooks or pack packages. It includes uncommitted
source, manifests, templates, binders and build configuration; tests and retained outputs are excluded.
Runtime and peer dependents follow released siblings. The generator follows its three baked pins.

`--prepare` writes versions, advances sibling peer minimums, and resolves the lockfile without
installing or building packages. `workspace:` links normally make the version-only lockfile change
empty. Preparation is idempotent while the next alpha is unpublished. `--no-bump` plans/prepares the
versions already written; it does not authorize overwriting an existing registry version.

Review and commit the complete preparation, push it and wait for **gates, browser, perf and visual**
CI jobs. This commit must contain the versions being published. There is no post-publication bump or
automatic `git add -A` step. Missing, pending or failed CI blocks publication.

## Verify and pack

```sh
pnpm release --pack
```

The source tree must be clean. The script chooses a new temporary workspace outside the checkout,
archives the current commit, installs its frozen lockfile into a new package store, and builds
dependencies first with cleanup disabled. Artifact locations are remembered under ignored
`.out/releases/`; the actual source stays outside the checkout so Node cannot fall back to its
development `node_modules`. Existing checkout outputs are never packed. Development tools and
browser binaries must be available; install the harness's pinned Chromium before starting if needed.

The gates are build, release-tooling tests, workspace types, package tests with coverage floors,
lint, ESM/CommonJS imports and rendering parity, size budgets, generated tables, browser behavior,
performance, visual baselines, and packed consumers. The latter checks the **same tarballs** that will
be published, including NodeNext declaration resolution, TypeScript 5/6 generated apps, production
and development servers, and Chromium hydration. Nothing rebuilds after tarball verification.

Per-gate logs are in `logs/`; coverage paths are recorded by the test runner. Tarballs and their
SHA-256/SHA-512 hashes are in `tarballs/` and `release.json`, bound to the source commit. A failed gate
leaves its source, store, logs and outputs intact but writes no verified release manifest. Fix the
source, commit it and run `--pack` again. Each run gets a new directory. This pipeline neither deletes
nor trashes artifacts. Successful verification is remembered by the exact source commit, so no shell
variable or copied path is required. `--pack /custom/new-directory` remains available when needed.

For local work, `pnpm build:preserving`, `pnpm test:preserving` and
`PLURID_PRESERVE_ARTIFACTS=1 pnpm smoke.pack --keep` retain artifacts. Preservation suppresses test
fixture cleanup and build cleanup; a stopped kit dev process leaves an empty, unclaimed pidfile.
Ordinary builds/tests keep their existing cleanup behavior. Do not run them under a no-removal policy.

## Publish the verified tarballs

Authenticate using `pnpm login` in your own terminal. No release phase needs credentials before this
boundary, and credentials are never recorded in release artifacts.

```sh
pnpm release --publish
pnpm release --verify-registry
```

Publishing requires a clean checkout and green CI for it before building or uploading. It reuses
verified artifacts remembered for that exact commit, or builds and verifies them automatically if none
exist. Running `--pack` first is optional when you want to review the artifacts before publication.
`--verify-registry` uses the same remembered artifacts and never builds. Each command also accepts an
explicit artifact directory. Publication validates the complete graph and every artifact digest before uploading. It publishes in dependency order to
`latest`, with `--ignore-scripts` so `prepublishOnly` cannot rebuild the tested artifact. Every exact
version must appear with the recorded registry integrity and `latest` tag. A newer registry release
prevents accidentally moving `latest` backward.

If upload or authentication fails halfway, keep the source and tarballs and rerun `--publish` against
the **same commit**. It resumes the remembered tarballs without rebuilding. If supplying an explicit
directory, keep using that directory. Matching published artifacts are skipped; an existing version
with different integrity blocks the round. The script confirms the complete round before creating a local
`release/YYYY-MM-DD` tag. A tag collision with another commit requires a distinct maintainer-chosen
tag; nothing is rewritten or pushed automatically.

Finally, install the exact registry versions in a fresh consumer and store, verify its graph and
runtime, then push the tag. Viewer provides `pnpm plurid:update` to create real pins/lockfile after
publication, and `pnpm plurid:check` to reject source overlays and compare installed output bytes with
registry tarballs. A source-synced development install is insufficient for release qualification.
