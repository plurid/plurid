/**
 * @jest-environment jsdom
 */
/**
 * A PAGE IS DOCKED FACE-ON WHATEVER ITS TILT (2026-10-20). The engine's dock pose lifts the orbit's
 * pitch limit for a page pitched past it (a host's tree can lay a page on the floor), and the store's
 * commit clamped the pose back to the limit: the camera stopped at 89°, and the page never read as
 * docked. A pan of the docked page keeps it docked.
 */
import React, { act } from 'react';

import {
    renderPlurid,
    installFrameClock,
} from '../../../../../testing';



const Page: React.FC = () => <div>page</div>;

describe('a page pitched past the orbit\'s limit', () => {
    it('docks, by a jump or a swing, and stays docked through a pan', async () => {
        const clock = installFrameClock();
        try {
            const rendered = await renderPlurid({
                planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }],
                view: ['/a', '/b'],
                configuration: { space: { navigation: { motion: { duration: 0 } } } },
            } as any);
            const tree = rendered.handle.tree.get();
            const tilted = tree.map((node: any, index: number) => (index === 1
                ? { ...node, manuallyPositioned: true, location: { ...node.location, rotateX: 120 } }
                : node));
            await act(async () => {
                rendered.handle.tree.set(tilted as any);
            });
            const page = tilted[1].planeID;

            await act(async () => {
                rendered.handle.camera.dock(page, { animate: false });
            });
            expect(rendered.handle.camera.get().pitch).toBeCloseTo(-120, 6);
            expect(rendered.handle.camera.docked()).toBe(page);

            await act(async () => {
                rendered.handle.camera.moveBy({ pan: { x: 0, y: 0 } });
            });
            expect(rendered.handle.camera.get().pitch).toBeCloseTo(-120, 6);

            await act(async () => {
                rendered.handle.camera.dock(tilted[0].planeID, { animate: false });
            });
            await act(async () => {
                rendered.handle.camera.dock(page, { animate: true, duration: 300 });
            });
            for (let frame = 0; frame < 40; frame += 1) {
                await act(async () => {
                    clock.advance(1000 / 60);
                });
            }
            expect(rendered.handle.camera.docked()).toBe(page);
            await rendered.unmount();
        } finally {
            clock.restore();
        }
    });
});
