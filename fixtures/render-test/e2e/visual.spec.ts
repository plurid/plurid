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
/**
 * THE CHROME HAS TO STOP MOVING TOO. `settle` waits for the CAMERA; the toolbar fades in on its own
 * clock, the viewcube turns to the camera through a transition, and a bus-driven fixture reaches
 * its viewpoint at a time that varies with the machine, so two runs of one fixture caught the
 * chrome at different points of its fade (CI #77 against #78: three pictures differed in nothing
 * but the toolbar's text and the cube's edges). Playwright freezes CSS animations for the capture,
 * not a fade a component drives by state. So: the computed state of the chrome, sampled a frame
 * apart, must read the same three times running before the picture is taken.
 */
const chromeQuiet = (
    page: Page,
) => page.waitForFunction(async () => {
    const fingerprint = () => Array.from(document.querySelectorAll(
        '[data-plurid-entity="PluridToolbar"], [data-plurid-entity="PluridViewcube"], [data-plurid-entity="PluridDockRail"], [data-plurid-entity="PluridPlane"]',
    )).map((element) => {
        const style = getComputedStyle(element as HTMLElement);
        return [style.opacity, style.bottom, style.transform, style.visibility].join('|');
    }).join(';');
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const first = fingerprint();
    await frame();
    const second = fingerprint();
    await frame();
    const third = fingerprint();
    return first === second && second === third;
}, undefined, { timeout: 10_000, polling: 50 });

const stabilize = async (page: Page) => {
    await page.evaluate(() => (document as any).fonts?.ready);
    await settle(page);
    await afterFrames(page, 2);
    await chromeQuiet(page);
};

/**
 * THE ORIGIN IS IN THE PICTURE. A plane's bar renders its full route — `plurid://<host>:<port>/path` —
 * so the address the harness was SERVED from is part of every screenshot that shows a bar. A baseline
 * taken against a different origin differs from CI in nothing but that string, which reads as a
 * mysterious ~3000-pixel text diff.
 *
 * That is not hypothetical: the first `linux` set was generated with the harness served from the host
 * and reached at `host.docker.internal:5273`, and 28 of 42 baselines went in with that alias baked in
 * (2026-09-13). This guard is why it cannot happen twice — it fails at GENERATION time, naming the
 * origin it found, instead of writing 28 quietly wrong pictures.
 */
const REQUIRED_ORIGIN = 'http://localhost:5273';

const guardOrigin = (
    page: Page,
) => {
    const origin = new URL(page.url()).origin;
    expect(
        origin,
        'the visual baselines are origin-sensitive (a plane bar renders its full route, host and port'
            + ' included), so they must be taken against ' + REQUIRED_ORIGIN + ' — the address CI serves'
            + ' from. Serve the harness INSIDE the container rather than reaching a host server.',
    ).toBe(REQUIRED_ORIGIN);
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
 * inside the PINNED Playwright container. The container has no `pnpm`, so its `webServer` command
 * (`pnpm dev`) exits 127: serve the harness from INSIDE the container, at the same `localhost:5273`
 * CI uses, and let Playwright adopt it (`reuseExistingServer`):
 *
 *     docker run --rm -v "$PWD/../..":/work -w /work/fixtures/render-test \
 *         mcr.microsoft.com/playwright:v1.62.1-noble \
 *         bash -lc 'npx vite --port 5273 --strictPort >/tmp/vite.log 2>&1 &
 *                   npx wait-on http://localhost:5273 &&
 *                   npx playwright test --config e2e/playwright.config.ts \
 *                       --project=visual --update-snapshots'
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
                guardOrigin(page);
                await stabilize(page);
                await expect(page).toHaveScreenshot(`${fixture.name}--${viewpoint.name}.png`, {
                    stylePath: VISUAL_CSS,
                });
                expect(errors, 'console errors while rendering ' + fixture.name).toEqual([]);
            });
        }
    }
});
