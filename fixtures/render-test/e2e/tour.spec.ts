import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
    collectConsoleErrors,
    publish,
    tree,
    rootByRoute,
    clickLink,
    waitForChildren,
    waitForState,
    settle,
    viewRect,
} from './helpers';


/**
 * TOURS (2026-10-30), in a real browser: `space.tour` plays stops named by a plane's path, and the
 * player says what it does on `space.changed` kind `tour`. Every check is what a reader sees: the
 * plane a stop names is the one under the view centre when the tour says it arrived, after the
 * plane moved under the travel, after the reader took the camera and gave it back.
 */

interface TourHeard {
    state: { status: string; index: number; stepID: string; planeID: string; paused?: string; ended?: string };
    event?: { type: string; index: number; reason?: string };
}

/** Listen to the tour on the bus, as a host's caption bar does: `window.__rtTour` holds what was heard. */
const listen = (page: Page) => page.evaluate(() => {
    const w = window as any;
    w.__rtTour = [];
    w.__pluridApi.pubsub.subscribe({
        topic: 'space.changed',
        callback: (data: any) => {
            if (data?.kind === 'tour') {
                w.__rtTour.push(data.value);
            }
        },
    });
});

const heard = (page: Page): Promise<TourHeard[]> => page.evaluate(() => (window as any).__rtTour);

/** Wait until the tour says `type` (at `index`), naming it when it never does. */
const waitForTour = async (
    page: Page,
    type: string,
    index: number,
) => {
    try {
        await page.waitForFunction(
            ({ type, index }) => ((window as any).__rtTour as TourHeard[]).some((value) => value.event?.type === type && value.event.index === index),
            { type, index },
            { timeout: 10_000 },
        );
    } catch (error) {
        throw new Error(`waiting for: the tour's '${type}' at stop ${index}: it never came (${String(error).split('\n')[0]})`);
    }
};

const step = (
    id: string,
    path: string,
    pose: 'frame' | 'dock' = 'frame',
) => ({ id, anchor: { path, pose }, dwell: null });

const play = (
    page: Page,
    ...steps: ReturnType<typeof step>[]
) => publish(page, 'space.tour', { action: 'play', tour: { plurid: 'plurid/tour', version: 1, steps } });

/** The plane drawn under the view centre, as the browser hit-tests it. */
const planeAtCentre = async (page: Page): Promise<string | null> => {
    const rect = await viewRect(page);
    return page.evaluate(({ x, y }) => {
        for (const element of document.elementsFromPoint(x, y)) {
            const plane = element.closest('[data-plurid-plane]');
            if (plane) {
                return plane.getAttribute('data-plurid-plane');
            }
        }
        return null;
    }, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
};

const stateOf = async (page: Page) => {
    await publish(page, 'space.tour', { action: 'state' });
    const all = await heard(page);
    return all[all.length - 1].state;
};


test.describe('tours', () => {
    test('a tour travels to each stop, and the plane it names is under the view centre when it arrives', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        await openHarness(page);
        await listen(page);
        const roots = await tree(page);
        const transform = rootByRoute(roots, '/transform');
        const material = rootByRoute(roots, '/material');

        await play(page, step('transform', '/transform'), step('material', '/material', 'dock'));
        await waitForTour(page, 'arrive', 0);
        await settle(page);
        expect(await planeAtCentre(page)).toBe(transform.planeID);

        await publish(page, 'space.tour', { action: 'next' });
        await waitForTour(page, 'arrive', 1);
        await settle(page);
        expect(await planeAtCentre(page)).toBe(material.planeID);
        expect((await heard(page)).map((value) => value.event?.type)).toEqual(['travel', 'arrive', 'travel', 'arrive']);

        await publish(page, 'space.tour', { action: 'next' });
        expect(await stateOf(page)).toMatchObject({ status: 'ended', ended: 'complete' });
        expect(errors).toEqual([]);
    });

    test('THE STOP FOLLOWS ITS PLANE: a relayout under the travel, and the stop lands where the plane went', async ({ page }) => {
        await openHarness(page, '?motionMs=900');
        await listen(page);
        const before = rootByRoute(await tree(page), '/tessellation');

        await play(page, step('tessellation', '/tessellation'));
        await waitForTour(page, 'travel', 0);
        // the roots are laid out again while the camera is on its way
        await publish(page, 'configuration', { space: { layout: { type: 'ROWS' } } });
        await waitForTour(page, 'arrive', 0);
        await waitForState(page, (state) => state.space.layoutTransition === 0, 'the relayout to glide home');
        await settle(page);

        const moved = rootByRoute(await tree(page), '/tessellation');
        expect(JSON.stringify(moved.location), 'the relayout moved the plane').not.toBe(JSON.stringify(before.location));
        expect(await planeAtCentre(page)).toBe(moved.planeID);
        expect((await stateOf(page)).status).toBe('dwelling');
    });

    test('a stop on a plane a link opened lands on it, framed with the space as it is', async ({ page }) => {
        await openHarness(page);
        await listen(page);
        const geometry = rootByRoute(await tree(page), '/geometry');
        await clickLink(page, geometry.planeID, '/geometry/detail');
        await waitForChildren(page, geometry.planeID, 1);
        await settle(page);
        await waitForState(page, (state) => state.space.layoutTransition === 0, 'the spawn to settle');
        const detail = rootByRoute(await tree(page), '/geometry').children[0];

        await play(page, step('home', '/material'), step('detail', '/geometry/detail'));
        await waitForTour(page, 'arrive', 0);
        await publish(page, 'space.tour', { action: 'next' });
        await waitForTour(page, 'arrive', 1);
        await settle(page);
        expect(await planeAtCentre(page)).toBe(detail.planeID);
    });

    test('INPUT PAUSES IT: a drag on the space mid-travel; resume goes back to the stop', async ({ page }) => {
        await openHarness(page, '?motionMs=1200');
        await listen(page);
        const topology = rootByRoute(await tree(page), '/topology');

        await play(page, step('topology', '/topology'));
        await waitForTour(page, 'travel', 0);
        const rect = await viewRect(page);
        await page.mouse.move(rect.left + 30, rect.top + rect.height - 30);
        await page.mouse.down();
        await page.mouse.move(rect.left + 180, rect.top + rect.height - 30, { steps: 4 });
        await page.mouse.up();
        await waitForTour(page, 'pause', 0);
        expect(await stateOf(page)).toMatchObject({ status: 'paused', paused: 'input' });
        await settle(page);

        await publish(page, 'space.tour', { action: 'resume' });
        await waitForTour(page, 'arrive', 0);
        await settle(page);
        expect(await planeAtCentre(page)).toBe(topology.planeID);
    });

    test('REDUCED MOTION: the travel is a jump, and the arrival comes in the same task', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');
        await listen(page);
        const tessellation = rootByRoute(await tree(page), '/tessellation');
        const types = await page.evaluate(() => {
            const w = window as any;
            w.__pluridApi.pubsub.publish({
                topic: 'space.tour',
                data: { action: 'play', tour: { plurid: 'plurid/tour', version: 1, steps: [{ id: 'one', anchor: { path: '/tessellation' }, dwell: null }] } },
            });
            return (w.__rtTour as TourHeard[]).map((value) => value.event?.type);
        });
        expect(types).toEqual(['travel', 'arrive']);
        await settle(page);
        expect(await planeAtCentre(page)).toBe(tessellation.planeID);
    });
});
