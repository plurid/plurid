/**
 * @jest-environment jsdom
 */
/**
 * THE MINIMAP'S TWO STATES SHOW (2026-10-20). A dot's depth opacity was inline, so the hover rule
 * that brightens it lost to it; and `elements.minimap.transparent: false` was handed to the panel's
 * rule, which never read it: the panel was transparent at rest whatever the configuration said.
 */
import React from 'react';

import {
    renderPlurid,
} from '../../../../testing';
import {
    styledDeclarations,
} from '../../../../testing/styles';



const Page: React.FC = () => <div>page</div>;
const render = (transparent: boolean) => renderPlurid({
    planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }],
    view: ['/a', '/b'],
    configuration: { elements: { minimap: { show: true, transparent } } },
} as any);

describe('the minimap', () => {
    it('leaves a dot\'s opacity to its rules, and draws the solid panel at rest when not transparent', async () => {
        const transparent = await render(true);
        const hit = transparent.container.querySelector('[data-plurid-control="minimap-plane"]') as HTMLElement;
        expect(hit).not.toBeNull();
        const dot = hit.firstElementChild as HTMLElement;
        expect(dot.style.opacity).toBe('');
        const panel = hit.parentElement as HTMLElement;
        const atRest = styledDeclarations(panel, 'background-color').at(-1);
        await transparent.unmount();

        const solid = await render(false);
        const solidPanel = (solid.container.querySelector('[data-plurid-control="minimap-plane"]') as HTMLElement).parentElement as HTMLElement;
        expect(styledDeclarations(solidPanel, 'background-color').at(-1)).not.toBe(atRest);
        await solid.unmount();
    });
});
