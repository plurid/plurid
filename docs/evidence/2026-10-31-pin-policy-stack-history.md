# Pin policy and stack history verification — 2026-10-31

Scope: per-instance pin eligibility and coherent stack geometry, membership, undo, and persistence.
This is run-specific evidence; the behavior contract is in [CONTROL_SURFACE](../CONTROL_SURFACE.md).
No release or publication was performed.

## Bundle decision

The previous React budgets had 463 bytes and 325 bytes of margin. Compiling the committed source
before this change into a fresh temporary output, using the same tsup configuration and the size
script's static-import closure/minify/gzip calculation, produced these measurements:

| Entry | Before | After | Added | New ceiling | Remaining margin |
| --- | ---: | ---: | ---: | ---: | ---: |
| `@plurid/plurid-react` | 122,417 B | 123,507 B | 1,090 B | 125 KiB | 4,493 B |
| `@plurid/plurid-react/testing` | 112,315 B | 113,413 B | 1,098 B | 115 KiB | 4,347 B |

The approximately 1.1 KiB increase buys one shared pin policy check, validation of restored pin state,
and stack membership/return placements in atomic arrangement history. The ceilings increase by one
5 KiB step each; other ceilings remain unchanged. These bounds continue to fail additional growth
beyond roughly 4.3 KiB. No package versions or release gates were changed.

## Executed checks

- React Jest suite: 143 suites, 800 tests passed.
- Type checks: data, engine, React, browser harness, and examples passed.
- ESLint on changed packages, fixture, and browser scenarios passed.
- Preserving builds: data, engine, React; existing outputs retained.
- Module gate: all 13 packages load as ESM and CommonJS; React markup/styles match in both formats.
- Browser pin/stack scenarios: 6 passed, including policy refusal, same-node input preservation,
  undo/redo, reload persistence, and unstack to the original placements.
- Adjacent history/selection browser scenarios: 11 passed.
- Generated reference-table check passed.

The standalone browser harness rendered without console errors. It emits an existing warning when
persistence callbacks are provided while persistence is disabled. Jest emits an existing ts-jest
warning about a JavaScript dependency with `allowJs` disabled. The declaration build reports
existing-style `AppState` re-export cycles; the import and render-parity gates passed.

Full workspace verification, performance/visual baselines, packed-consumer smoke, and registry
publication are outside this focused change's verification. The consuming Viewer's native integration
requires its own check. Artifacts were retained; no cleanup or file removal was performed.
