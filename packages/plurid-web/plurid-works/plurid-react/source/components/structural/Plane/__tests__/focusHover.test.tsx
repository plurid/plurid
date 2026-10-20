/**
 * @jest-environment jsdom
 */
/**
 * THE KEYBOARD'S HOVER ENDS WITH THE FOCUS (2026-10-20). Focus into a plane lit its controls as a
 * pointer over it does (`mouseOver`), and nothing put them out when the focus left: Tab through the
 * planes and every one of them stayed lit.
 */
import React, { act } from 'react';

import {
    PLURID_ATTRIBUTE_PLANE_ANCHOR,
} from '@plurid/plurid-data';

import {
    renderPlurid,
} from '../../../../testing';



const Page: React.FC = () => <div>page</div>;

describe('a plane the focus leaves', () => {
    it('puts its controls\' hover out', async () => {
        const seen: boolean[] = [];
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }],
            view: ['/a'],
            renderPlaneControls: (context: any) => {
                seen.push(!!context?.mouseOver);
                return <div data-host-controls />;
            },
        } as any);
        const [root] = rendered.api.getSnapshot().space.tree;
        const anchor = rendered.container.querySelector('[' + PLURID_ATTRIBUTE_PLANE_ANCHOR + '="' + root.planeID + '"]') as HTMLElement;
        expect(anchor).not.toBeNull();
        const outside = document.createElement('button');
        document.body.appendChild(outside);

        await act(async () => {
            anchor.focus();
        });
        expect(seen.at(-1)).toBe(true);
        await act(async () => {
            outside.focus();
        });
        expect(seen.at(-1)).toBe(false);

        outside.remove();
        await rendered.unmount();
    });
});
