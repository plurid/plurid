/**
 * @jest-environment jsdom
 */
/**
 * THE HANDLE SAYS WHAT THE BUS SAYS (2026-09-29). `tree.spawn` toggled (a second call put the plane
 * away) and hung the bridge off the parent's corner where `space.spawnPlane` opens and hangs it at
 * the middle; `camera.moveBy` dropped `duration`, `easing` and `onSettle`; `tree.remove` left the
 * selection, the active plane and the isolation pointing at a plane that was gone.
 */
import React, { act } from 'react';

import {
    renderPlurid,
    installFrameClock,
} from '../../../testing';



const Page: React.FC = () => <div>page</div>;
const render = (configuration: any = { space: { navigation: { motion: { duration: 0 } } } }) => renderPlurid({
    planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }],
    view: ['/a'],
    configuration,
} as any);


describe('the imperative handle', () => {
    it('tree.spawn opens (never toggles), from the parent\'s middle, and says which plane', async () => {
        const rendered = await render();
        const [parent] = rendered.api.getSnapshot().space.tree;
        let spawned: string | undefined;
        await act(async () => {
            spawned = rendered.handle.tree.spawn('/b', parent.planeID);
        });
        expect(spawned).toBeTruthy();
        const child = () => rendered.api.getSnapshot().space.tree[0].children?.find((node: any) => node.planeID === spawned);
        expect(child()?.show).not.toBe(false);

        let again: string | undefined;
        await act(async () => {
            again = rendered.handle.tree.spawn('/b', parent.planeID);
        });
        expect(again).toBe(spawned);
        expect(child()?.show).not.toBe(false);

        expect(rendered.handle.tree.spawn('/nowhere', parent.planeID)).toBeUndefined();
        expect(rendered.handle.tree.spawn('/b', 'no-such-parent')).toBeUndefined();
        await rendered.unmount();
    });

    it('tree.remove forgets the plane in the selection, the active plane and the isolation', async () => {
        const rendered = await render();
        const [parent] = rendered.api.getSnapshot().space.tree;
        let child: string | undefined;
        await act(async () => {
            child = rendered.handle.tree.spawn('/b', parent.planeID);
        });
        await act(async () => {
            rendered.handle.selection.set([parent.planeID, child!]);
        });
        await act(async () => {
            rendered.api.store.dispatch({ type: 'space/setSpaceField', payload: { field: 'isolatePlane', value: child } } as any);
        });
        await act(async () => {
            rendered.handle.tree.remove(child!);
        });
        const space = rendered.api.getSnapshot().space;
        expect(space.selectedPlaneIDs).toEqual([parent.planeID]);
        expect(space.isolatePlane).toBe('');
        await rendered.unmount();
    });

    it('camera.moveBy takes the motion options: a jump settles at once, a tween when it lands', async () => {
        const clock = installFrameClock();
        try {
            const rendered = await render({ space: { navigation: { motion: { duration: 300 } } } });
            const jumped = jest.fn();
            await act(async () => {
                rendered.handle.camera.moveBy({ yaw: 10 }, { onSettle: jumped });
            });
            expect(jumped).toHaveBeenCalledTimes(1);
            expect(rendered.api.getSnapshot().space.camera.yaw).toBeCloseTo(10, 6);

            const landed = jest.fn();
            await act(async () => {
                rendered.handle.camera.moveBy({ yaw: 20 }, { animate: true, duration: 120, onSettle: landed });
            });
            expect(rendered.api.getSnapshot().space.motion).toBe('tween');
            expect(landed).not.toHaveBeenCalled();
            await act(async () => {
                for (let frame = 0; frame < 20; frame += 1) {
                    clock.advance(16);
                }
            });
            expect(landed).toHaveBeenCalledTimes(1);
            expect(rendered.api.getSnapshot().space.camera.yaw).toBeCloseTo(30, 4);
            await rendered.unmount();
        } finally {
            clock.restore();
        }
    });

    /*
     * HOSTS REACHED THE ENGINE AROUND THE HANDLE (2026-10-15). Viewer dispatched a synthetic
     * `pagehide` to flush the persisted space (running every other listener on the page), and
     * dispatched `setTree`, `historyBegin` and `historyEnd` on the store directly.
     */
    it('persist.flush writes a pending save at once, without a pagehide', async () => {
        const writes: string[] = [];
        const storageAdapter = {
            getItem: () => null,
            setItem: (key: string) => {
                writes.push(key);
            },
            removeItem: () => {},
        };
        const pagehide = jest.fn();
        window.addEventListener('pagehide', pagehide);
        try {
            const rendered = await renderPlurid({
                planes: [{ route: '/a', component: Page }],
                view: ['/a'],
                useLocalStorage: true,
                storageAdapter,
                configuration: { space: { navigation: { motion: { duration: 0 } } } },
            } as any);
            rendered.handle.persist.flush();
            writes.length = 0;
            await act(async () => {
                rendered.handle.camera.moveBy({ yaw: 5 });
            });
            // The save is debounced: nothing is written until the flush.
            expect(writes).toEqual([]);
            rendered.handle.persist.flush();
            expect(writes.length).toBeGreaterThan(0);
            const written = writes.length;
            rendered.handle.persist.flush();
            expect(writes.length).toBe(written);
            expect(pagehide).not.toHaveBeenCalled();
            await rendered.unmount();
        } finally {
            window.removeEventListener('pagehide', pagehide);
        }
    });

    it('history.transaction undoes several changes as one step, even when its work throws', async () => {
        const rendered = await renderPlurid({
            planes: [
                { route: '/a', component: Page },
                { route: '/b', component: Page },
                { route: '/c', component: Page },
            ],
            view: ['/a'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } },
        } as any);
        const [parent] = rendered.api.getSnapshot().space.tree;
        const shown = () => (rendered.api.getSnapshot().space.tree[0].children ?? [])
            .filter((node: any) => node.show !== false).length;
        await act(async () => {
            rendered.handle.history.transaction(() => {
                rendered.handle.tree.spawn('/b', parent.planeID);
                rendered.handle.tree.spawn('/c', parent.planeID);
            });
        });
        expect(shown()).toBe(2);
        await act(async () => {
            rendered.handle.history.undo();
        });
        expect(shown()).toBe(0);

        await act(async () => {
            expect(() => rendered.handle.history.transaction(() => {
                throw new Error('work failed');
            })).toThrow('work failed');
        });
        await act(async () => {
            rendered.handle.tree.spawn('/b', parent.planeID);
        });
        expect(shown()).toBe(1);
        await act(async () => {
            rendered.handle.history.undo();
        });
        expect(shown()).toBe(0);
        await rendered.unmount();
    });

    it('tree.set replaces the whole tree and is one undoable step', async () => {
        const rendered = await render();
        const before = rendered.api.getSnapshot().space.tree;
        await act(async () => {
            rendered.handle.tree.spawn('/b', before[0].planeID);
        });
        expect(rendered.api.getSnapshot().space.tree[0].children?.length).toBe(1);
        await act(async () => {
            rendered.handle.tree.set(before);
        });
        expect(rendered.api.getSnapshot().space.tree[0].children ?? []).toHaveLength(0);
        await act(async () => {
            rendered.handle.history.undo();
        });
        expect(rendered.api.getSnapshot().space.tree[0].children?.length).toBe(1);
        await rendered.unmount();
    });
});
