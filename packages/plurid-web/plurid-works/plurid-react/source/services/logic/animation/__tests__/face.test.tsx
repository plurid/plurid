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

    import PluridLink from '../../../../components/links/Link';
    // #endregion external
// #endregion imports



// #region module
/**
 * FACE THE PLANE. An explicit frame of one plane lands on it face-on: `space.navigateToPlane`,
 * Alt+F (the active plane), Alt+B (its parent), Enter on a plane's anchor. The pair view, from
 * the yaw between a branch and its parent, is for the act that SHOWS the branch (a link that
 * opens one) and for a host that asks for it.
 */
const instant = { space: { navigation: { motion: { duration: 0 } } } } as any;

const pose = (
    rendered: RenderedPlurid,
) => Object.values(rendered.handle.camera.get() as unknown as Record<string, number>)
    .map((value) => Math.round((Number(value) || 0) * 1000));

const settle = async (
    then: () => void,
) => {
    act(then);
    await flushFrames(3);
};

const key = (
    target: HTMLElement,
    code: string,
    init: KeyboardEventInit = {},
) => settle(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: code.replace('Key', '').toLowerCase(), code, bubbles: true, cancelable: true, ...init }));
});


describe('facing a plane', () => {
    afterEach(cleanup);

    it('navigateToPlane, Alt+F, Alt+B and Enter on the anchor face the plane; the pair is asked for', async () => {
        const clock = installFrameClock();
        const rendered = await renderPlurid({
            planes: [
                { route: '/one', component: () => <PluridLink route="/two" linkID="back">go</PluridLink> },
                { route: '/two', component: () => <div>two</div> },
            ],
            view: ['/one'],
            configuration: instant,
        });
        const root = rendered.api.getSnapshot().space.tree[0].planeID;

        // the link SHOWS the branch: the pair view
        await settle(() => {
            (rendered.container.querySelector('[data-plurid-entity="PluridLink"]') as HTMLElement).click();
        });
        const child = rendered.api.getSnapshot().space.tree[0].children![0].planeID;
        const pair = pose(rendered);

        // the child alone, face-on: where `space.frame { planeID }` lands
        await settle(() => {
            rendered.api.pubsub.publish({ topic: 'space.frame', data: { planeID: child, animate: false } } as any);
        });
        const alone = pose(rendered);
        expect(alone).not.toEqual(pair);
        const elsewhere = () => settle(() => {
            rendered.handle.camera.frame({ planeID: root }, { animate: false });
        });

        await elsewhere();
        await settle(() => {
            rendered.api.pubsub.publish({ topic: 'space.navigateToPlane', data: { planeID: child } } as any);
        });
        expect(pose(rendered)).toEqual(alone);

        await elsewhere();
        await settle(() => {
            rendered.api.pubsub.publish({ topic: 'space.navigateToPlane', data: { planeID: child, framing: 'pair' } } as any);
        });
        expect(pose(rendered)).toEqual(pair);

        // Alt+F: the active plane (the child, after the navigate above), face-on
        await elsewhere();
        expect(rendered.api.getSnapshot().space.activePlaneID).toBe(child);
        await key(rendered.view, 'KeyF', { altKey: true });
        expect(pose(rendered)).toEqual(alone);

        // Enter on the child's anchor
        await elsewhere();
        const anchor = document.querySelector('[data-plurid-plane-anchor="' + child + '"]') as HTMLElement;
        expect(anchor).toBeTruthy();
        anchor.focus();
        await key(anchor, 'Enter');
        expect(pose(rendered)).toEqual(alone);

        // Alt+B: the parent, face-on
        await settle(() => {
            rendered.api.pubsub.publish({ topic: 'space.frame', data: { planeID: root, animate: false } } as any);
        });
        const parentAlone = pose(rendered);
        await settle(() => {
            rendered.api.pubsub.publish({ topic: 'space.navigateToPlane', data: { planeID: child } } as any);
        });
        expect(pose(rendered)).not.toEqual(parentAlone);
        await key(rendered.view, 'KeyB', { altKey: true });
        expect(pose(rendered)).toEqual(parentAlone);

        await rendered.unmount();
        clock.restore();
    });
});
// #endregion module
