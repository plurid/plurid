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
    RenderedPlurid,
} from '../../../../testing';
import {
    styledDeclarations,
} from '../../../../testing/styles';

import {
    LEASH_THICKNESS,
} from '../index';



const Page = () => <div>page</div>;
const BAND = '[data-plurid-entity="PluridPlaneBridge"]';
const LEASH = '[data-plurid-entity="PluridPlaneLeash"]';

/** The second root hung from the first and moved by hand: its bridge is a leash. Later roots stay. */
const pinSecond = async (
    rendered: RenderedPlurid,
) => {
    const store = rendered.api.store;
    const [a, b, ...others] = store.getState().space.tree;
    const tree = [{
        ...a,
        children: [{
            ...b,
            parentPlaneID: a.planeID,
            linkCoordinates: { x: 120, y: 40 },
            bridgeLength: 100,
            planeAngle: 90,
            bridgeSide: 'start' as const,
            bridgeOffset: -15,
            manuallyPositioned: true,
            location: { translateX: 900, translateY: 300, translateZ: -200, rotateX: 0, rotateY: 90 },
        }],
    }, ...others];
    await act(async () => {
        store.dispatch({ type: 'space/restoreArrangement', payload: { tree, links: [] } });
    });
    return { a, b, others };
};

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
        // THE BEAM IS CENTRED ON THE LINK'S POINT on the parent's face: it
        // starts half its own thickness above it, whatever that thickness is.
        // Pinning the number here meant thinning the beam (from the band's 30
        // to a beam's 6, 2026-09-14) failed a test about centring.
        expect(leash.style.transform).toContain(`translate3d(${a.location.translateX + 120}px, ${a.location.translateY + 40 - (LEASH_THICKNESS / 2)}px, ${a.location.translateZ}px)`);
        expect(parseFloat(leash.style.width)).toBeGreaterThan(0);
        // the move undone: the band is back, the leash gone
        await act(async () => {
            store.dispatch({ type: 'space/restoreArrangement', payload: { tree: hang(false), links: [] } });
        });
        expect(child().querySelector(BAND)).toBeTruthy();
        expect(rendered.container.querySelector(LEASH)).toBeNull();
        rendered.unmount();
    });

    /**
     * THE LEASH IS THE BRIDGE (2026-10-20): `elements.planeBridge.show` hides it with the bands, as the
     * docs say, and hiding the link beams (`elements.planeLinks.show`) leaves it. It was the beams' to
     * hide: the bridges' switch left every leash drawn, and the beams' took them away.
     */
    it('hides with the bridges, not with the link beams', async () => {
        const leashed = async (elements: object) => {
            const rendered = await renderPlurid({
                planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }],
                view: ['/a', '/b'],
                configuration: { space: { navigation: { motion: { duration: 0 } } }, elements } as any,
            });
            await pinSecond(rendered);
            const shown = !!rendered.container.querySelector(LEASH);
            await rendered.unmount();
            return shown;
        };
        expect(await leashed({ planeBridge: { show: false } })).toBe(false);
        expect(await leashed({ planeLinks: { show: false } })).toBe(true);
        expect(await leashed({})).toBe(true);
    });

    /**
     * WITH THE PLANE IT HOLDS (2026-10-20): the band is drawn on the child, so it went with it; the
     * leash is drawn in the roots' frame and stayed, a line over the docked page to a plane set aside,
     * or to one the culling pass took away.
     */
    it('fades with its child set aside, and is not painted while the child is culled', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }, { route: '/c', component: Page }],
            view: ['/a', '/b', '/c'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        });
        const { b, others: [c] } = await pinSecond(rendered);
        const leash = () => rendered.container.querySelector(LEASH) as HTMLElement;
        expect(leash().hasAttribute('data-plurid-aside')).toBe(false);

        // docked on another root: the child is set aside, and its leash with it
        act(() => { rendered.handle.camera.dock(c.planeID, { animate: false }); });
        expect(rendered.container.querySelector(`[data-plurid-plane="${b.planeID}"]`)!.getAttribute('data-plurid-aside')).toBe('true');
        expect(leash().getAttribute('data-plurid-aside')).toBe('true');
        expect(styledDeclarations(leash(), 'opacity', '[data-plurid-aside]').at(-1)).toBe('0');
        expect(styledDeclarations(leash(), 'visibility', '[data-plurid-aside]').at(-1)).toBe('hidden');

        act(() => { rendered.api.pubsub.publish({ topic: 'space.reveal', data: { animate: false } }); });
        expect(leash().hasAttribute('data-plurid-aside')).toBe(false);

        // culled
        act(() => { rendered.api.store.dispatch({ type: 'space/setCulled', payload: { hidden: [b.planeID], frozen: [], detached: [] } }); });
        expect(leash().getAttribute('data-plurid-culled')).toBe('hidden');
        expect(styledDeclarations(leash(), 'visibility', '[data-plurid-culled]').at(-1)).toBe('hidden');
        act(() => { rendered.api.store.dispatch({ type: 'space/setCulled', payload: { hidden: [], frozen: [b.planeID], detached: [] } }); });
        expect(leash().hasAttribute('data-plurid-culled')).toBe(false);
        await rendered.unmount();
    });
});
