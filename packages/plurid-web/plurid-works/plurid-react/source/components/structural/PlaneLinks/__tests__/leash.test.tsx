/**
 * @jest-environment jsdom
 */
/**
 * THE LEASH: a child moved by hand loses its bridge band and gains a beam from the link's point to
 * its edge, drawn by the beams layer; undoing the move brings the band back.
 */
import React, { act } from 'react';

import {
    renderPlurid,
} from '../../../../testing';



const Page = () => <div>page</div>;
const BAND = '[data-plurid-entity="PluridPlaneBridge"]';
const LEASH = '[data-plurid-entity="PluridPlaneLeash"]';

describe('a moved child\'s leash', () => {
    it('replaces the band while the child is pinned, and only then', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }],
            view: ['/a', '/b'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        });
        const store = rendered.api.store;
        const [a, b] = store.getState().space.tree;
        const hang = (manuallyPositioned: boolean) => [{
            ...a,
            children: [{
                ...b,
                parentPlaneID: a.planeID,
                linkCoordinates: { x: 120, y: 40 },
                bridgeLength: 100,
                planeAngle: 90,
                bridgeSide: 'start' as const,
                bridgeOffset: -15,
                manuallyPositioned,
                location: { translateX: 900, translateY: 300, translateZ: -200, rotateX: 0, rotateY: 90 },
            }],
        }];
        await act(async () => {
            store.dispatch({ type: 'space/restoreArrangement', payload: { tree: hang(true), links: [] } });
        });
        const child = () => rendered.container.querySelector(`[data-plurid-plane="${b.planeID}"]`)!;
        expect(child().querySelector(BAND)).toBeNull();
        const leash = rendered.container.querySelector(LEASH) as HTMLElement;
        expect(leash).toBeTruthy();
        expect(leash.getAttribute('data-plurid-leash-for')).toBe(b.planeID);
        // the beam starts at the link's point on the parent's face
        expect(leash.style.transform).toContain(`translate3d(${a.location.translateX + 120}px, ${a.location.translateY + 40 - 15}px, ${a.location.translateZ}px)`);
        expect(parseFloat(leash.style.width)).toBeGreaterThan(0);
        // the move undone: the band is back, the leash gone
        await act(async () => {
            store.dispatch({ type: 'space/restoreArrangement', payload: { tree: hang(false), links: [] } });
        });
        expect(child().querySelector(BAND)).toBeTruthy();
        expect(rendered.container.querySelector(LEASH)).toBeNull();
        rendered.unmount();
    });
});
