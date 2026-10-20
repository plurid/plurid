/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, {
        act,
    } from 'react';

    import {
        PLURID_PUBSUB_TOPIC,
    } from '@plurid/plurid-data';
    // #endregion libraries

    // #region external
    import {
        renderPlurid,
    } from '../../../../testing';
    // #endregion external
// #endregion imports



// #region module
const Page = () => <div>page</div>;
const planes = [{ route: '/one', component: Page }, { route: '/two', component: Page }];
const configuration = { space: { navigation: { motion: { duration: 0 } } } } as any;

/**
 * IN ITS OWN APPLICATION (2026-10-20). A navigation lands the keyboard focus in the plane it framed,
 * looked up by id in the whole document: two applications with the same routes hold the same plane
 * ids, and the second one's navigation focused the first one's plane.
 */
describe('the focus a navigation lands', () => {
    it('is in the plane of the application that navigated', async () => {
        const first = await renderPlurid({ id: 'first', planes, view: ['/one', '/two'], configuration });
        const second = await renderPlurid({ id: 'second', planes, view: ['/one', '/two'], configuration });
        const two = second.api.getSnapshot().space.tree[1];
        // the premise: the same ids in both
        expect(first.api.getSnapshot().space.tree[1].planeID).toBe(two.planeID);

        await act(async () => {
            second.api.pubsub.publish({ topic: PLURID_PUBSUB_TOPIC.NAVIGATE_TO_PLANE, data: { planeID: two.planeID } });
        });

        const focused = document.activeElement;
        expect(focused?.closest('[data-plurid-plane]')?.getAttribute('data-plurid-plane')).toBe(two.planeID);
        expect(second.container.contains(focused)).toBe(true);
        expect(first.container.contains(focused)).toBe(false);

        await second.unmount();
        await first.unmount();
    });
});
// #endregion module
