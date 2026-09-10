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
    } from '../../../../testing';
    // #endregion external
// #endregion imports



// #region module
const Content = () => <div style={{ height: 120 }}>content</div>;

describe('a registered plane with a declared size', () => {
    it('renders exactly the declared box, and a declared width alone leaves the height to the content', async () => {
        const rendered = await renderPlurid({
            planes: [
                { route: '/sized', component: Content, width: 480, height: 300 },
                ['/wide', Content, { width: 200 }],
                { route: '/plain', component: Content },
            ] as any,
            view: ['/sized', '/wide', '/plain'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        });
        const tree = rendered.api.getSnapshot().space.tree;
        // the tree holds the FULL route (protocol://host/…); match the registered path by suffix
        const byRoute = (route: string) => tree.find((node: any) => String(node.route).endsWith(route))!;
        expect(byRoute('/sized')).toMatchObject({ width: 480, height: 300, sizeMode: 'declared' });
        expect(byRoute('/wide')).toMatchObject({ width: 200, sizeMode: 'declared' });
        expect(byRoute('/plain').sizeMode).toBeUndefined();

        const element = (route: string) => rendered.container.querySelector(`[data-plurid-plane="${byRoute(route).planeID}"]`) as HTMLElement;
        expect(element('/sized').style.width).toBe('480px');
        expect(element('/sized').style.height).toBe('300px');
        expect(element('/wide').style.width).toBe('200px');
        expect(element('/wide').style.height).toBe('');
        expect(element('/plain').style.height).toBe('');
        expect(element('/plain').style.width).not.toBe('480px');
        rendered.unmount();
    });

    it('a content-sized plane capped by maxHeight (its own, else the configured one) scrolls inside the cap', async () => {
        const rendered = await renderPlurid({
            planes: [
                { route: '/capped', component: Content, maxHeight: 200 },
                { route: '/plain', component: Content },
                { route: '/sized', component: Content, width: 480, height: 300, maxHeight: 50 },
            ] as any,
            view: ['/capped', '/plain', '/sized'],
            configuration: { elements: { plane: { maxHeight: 0.5 } }, space: { navigation: { motion: { duration: 0 } } } } as any,
        });
        const tree = rendered.api.getSnapshot().space.tree;
        const byRoute = (route: string) => tree.find((node: any) => String(node.route).endsWith(route))!;
        const element = (route: string) => rendered.container.querySelector(`[data-plurid-plane="${byRoute(route).planeID}"]`) as HTMLElement;
        const scroller = (route: string) => element(route).querySelector('[data-plurid-entity="PluridPlaneContent"]') as HTMLElement;
        expect(element('/capped').style.maxHeight).toBe('200px');
        expect(scroller('/capped').getAttribute('tabindex')).toBe('-1');
        // the configured cap: half the view
        const viewHeight = rendered.api.getSnapshot().space.viewSize.height;
        expect(element('/plain').style.maxHeight).toBe(viewHeight / 2 + 'px');
        // a declared height ignores the cap
        expect(element('/sized').style.maxHeight).toBe('');
        expect(element('/sized').style.height).toBe('300px');
        rendered.unmount();
    });
});
// #endregion module
