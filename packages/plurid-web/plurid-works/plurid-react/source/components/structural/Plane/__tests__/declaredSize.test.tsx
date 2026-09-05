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
});
// #endregion module
