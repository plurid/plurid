/**
 * @jest-environment jsdom
 */
/**
 * THE DOCK TOGGLE IS NAMED BY WHAT IT DOES (2026-10-20). Its label changes with the state (reveal the
 * space / read as a page) and it was also `aria-pressed`: a screen reader heard a pressed button
 * whose name had already changed, two contradicting statements of one state.
 */
import React from 'react';

import {
    renderPlurid,
} from '../../../../testing';



const Page: React.FC = () => <div>page</div>;

describe('the dock toggle', () => {
    it('is an action button, not a toggle button', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }],
            view: ['/a'],
        } as any);
        const toggle = rendered.container.querySelector('[data-plurid-control="dock-toggle"]');
        expect(toggle).not.toBeNull();
        expect(toggle!.hasAttribute('aria-pressed')).toBe(false);
        expect(toggle!.getAttribute('aria-label')).toBeTruthy();
        await rendered.unmount();
    });
});
