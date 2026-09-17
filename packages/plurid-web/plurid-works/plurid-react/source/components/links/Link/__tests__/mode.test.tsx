/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React from 'react';

    import {
        act,
        cleanup,
    } from '@testing-library/react';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
        installFrameClock,
        flushFrames,
        RenderedPlurid,
    } from '../../../../testing';

    import PluridLink from '../index';
    // #endregion external
// #endregion imports



// #region module
/**
 * WHAT A CLICK DOES WHEN THE PLANE IS ALREADY OPEN.
 *
 * In the space presentation a link has always toggled: the second click puts the plane it
 * opened away. A product's way back to a branch it made means "take me there": `mode: 'open'`
 * goes to the plane, framed with its parent, and never puts it away. Both bring a put-away
 * plane back.
 */
const instant = { space: { navigation: { motion: { duration: 0 } } } } as any;

const spaceWith = (
    mode?: 'toggle' | 'open',
) => renderPlurid({
    planes: [
        {
            route: '/one',
            component: () => (
                <PluridLink
                    route="/two"
                    linkID="back"
                    mode={mode}
                >
                    go
                </PluridLink>
            ),
        },
        { route: '/two', component: () => <div>two</div> },
    ],
    view: ['/one'],
    configuration: instant,
});

const click = async (
    rendered: RenderedPlurid,
) => {
    act(() => {
        (rendered.container.querySelector('[data-plurid-entity="PluridLink"]') as HTMLElement).click();
    });
    await flushFrames(3);
};

const child = (
    rendered: RenderedPlurid,
) => rendered.api.getSnapshot().space.tree[0].children?.[0];

/** the camera, rounded: the same pose twice is the same numbers */
const pose = (
    rendered: RenderedPlurid,
) => Object.values(rendered.handle.camera.get() as unknown as Record<string, number>)
    .map((value) => Math.round((Number(value) || 0) * 1000));


describe('PluridLink mode', () => {
    afterEach(cleanup);

    it('toggles by default: the second click puts the plane it opened away, the third brings it back', async () => {
        const clock = installFrameClock();
        const rendered = await spaceWith();

        await click(rendered);
        expect(child(rendered)?.show).not.toBe(false);

        await click(rendered);
        expect(child(rendered)?.show).toBe(false);

        await click(rendered);
        expect(child(rendered)?.show).not.toBe(false);

        await rendered.unmount();
        clock.restore();
    });

    it('open goes to the plane it opened, framed with its parent, and never puts it away', async () => {
        const clock = installFrameClock();
        const rendered = await spaceWith('open');

        await click(rendered);
        const opened = child(rendered);
        expect(opened?.show).not.toBe(false);
        expect(rendered.api.getSnapshot().space.activePlaneID).toBe(opened!.planeID);
        const pair = pose(rendered);

        // the camera goes elsewhere: the root alone, face-on
        const root = rendered.api.getSnapshot().space.tree[0].planeID;
        act(() => {
            rendered.handle.camera.frame({ planeID: root }, { animate: false });
        });
        await flushFrames(3);
        expect(pose(rendered)).not.toEqual(pair);

        // the click is the way back to the pair view; the plane stays
        await click(rendered);
        expect(child(rendered)?.show).not.toBe(false);
        expect(child(rendered)?.planeID).toBe(opened!.planeID);
        expect(rendered.api.getSnapshot().space.activePlaneID).toBe(opened!.planeID);
        expect(pose(rendered)).toEqual(pair);

        await rendered.unmount();
        clock.restore();
    });

    it('open brings a put-away plane back, the same plane', async () => {
        const clock = installFrameClock();
        const rendered = await spaceWith('open');

        await click(rendered);
        const opened = child(rendered)!;
        act(() => {
            rendered.api.pubsub.publish({ topic: 'space.closePlane', data: { planeID: opened.planeID } } as any);
        });
        await flushFrames(3);
        expect(child(rendered)?.show).toBe(false);

        await click(rendered);
        expect(child(rendered)?.show).not.toBe(false);
        expect(child(rendered)?.planeID).toBe(opened.planeID);
        expect(rendered.api.getSnapshot().space.tree[0].children).toHaveLength(1);

        await rendered.unmount();
        clock.restore();
    });
});
// #endregion module
