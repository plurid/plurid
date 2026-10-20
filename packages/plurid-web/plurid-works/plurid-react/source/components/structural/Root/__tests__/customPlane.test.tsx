/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, {
        forwardRef,
        memo,
    } from 'react';
    // #endregion libraries

    // #region external
    import {
        renderPlurid,
    } from '../../../../testing';
    // #endregion external
// #endregion imports



// #region module
const Page = () => <div data-page>page</div>;
const Custom = ({ planeID }: { planeID: string }) => <div data-custom-plane={planeID}>custom</div>;

/**
 * A ROOT TAKES WHAT A CHILD TAKES (2026-10-20). A child's custom plane may be any React component,
 * a `memo` or a `forwardRef` object among them, and one that is not renderable leaves the child its
 * own plane. A root asked for a function: an object rendered nothing, and the root's whole subtree
 * went with it.
 */
describe('a custom plane at a root', () => {
    it('renders as a function, a memo or a forwardRef component', async () => {
        const kinds = {
            function: Custom,
            memo: memo(Custom),
            forwardRef: forwardRef<HTMLDivElement, { planeID: string }>((properties, _reference) => <Custom {...properties} />),
        };
        for (const [kind, customPlane] of Object.entries(kinds)) {
            const rendered = await renderPlurid({
                planes: [{ route: '/one', component: Page }],
                view: ['/one'],
                customPlane,
            } as any);
            const root = rendered.api.getSnapshot().space.tree[0];
            expect([kind, rendered.container.querySelector('[data-custom-plane]')?.getAttribute('data-custom-plane')]).toEqual([kind, root.planeID]);
            await rendered.unmount();
        }
    });

    it('leaves a root its own plane when the custom one is not renderable, as a child', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/one', component: Page }],
            view: ['/one'],
            customPlane: 'Card',
        } as any);
        expect(rendered.container.querySelector('[data-page]')).toBeTruthy();
        await rendered.unmount();
    });
});
// #endregion module
