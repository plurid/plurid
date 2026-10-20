/**
 * @jest-environment jsdom
 */
/**
 * A VIEWCUBE FACE IS A WHOLE POSE (2026-10-20): its pitch, its yaw and a level horizon. The face
 * wrote the two angles only, and a camera tilted with `roll` stayed tilted on the face it went to.
 */
import React, { act } from 'react';

import {
    renderPlurid,
    installFrameClock,
} from '../../../../testing';



const Page: React.FC = () => <div>page</div>;

describe('a viewcube face', () => {
    it('levels the horizon', async () => {
        const clock = installFrameClock();
        try {
            const rendered = await renderPlurid({
                planes: [{ route: '/a', component: Page }],
                view: ['/a'],
                configuration: { elements: { viewcube: { show: true } } },
            } as any);
            await act(async () => {
                rendered.handle.camera.moveBy({ absolute: { roll: 30 } });
            });
            expect(rendered.handle.camera.get().roll).toBe(30);

            const zone = rendered.container.querySelector('[data-plurid-control="viewcube"] button[aria-label$="middleCenter"]') as HTMLElement;
            expect(zone).not.toBeNull();
            await act(async () => {
                zone.click();
            });
            for (let frame = 0; frame < 120; frame += 1) {
                await act(async () => {
                    clock.advance(1000 / 60);
                });
            }
            expect(rendered.handle.camera.get().roll).toBeCloseTo(0, 6);
            await rendered.unmount();
        } finally {
            clock.restore();
        }
    });
});
