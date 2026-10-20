/**
 * @jest-environment jsdom
 */
/**
 * THE DOCK FADE IS THE LOOK'S (2026-10-20). The view pinned `--plurid-dock-fade` inline, from
 * `docking.fade` or 240 ms, which beat the look's alias of `--plurid-fade` and any host stylesheet:
 * a look's own fade never reached the planes. The look writes `docking.fade` as its fade when set.
 */
import React from 'react';

import {
    renderPlurid,
} from '../../../testing';



const Page: React.FC = () => <div>page</div>;

describe('the dock fade', () => {
    it('is not pinned on the view: the look\'s fade, or docking.fade through it', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }],
            view: ['/a'],
            configuration: { global: { look: { preset: 'graphite', tokens: { fade: '600ms' } } } },
        } as any);
        expect(rendered.view.style.getPropertyValue('--plurid-dock-fade')).toBe('');
        const css = [...rendered.container.querySelectorAll('style')].map((style) => style.textContent).join('\n');
        expect(css).toContain('--plurid-fade: 600ms');
        await rendered.unmount();

        const configured = await renderPlurid({
            planes: [{ route: '/a', component: Page }],
            view: ['/a'],
            configuration: { space: { docking: { fade: 90 } } },
        } as any);
        expect(configured.view.style.getPropertyValue('--plurid-dock-fade')).toBe('');
        const configuredCss = [...configured.container.querySelectorAll('style')].map((style) => style.textContent).join('\n');
        expect(configuredCss).toContain('--plurid-fade: 90ms');
        await configured.unmount();
    });
});
