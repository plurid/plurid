/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
        gestures,
        flushFrames,
        installFrameClock,
        RenderedPlurid,
    } from '../../../../../testing';
    // #endregion external
// #endregion imports



// #region module
const planes = [
    { route: '/one', component: () => <div style={{ height: 200 }}>one</div> },
];

/** Every motion the store changes to from here on. */
const recordMotions = (
    rendered: RenderedPlurid,
) => {
    const motions: string[] = [];
    let last: string = rendered.api.getSnapshot().space.motion;
    const unsubscribe = rendered.api.store.subscribe(() => {
        const motion = rendered.api.getSnapshot().space.motion;
        if (motion !== last) {
            motions.push(motion);
            last = motion;
        }
    });
    return { motions, unsubscribe };
};


/**
 * A DRAG IS A GESTURE (2026-10-19): `state.space.motion` reads `gesture` from a navigation drag's
 * first move to its release. Nothing set it before — only tweens and flings did — so the drag's
 * styling (`data-plurid-motion='gesture'`), the re-frame after a measurement, the detach tier, the
 * measured relayout and an agent's settle all took a drag for a still camera.
 */
describe('usePointerGestures', () => {
    it('a navigation drag is a gesture until its release, then rest when nothing is thrown', async () => {
        const clock = installFrameClock();
        const rendered = await renderPlurid({
            planes,
            view: ['/one'],
            configuration: { space: { gestures: { disableMomentum: true, dragThreshold: 0 } } } as any,
        });
        const { motions, unsubscribe } = recordMotions(rendered);
        rendered.handle.focus();
        // grab mode: the drag is the space's wherever it lands
        await gestures.key(rendered.view, 'KeyG');

        await gestures.drag(rendered.view, { x: 100, y: 500 }, { x: 260, y: 500 }, { steps: 4 });
        await flushFrames(2);
        unsubscribe();

        expect(rendered.api.getSnapshot().space.camera.yaw).toBeGreaterThan(5);
        expect(motions).toEqual(['gesture', 'idle']);
        expect(rendered.view.getAttribute('data-plurid-motion')).toBeNull();

        await rendered.unmount();
        clock.restore();
    });

    it('a press that never moves is a click: no gesture', async () => {
        const clock = installFrameClock();
        const rendered = await renderPlurid({
            planes,
            view: ['/one'],
            configuration: { space: { gestures: { disableMomentum: true } } } as any,
        });
        const { motions, unsubscribe } = recordMotions(rendered);
        rendered.handle.focus();
        await gestures.key(rendered.view, 'KeyG');

        await gestures.drag(rendered.view, { x: 100, y: 500 }, { x: 100, y: 500 }, { steps: 1 });
        await flushFrames(2);
        unsubscribe();

        expect(motions).not.toContain('gesture');

        await rendered.unmount();
        clock.restore();
    });
});
// #endregion module
