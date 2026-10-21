# Releasing Plurid

The release has separate preparation, verification and publishing phases. Running `pnpm release`
alone prints a read-only plan. Publishing belongs to the maintainer and always needs an explicit
`--publish` command. That command builds and verifies automatically when this commit has no verified
artifacts yet. The script manages output directories and never commits or pushes source.

## October 18 versions

All thirteen are published on npm's `latest` tag (checked 2026-10-19).

| Package (`@plurid/`) | Previous | Released |
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
and development servers, and Chromium hydration. Nothing rebuilds after tarball verification. The
browser gates start the harness from the release tree (`PLURID_E2E_OWN_SERVER=1`) and fail if a
server is already on its port, rather than test a development server from the checkout.

Per-gate logs are in `logs/`; coverage paths are recorded by the test runner. Tarballs and their
SHA-256/SHA-512 hashes are in `tarballs/` and `release.json`, bound to the source commit. A failed gate
leaves its source, store, logs and outputs intact but writes no verified release manifest. Fix the
source, commit it and run `--pack` again. Each run gets a new directory, under the operating system's
temporary directory, which the system may clear of old entries (macOS does after a few days): publish
soon after `--pack`, or give `--pack` (and then `--publish`) a durable directory of your own. A remembered
location that was cleared fails with "Recorded release artifacts are missing"; `--pack` again remembers
a new one, whose receipts start empty (a version already on the registry with other contents blocks the
round). This pipeline neither deletes
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
verified artifacts remembered for that commit, or builds and verifies them automatically if none
exist. Running `--pack` first is optional when you want to review the artifacts before publication.
`--verify-registry` uses the same remembered artifacts and never builds or authenticates. Each command
also accepts an explicit artifact directory.

The publisher also resumes verified artifacts from an ancestor when the only changed files are the
allowlisted publisher scripts, their tests, and this guide (`PUBLISHER_FILES` in
`scripts/release-plan.mjs`). Any change to build inputs, runtime source, manifests, lockfiles or other
tests requires fresh verification. Artifact hashes and versions are always checked against the
complete current package graph. The release tag still identifies the original tested source commit.
This lets a publisher fix resume a partial release without repacking versions already uploaded. The
build and its gates live in `scripts/release-pack.mjs`, which is not on that list: a change to how
artifacts are built or verified verifies them anew (2026-10-22: they lived in `release.mjs`, a publisher
file, so a gate fix resumed artifacts verified the old way).

All tarballs are uploaded consecutively in dependency order to `latest`, with `--ignore-scripts` so
`prepublishOnly` cannot rebuild them. There is **no availability wait between uploads**. On the first
npm browser approval, select **Remember me for 5 minutes** when offered. npm can then reuse that
approval for subsequent uploads from the same IP and token during that window. The script does not
change account or package security settings. See npm's
[authentication announcement](https://github.blog/changelog/2022-07-26-general-availability-of-improved-2fa-experience-in-npm/).
For unattended publishing, configure a package-scoped granular token with direct publish permission
and Bypass 2FA enabled through your existing pnpm authentication settings, or use trusted publishing
in CI. A plain login does not disable npm's publish authorization.

npm scans accepted uploads before making them installable. Scanning is typically around five minutes
and can take 15 minutes or more; see the
[npm scanning announcement](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/).
After all uploads, the publisher polls the whole release together, with one **20-minute** timeout.
`--wait <seconds>` changes this shared timeout; `--wait 0` checks once and exits nonzero if versions are
still pending. Every exact version must become visible with the recorded integrity and `latest` tag.
A newer registry release or different integrity blocks the round.

Per-package append-only upload receipts are retained under `publication/` beside `release.json`.
They are bound to the artifact manifest and record submission before invoking pnpm, acceptance after
pnpm succeeds, registry-observed versions, and final verification. A retry skips recorded submissions even while npm still returns
404, preventing duplicate uploads and repeated authorization during scanning. An interrupted
submission has an unknown outcome and is checked for availability rather than submitted again, and the
packages after it in dependency order wait for it to appear before they upload. If npm rejected the
upload (`EOTP`, `E401`, `E403`), nothing will appear: the timeout names its receipt; move that file
aside and run `--publish` again to submit it.

If an upload, authentication, or availability check fails, keep the checkout and tarballs and rerun
`--publish`. Existing matching versions are skipped; recorded uploads are only checked; new uploads
continue. A retry that only checks pending uploads does not authenticate. Use `--verify-registry` to
wait and confirm without any upload. If supplying an explicit directory, keep using that directory.
The script confirms the complete round before creating a local `release/YYYY-MM-DD` tag. A tag
collision with another commit requires a distinct maintainer-chosen tag; nothing is rewritten or
pushed automatically.

Finally, install the exact registry versions in a fresh consumer and store, verify its graph and
runtime, then push the tag. Viewer provides `pnpm plurid:update` to create real pins/lockfile after
publication, and `pnpm plurid:check` to reject source overlays and compare installed output bytes with
registry tarballs. A source-synced development install is insufficient for release qualification.
