import { defineConfig } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';


/**
 * The engine's browser suite runs against the render-test harness (the CAD scene on port 5273).
 * `reuseExistingServer` lets a developer keep `pnpm dev` running; CI and a release
 * (`PLURID_E2E_OWN_SERVER=1`) start the server themselves, so a release never tests a server from
 * the checkout that happened to be on the port, and fails if one is.
 *
 * THREE PROJECTS, run as three commands so none of them can spoil another:
 *  - `chromium` — every behavioural scenario;
 *  - `perf` — the benchmark and the virtualization budgets, which MEASURE THE MACHINE and so must not
 *    share it with 160 other tests (2026-09-13: a 240-frame benchmark run beside the rest of the
 *    suite reported a 1.2 s frame on CI and failed a gate about the engine);
 *  - `visual` — every fixture of the catalog at its viewpoints, compared against the committed
 *    screenshots in `e2e/__snapshots__/<platform>/`. The comparison ALWAYS runs (2026-09-13: it used
 *    to be skipped unless `VISUAL_STRICT` was set, which nothing set, so 42 pictures were compared by
 *    nothing); a platform with no baselines fails and says how to make them.
 *
 * NO RETRIES, anywhere. A test that passes on the second attempt is a test nobody can trust, and the
 * suite is deterministic enough to say so: every wait is on state, never on a duration
 * (`e2e/helpers.ts`, enforced by lint).
 */

/**
 * Where the harness is served (`PLURID_E2E_BASE_URL` overrides it). The VISUAL project must reach it at
 * http://localhost:5273: the origin is in every picture, and visual.spec.ts refuses any other. Inside the
 * pinned container, serve it there or forward localhost:5273 to the host (CONTRIBUTING, the visual
 * baseline ritual), never through host.docker.internal.
 */
const BASE_URL = process.env.PLURID_E2E_BASE_URL || 'http://localhost:5273';
const preserve = process.env.PLURID_PRESERVE_ARTIFACTS === '1';


export default defineConfig({
    testDir: '.',
    // Retain successful traces/videos too, and never reuse an earlier run's output directory.
    ...(preserve ? { outputDir: join(tmpdir(), 'plurid-e2e-' + randomUUID()), preserveOutput: 'always' as const } : {}),
    testMatch: /.*\.spec\.ts/,
    timeout: 30_000,
    snapshotPathTemplate: '{testDir}/__snapshots__/{platform}/{arg}{ext}',
    expect: {
        timeout: 5_000,
        toHaveScreenshot: {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
            // an absolute budget: a 0.2 % RATIO (~2 000 px at 1280×800) let a 22×20 control vanish unnoticed
            maxDiffPixels: 120,
            threshold: 0.2,
        },
    },
    fullyParallel: false,
    // a flake is a failure: nothing is retried, here or on CI
    retries: 0,
    // a stray `test.only` would quietly shrink the CI run to one green test
    forbidOnly: !!process.env.CI,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: BASE_URL,
        viewport: {
            width: 1280,
            height: 800,
        },
        trace: preserve ? 'on' : 'retain-on-failure',
        screenshot: preserve ? 'on' : 'only-on-failure',
        video: preserve ? 'on' : 'retain-on-failure',
    },
    webServer: {
        command: 'pnpm dev',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI && process.env.PLURID_E2E_OWN_SERVER !== '1',
        cwd: '..',
        timeout: 60_000,
    },
    projects: [
        {
            name: 'chromium',
            testIgnore: /(visual|bench|virtualization)\.spec\.ts/,
            use: {
                browserName: 'chromium',
            },
        },
        {
            // the measured suites: run alone (`--project=perf`), never beside the behavioural one
            name: 'perf',
            testMatch: /(bench|virtualization)\.spec\.ts/,
            use: {
                browserName: 'chromium',
            },
        },
        {
            name: 'visual',
            testMatch: /visual\.spec\.ts/,
            use: {
                browserName: 'chromium',
                deviceScaleFactor: 1,
                viewport: {
                    width: 1280,
                    height: 800,
                },
                colorScheme: 'dark' as const,
                // a context option (the typed home of `reducedMotion`); the fixtures also pass `reducedMotion=1`
                contextOptions: { reducedMotion: 'reduce' as const },
            },
        },
    ],
});
