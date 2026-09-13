import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    waitForBoot,
    BenchResult,
} from './helpers';


/**
 * The scripted runs (`?bench=1&benchScenario=…`, 240 frames each): the orbit + pan + zoom at three
 * plane counts, the relayout and the spawn at two — one test per scenario and size, each
 * independent (a larger orbit measures its own 40-plane baseline first, so the scaling assertion
 * compares two runs of the same machine in the same state), so each fits its own budget and a
 * failure stops nothing else.
 *
 * What is ALWAYS asserted are the properties a regression breaks regardless of the machine:
 *   - every frame produced exactly one camera commit (a per-frame re-render or double dispatch
 *     shows up as extra store notifications),
 *   - no frame stalled: the 95th-percentile frame stays within a fixed floor or ten times the run's
 *     own median, whichever is larger (a per-frame layout or a per-plane render shows up as MANY
 *     frames far longer than the run's typical one; a slow shared runner raises the median with
 *     them). The p95 of 240 frames is the twelfth worst: our code cannot produce twelve outliers
 *     without producing a hundred. The single worst frame is NOT the stall gate (2026-09-13, after
 *     CI run #53) — it is usually a legitimate one: the first frame after boot mounts every plane
 *     (`firstFrameMs` reports it; it IS the max of a 500-plane orbit), a relayout toggle lays the
 *     whole tree out, and on a shared runner one frame is simply stolen by the other worker, a GC or
 *     the VM (1.2 s seen on CI against a 667 ms budget). It answers to a FREEZE ceiling instead,
 *   - the cost scales sub-linearly with the plane count relative to the 40-plane baseline
 *     measured in the same test (per-plane work on the camera path shows up as a linear blow-up).
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

/** The stall floor: the p95 frame may not exceed this on a fast machine (a stall, not a slow frame). */
const STALL_MS = 500;

/** On a slow machine the stall budget follows the run: this many times its median frame. */
const STALL_FACTOR = 10;

/**
 * A FREEZE is not a stall: the picture stopped. Generous enough for the run's legitimate worst frame
 * (the mount of 500 planes, a relayout of the whole tree, a frame stolen by a shared runner), tight
 * enough that a deadlock, an unbounded loop or a synchronous layout per frame still fails the run.
 */
const FREEZE_MS = 3000;
const FREEZE_FACTOR = 30;

/**
 * A relayout is a handful of writes whatever the plane count: the view size, the relayout, ONE batch
 * of the planes' sizes (the application's one measurer), the measured relayout and its transition
 * window — this many per toggle of the relayout scenario (12 toggles in 240 frames).
 */
const RELAYOUT_DISPATCHES_PER_TOGGLE = 8;

/** The p95 frame allowed for this run: the floor, or the run's own median times the factor. */
const stallBudget = (
    result: BenchResult,
    floor: number,
): number => Math.max(floor, result.p50FrameMs * STALL_FACTOR);

/**
 * The run did not stall: its p95 frame is within the budget (the property a regression breaks), and
 * not one frame froze. Both numbers are in the printed report whatever happens.
 */
const expectNoStall = (
    result: BenchResult,
) => {
    expect(result.p95FrameMs).toBeLessThanOrEqual(stallBudget(result, STALL_MS));
    expect(result.maxFrameMs ?? result.p95FrameMs)
        .toBeLessThanOrEqual(Math.max(FREEZE_MS, result.p50FrameMs * FREEZE_FACTOR));
};

/** Relative to the 40-plane p50 in the same run: the cost must scale sub-linearly. */
const SCALING: Record<number, number> = {
    100: 3,
    500: 8,
};

type Scenario = 'orbit' | 'relayout' | 'spawn';

const runBench = async (
    page: Page,
    planes: number,
    scenario: Scenario,
): Promise<BenchResult> => {
    await page.goto(`/?planes=${planes}&bench=1&benchScenario=${scenario}&momentum=0`);
    await waitForBoot(page, { planes: false });
    await page.waitForFunction(() => !!(window as any).__rtBench, undefined, { timeout: 90000 });
    return page.evaluate(() => (window as any).__rtBench as BenchResult);
};

const report = (
    scenario: Scenario,
    planes: number,
    result: BenchResult,
) => {
    test.info().annotations.push({ type: 'bench', description: (scenario === 'orbit' ? '' : scenario + ' ') + planes + ' planes ' + JSON.stringify(result) });
    console.log('[bench] ' + scenario + ' ' + planes + ' planes ' + JSON.stringify(result));
};


test.describe('benchmark', () => {
    const strict = !!process.env.BENCH_STRICT;

    for (const planes of SIZES) {
        test(`orbit + pan + zoom on ${planes} planes: one commit per frame, no stall, sub-linear scaling (absolute budgets with BENCH_STRICT=1)`, async ({ page }) => {
            test.slow();
            // the baseline of this very run, for the scaling assertion (the 40-plane test is its own baseline)
            const baseline = planes === 40 ? undefined : await runBench(page, 40, 'orbit');
            const result = await runBench(page, planes, 'orbit');
            report('orbit', planes, result);

            expect(result.frames).toBe(239);
            // exactly one camera commit per frame: the dispatch count tracks the frame count
            expect(result.dispatches).toBeLessThanOrEqual(result.frames + 12);
            expectNoStall(result);
            if (strict) {
                expect(result.p95FrameMs).toBeLessThanOrEqual(STRICT_BUDGETS[planes]);
            }
            if (baseline) {
                expect(result.p50FrameMs).toBeLessThanOrEqual(Math.max(4, baseline.p50FrameMs) * SCALING[planes]);
            }
        });
    }

    for (const scenario of ['relayout', 'spawn'] as const) {
        for (const planes of [40, 100]) {
            test(`${scenario} on ${planes} planes: one run per frame budget, printed per run (a table with \`pnpm bench\`)`, async ({ page }) => {
                test.slow();
                const result = await runBench(page, planes, scenario);
                report(scenario, planes, result);
                expect(result.frames).toBe(239);
                expectNoStall(result);
                if (scenario === 'relayout') {
                    // one batch of sizes per relayout, not one report per plane
                    expect(result.dispatches).toBeLessThanOrEqual(12 * RELAYOUT_DISPATCHES_PER_TOGGLE);
                }
            });
        }
    }
});
