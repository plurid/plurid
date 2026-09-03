import { defineConfig } from '@playwright/test';


/**
 * The engine's browser suite runs against the render-test harness (the CAD scene on port 5273).
 * `reuseExistingServer` lets a developer keep `pnpm dev` running; CI starts the server itself.
 */
export default defineConfig({
    testDir: '.',
    testMatch: /.*\.spec\.ts/,
    timeout: 30_000,
    expect: {
        timeout: 5_000,
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
            use: {
                browserName: 'chromium',
            },
        },
    ],
});
