/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, { act } from 'react';

    import PluridPubSub from '@plurid/plurid-pubsub';

    import {
        PLURID_PUBSUB_TOPIC,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
    } from '../../../../testing';

    import PluridApplicationConfigurator from '../index';
    // #endregion external
// #endregion imports



// #region module
/**
 * A CONFIGURATOR'S BUS IS BRIDGED ONCE, AND LEAVES WITH IT (2026-09-29). It registered its bus on
 * every mount and never took it off: after a plane refresh one `space.rotateXWith 10` turned the
 * camera by 20, and a configurator long gone still drove the space.
 */
const wait = (milliseconds: number) => act(async () => {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
});

describe('a configurator\'s bus', () => {
    it('drives the space once, however often its plane mounts, and not after it is gone', async () => {
        const side = new PluridPubSub({ onDrop: null });
        const main = new PluridPubSub({ onDrop: null });
        const Configured = () => (
            <div>
                <PluridApplicationConfigurator pubsub={side} />
                configured
            </div>
        );
        const rendered = await renderPlurid({
            planes: [
                { route: '/a', component: Configured },
                { route: '/b', component: () => <div>b</div> },
            ],
            view: ['/a', '/b'],
            pubsub: main,
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        } as any);
        const pitch = () => rendered.api.getSnapshot().space.camera.pitch;
        const planeA = rendered.api.getSnapshot().space.tree[0].planeID;

        const before = pitch();
        await act(async () => {
            side.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH, data: { value: 10 } } as any);
        });
        const once = pitch() - before;
        expect(Math.abs(once)).toBeGreaterThan(0);

        // the plane's content remounts: its configurator mounts again
        await act(async () => {
            main.publish({ topic: PLURID_PUBSUB_TOPIC.REFRESH_PLANE, data: { planeID: planeA } } as any);
        });
        await wait(400);
        const again = pitch();
        await act(async () => {
            side.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH, data: { value: 10 } } as any);
        });
        expect(pitch() - again).toBeCloseTo(once, 6);

        // the plane goes: its bus no longer drives anything
        await act(async () => {
            main.publish({ topic: PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE, data: { planeID: '/a' } } as any);
        });
        await wait(50);
        const gone = pitch();
        await act(async () => {
            side.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH, data: { value: 10 } } as any);
        });
        expect(pitch()).toBe(gone);
        await rendered.unmount();
    });
});
// #endregion module
