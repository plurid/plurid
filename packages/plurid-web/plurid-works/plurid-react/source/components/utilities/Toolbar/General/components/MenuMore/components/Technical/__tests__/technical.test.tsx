/**
 * @jest-environment jsdom
 */
/**
 * THE CULLING DISTANCE THE DRAWER SHOWS IS THE ONE IN FORCE (2026-10-20). The slider ran from 1000
 * to 5000 with a default of 1500, so the default distance (6000) was off its scale, and it kept the
 * value it opened with when the configuration changed under it.
 */
import React, { act } from 'react';

import {
    renderPlurid,
} from '../../../../../../../../../testing';



const Page: React.FC = () => <div>page</div>;
const slider = (container: HTMLElement) => container.querySelector('input[type="range"]') as HTMLInputElement | null;

describe('the Technical drawer', () => {
    it('shows the distance in force, on a scale that holds it, and follows it', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }],
            view: ['/a'],
            configuration: { elements: { toolbar: { drawers: ['TECHNICAL'], toggledDrawers: ['TECHNICAL'] } } },
        } as any);
        const more = rendered.container.querySelector('[data-plurid-control="toolbar-more"]') as HTMLElement;
        await act(async () => {
            more.click();
        });
        const range = slider(rendered.container);
        expect(range).not.toBeNull();
        expect(Number(range!.max)).toBeGreaterThanOrEqual(6000);
        expect(Number(range!.value)).toBe(6000);

        await act(async () => {
            rendered.api.pubsub.publish({ topic: 'configuration', data: { space: { culling: { distance: 8000 } } } } as any);
        });
        expect(Number(slider(rendered.container)!.value)).toBe(8000);
        await rendered.unmount();
    });
});
