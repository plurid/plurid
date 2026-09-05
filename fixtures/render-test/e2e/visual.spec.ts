import {
    test,
    expect,
} from '@playwright/test';
import { fileURLToPath } from 'node:url';

import {
    openFixture,
    settle,
} from './helpers';
import { FIXTURES } from '../src/fixtures/catalog';


const VISUAL_CSS = fileURLToPath(new URL('./visual.css', import.meta.url));

/** Fonts loaded, the space idle, two painted frames, then a short pause: a stable picture. */
const stabilize = async (page: Parameters<typeof settle>[0]) => {
    await page.evaluate(() => (document as any).fonts?.ready);
    await settle(page);
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await page.waitForTimeout(100);
};

/**
 * THE VISUAL BASELINES: every fixture of the catalog at each of its viewpoints, compared against
 * the committed screenshots (e2e/__snapshots__/<platform>/). The comparison is strict only with
 * `VISUAL_STRICT=1` (the baselines are taken on macOS, headless Chromium, DPR 1); elsewhere the
 * fixtures still open and render. Regenerate: `pnpm --filter plurid-render-test e2e -- --project visual --update-snapshots`.
 */
test.describe('visual', () => {
    for (const fixture of FIXTURES) {
        for (const viewpoint of fixture.viewpoints) {
            test(`${fixture.name} @ ${viewpoint.name}`, async ({ page }) => {
                await openFixture(page, fixture.name, { viewpoint: viewpoint.name });
                await stabilize(page);
                await expect(page).toHaveScreenshot(`${fixture.name}--${viewpoint.name}.png`, {
                    stylePath: VISUAL_CSS,
                });
            });
        }
    }
});
