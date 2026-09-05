/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React from 'react';
    import { act } from 'react';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
        installFrameClock,
    } from '../../../../testing';

    import PluridLink from '~components/links/Link';

    import {
        usePluridPlane,
        PluridPlaneLens,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
describe('usePluridPlane()', () => {
    it('exposes the plane identity, the pubsub and the commands', async () => {
        const clock = installFrameClock();
        const lenses: Record<string, PluridPlaneLens> = {};

        const Detail = () => {
            const plane = usePluridPlane();
            lenses[plane.route || 'none'] = plane;
            return <div>detail</div>;
        };
        const Registry = () => {
            const plane = usePluridPlane();
            lenses[plane.route || 'none'] = plane;
            return <PluridLink route="/imagene/42">open</PluridLink>;
        };

        const rendered = await renderPlurid({
            planes: [
                { route: '/registry', component: Registry },
                { route: '/imagene/:id', component: Detail },
            ],
            view: ['/registry'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        });

        const registry = lenses['/registry'];
        expect(registry).toBeTruthy();
        expect(registry.planeID).toBeTruthy();
        expect(registry.parentPlaneID).toBeUndefined();
        expect(registry.pubsub).toBeDefined();
        expect(typeof registry.close).toBe('function');
        expect(typeof registry.navigateToParent).toBe('function');
        expect(typeof registry.frame).toBe('function');

        // open the child through the link, then read its lens
        const link = rendered.container.querySelector('[data-plurid-link-route$="/imagene/42"]') as HTMLElement;
        await act(async () => {
            link.click();
        });
        // the lens keys by the REGISTERED route (the pattern); the values are in `parameters`
        const detail = lenses['/imagene/:id'];
        expect(detail).toBeTruthy();
        expect(detail.route).toBe('/imagene/:id');
        expect(detail.parameters).toEqual({ id: '42' });
        expect(detail.parentPlaneID).toBe(registry.planeID);
        expect(detail.planeID).toBe(rendered.api.getSnapshot().space.tree[0].children![0].planeID);

        // the child closes itself: hidden, and the camera hands over to the parent (active plane)
        await act(async () => {
            detail.close();
        });
        const tree = rendered.api.getSnapshot().space.tree;
        expect(tree[0].children![0].show).toBe(false);
        expect(rendered.api.getSnapshot().space.activePlaneID).toBe(registry.planeID);

        await rendered.unmount();
        clock.restore();
    });
});
// #endregion module
