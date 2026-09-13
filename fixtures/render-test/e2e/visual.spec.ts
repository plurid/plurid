import {
    test,
    expect,
    Page,
} from '@playwright/test';
import { fileURLToPath } from 'node:url';

import {
    openFixture,
    settle,
    afterFrames,
    collectConsoleErrors,
} from './helpers';
import { FIXTURES } from '../src/fixtures/catalog';


const VISUAL_CSS = fileURLToPath(new URL('./visual.css', import.meta.url));

/** Fonts loaded, the space idle, two painted frames: a stable picture, with nothing left to wait for. */
const stabilize = async (page: Page) => {
    await page.evaluate(() => (document as any).fonts?.ready);
    await settle(page);
    await afterFrames(page, 2);
};

/**
 * THE VISUAL BASELINES: every fixture of the catalog at each of its viewpoints, compared against the
 * committed screenshots (`e2e/__snapshots__/<platform>/`).
 *
 * THE COMPARISON ALWAYS RUNS (2026-09-13). It used to be skipped unless `VISUAL_STRICT` was set —
 * and nothing in the repository ever set it, while CI ran only the `chromium` project, so these 42
 * tests passed every run having asserted NOTHING. A gate that does not run is not a gate.
 *
 * A picture is a property of the platform (fonts, rasterisation, sub-pixel geometry), so the
 * baselines are per platform. `darwin` is generated here; `linux` is generated — and compared on CI —
 * inside the PINNED Playwright container, so the same bytes are expected in both places:
 *
 *     docker run --rm -v "$PWD/../..":/work -w /work/fixtures/render-test \
 *         mcr.microsoft.com/playwright:v1.62.1-noble \
 *         npx playwright test --config e2e/playwright.config.ts --project=visual --update-snapshots
 *
 * On a platform with no baselines the run FAILS and says that (Playwright writes the missing file and
 * reports it), rather than passing quietly.
 */
test.describe('visual', () => {
    for (const fixture of FIXTURES) {
        for (const viewpoint of fixture.viewpoints) {
            test(`${fixture.name} @ ${viewpoint.name}`, async ({ page }) => {
                // a picture that renders with a console error is not a passing picture
                const errors = collectConsoleErrors(page);
                await openFixture(page, fixture.name, { viewpoint: viewpoint.name });
                await stabilize(page);
                await expect(page).toHaveScreenshot(`${fixture.name}--${viewpoint.name}.png`, {
                    stylePath: VISUAL_CSS,
                });
                expect(errors, 'console errors while rendering ' + fixture.name).toEqual([]);
            });
        }
    }
});
