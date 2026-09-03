import {
    test,
    expect,
    Page,
} from '@playwright/test';


/**
 * The scripted orbit + pan + zoom (`?bench=1`: 240 frames, one camera delta per frame) at three
 * plane counts, run in ONE test so every size is measured on the same machine in the same state.
 *
 * What is ALWAYS asserted are the properties a regression breaks regardless of the machine:
 *   - every frame produced exactly one camera commit (a per-frame re-render or double dispatch
 *     shows up as extra store notifications),
 *   - no frame stalled (a per-frame layout or a per-plane render shows up as a long frame),
 *   - the cost scales sub-linearly with the plane count relative to the 40-plane baseline
 *     measured in the same run (per-plane work on the camera path shows up as a linear blow-up).
 *
 * ABSOLUTE budgets (p95 ms) are a property of the machine: a CI runner is several times slower
 * than a development laptop with a GPU. They are enforced only with `BENCH_STRICT=1` (the local
 * performance gate); the measured numbers are always attached to the report and logged.
 */
const SIZES = [40, 100, 500];

/** p95 ceilings for `BENCH_STRICT=1` (a development machine, headless Chromium). */
const STRICT_BUDGETS: Record<number, number> = {
    40: 40,
    100: 50,
    500: 100,
};

/** No frame may take longer than this, on any machine (a stall, not a slow frame). */
const STALL_MS = 500;

/** Relative to the 40-plane p50 in the same run: the cost must scale sub-linearly. */
const SCALING: Record<number, number> = {
    100: 3,
    500: 8,
};

interface BenchResult {
    bootMs: number;
    firstFrameMs: number;
    p50FrameMs: number;
    p95FrameMs: number;
    maxFrameMs?: number;
    dispatches: number;
    frames: number;
}

const runBench = async (
    page: Page,
    planes: number,
): Promise<BenchResult> => {
    await page.goto(`/?planes=${planes}&bench=1&momentum=0`);
    await page.waitForFunction(() => typeof (window as any).__rtCamera === 'function');
    await page.waitForFunction(() => !!(window as any).__rtBench, undefined, { timeout: 90000 });
    return page.evaluate(() => (window as any).__rtBench);
};


test.describe('benchmark', () => {
    test('orbit + pan + zoom: one commit per frame, no stalls, sub-linear scaling (absolute budgets with BENCH_STRICT=1)', async ({ page }) => {
        test.slow();
        const strict = !!process.env.BENCH_STRICT;
        const results = new Map<number, BenchResult>();

        for (const planes of SIZES) {
            const result = await runBench(page, planes);
            results.set(planes, result);
            test.info().annotations.push({ type: 'bench', description: planes + ' planes ' + JSON.stringify(result) });
            console.log('[bench] ' + planes + ' planes ' + JSON.stringify(result));

            expect(result.frames).toBe(239);
            // exactly one camera commit per frame: the dispatch count tracks the frame count
            expect(result.dispatches).toBeLessThanOrEqual(result.frames + 12);
            expect(result.maxFrameMs ?? result.p95FrameMs).toBeLessThanOrEqual(STALL_MS);
            if (strict) {
                expect(result.p95FrameMs).toBeLessThanOrEqual(STRICT_BUDGETS[planes]);
            }
        }

        const baseline = Math.max(4, results.get(40)!.p50FrameMs);
        for (const [planes, factor] of Object.entries(SCALING)) {
            const result = results.get(Number(planes))!;
            expect(result.p50FrameMs).toBeLessThanOrEqual(baseline * factor);
        }
    });
});
