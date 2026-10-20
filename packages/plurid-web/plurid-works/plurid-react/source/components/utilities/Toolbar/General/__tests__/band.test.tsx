/**
 * @jest-environment jsdom
 */
/**
 * AN OPEN MENU TAKES ITS OWN CLICKS, NOT THE BAND'S (2026-10-20). With a menu open the toolbar's
 * container, a band across the whole view 75 px high, took the pointer: the planes under it could not
 * be clicked until the menu closed. The container stays click-through; the strip and the menu take
 * their own.
 */
import React, { act } from 'react';

import {
    renderPlurid,
} from '../../../../../testing';
import {
    styledDeclarations,
} from '../../../../../testing/styles';



const Page: React.FC = () => <div>page</div>;

describe('the toolbar with a menu open', () => {
    it('lets the pointer through its band', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }],
            view: ['/a'],
        } as any);
        const more = rendered.container.querySelector('[data-plurid-control="toolbar-more"]') as HTMLElement;
        await act(async () => {
            more.click();
        });
        const menu = rendered.container.querySelector('[data-plurid-control="toolbar-menu"]');
        const container = more.parentElement!.parentElement as HTMLElement;
        expect(styledDeclarations(container, 'pointer-events').at(-1)).toBe('none');
        expect(menu).not.toBeNull();
        expect(styledDeclarations(menu as Element, 'pointer-events').at(-1)).toBe('auto');
        await rendered.unmount();
    });
});
