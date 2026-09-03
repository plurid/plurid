import {
    test,
    expect,
} from '@playwright/test';


/**
 * Frame-time budgets (p95 ms) per plane count for the scripted orbit + pan + zoom (`?bench=1`,
 * 240 frames, one camera delta per frame). Headless Chromium on a CI runner is far slower than a
 * desktop GPU, so the budgets are ceilings that catch regressions (a per-frame layout, a
 * per-plane re-render), not targets; the measured numbers are recorded in docs/ARCHITECTURE.md.
 */
const BUDGETS: { planes: number; p95: number }[] = [
    { planes: 40, p95: 40 },
    { planes: 100, p95: 50 },
    { planes: 500, p95: 100 },
];


test.describe('benchmark', () => {
    for (const budget of BUDGETS) {
        test(`${budget.planes} planes: orbit + pan + zoom stays under ${budget.p95} ms p95`, async ({ page }) => {
            test.slow();
            await page.goto(`/?planes=${budget.planes}&bench=1&momentum=0`);
            await page.waitForFunction(() => typeof (window as any).__rtCamera === 'function');
            await page.waitForFunction(() => !!(window as any).__rtBench, undefined, { timeout: 60000 });
            const result = await page.evaluate(() => (window as any).__rtBench);
            test.info().annotations.push({ type: 'bench', description: JSON.stringify(result) });
            console.log('[bench] ' + budget.planes + ' planes ' + JSON.stringify(result));
            expect(result.frames).toBe(239);
            // exactly one camera commit per frame: the dispatch count tracks the frame count
            expect(result.dispatches).toBeLessThanOrEqual(result.frames + 12);
            expect(result.p95FrameMs).toBeLessThanOrEqual(budget.p95);
        });
    }
});
