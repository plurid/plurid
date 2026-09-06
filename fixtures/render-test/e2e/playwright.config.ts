import { defineConfig } from '@playwright/test';


/**
 * The engine's browser suite runs against the render-test harness (the CAD scene on port 5273).
 * `reuseExistingServer` lets a developer keep `pnpm dev` running; CI starts the server itself.
 *
 * Two projects: `chromium` (every scenario but the visual baselines) and `visual` (`visual.spec.ts`:
 * every fixture of the catalog at its viewpoints, compared against the committed screenshots in
 * `e2e/__snapshots__/<platform>/`). The comparison is STRICT only with `VISUAL_STRICT=1` — the
 * baselines are taken on macOS, headless Chromium, DPR 1 — or when regenerating with
 * `--update-snapshots`; elsewhere the fixtures still open and render (a boot / console-error gate).
 * The spec decides (from `testInfo.config.updateSnapshots` and the env), never this file: a worker
 * process does not see the CLI's arguments.
 */

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
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: 'http://localhost:5273',
        viewport: {
            width: 1280,
            height: 800,
        },
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:5273',
        reuseExistingServer: !process.env.CI,
        cwd: '..',
        timeout: 60_000,
    },
    projects: [
        {
            name: 'chromium',
            testIgnore: /visual\.spec\.ts/,
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
