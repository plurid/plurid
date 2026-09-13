import { defineConfig } from '@playwright/test';


/**
 * The engine's browser suite runs against the render-test harness (the CAD scene on port 5273).
 * `reuseExistingServer` lets a developer keep `pnpm dev` running; CI starts the server itself.
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
 * Where the harness is served. Overridable so the VISUAL project can run inside the pinned Playwright
 * container against a server already running on the host (`http://host.docker.internal:5273`): the
 * container brings the browser and the fonts, the host brings the build.
 */
const BASE_URL = process.env.PLURID_E2E_BASE_URL || 'http://localhost:5273';


export default defineConfig({
    testDir: '.',
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
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    webServer: {
        command: 'pnpm dev',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
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
