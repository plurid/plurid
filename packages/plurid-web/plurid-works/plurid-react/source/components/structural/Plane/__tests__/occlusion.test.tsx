/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, {
        act,
    } from 'react';

    import type {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
        flushFrames,
        installFrameClock,
    } from '../../../../testing';
    import type {
        RenderedPlurid,
    } from '../../../../testing';
    // #endregion external
// #endregion imports



// #region module
/**
 * OCCLUDED PLANES FADE, through the real application: the user's case, a parent with a 2 × 2 grid
 * of planes in front of it, the camera framing the parent.
 */
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const Page = () => <div style={{ height: 100 }}>page</div>;
const routes = ['/parent', '/c1', '/c2', '/c3', '/c4'];
const planes = routes.map((route) => ({ route, component: Page }));

const PLACES: Record<string, { x: number; y: number; z: number; width: number; height: number }> = {
    '/parent': { x: 200, y: 50, z: 0, width: 600, height: 500 },
    '/c1': { x: 160, y: 0, z: 260, width: 340, height: 280 },
    '/c2': { x: 520, y: 0, z: 260, width: 340, height: 280 },
    '/c3': { x: 160, y: 300, z: 260, width: 340, height: 280 },
    '/c4': { x: 520, y: 300, z: 260, width: 340, height: 280 },
};

const quiet = () => act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 220));
});

const render = async (
    configuration: Record<string, unknown> = {},
): Promise<RenderedPlurid & { ids: Record<string, string> }> => {
    const rendered = await renderPlurid({
        planes,
        view: routes,
        configuration: { space: { navigation: { motion: { duration: 0 } }, ...configuration } } as any,
    });
    await flushFrames(2);
    // the planes where the host wants them: free roots, by hand, each its own size
    const tree = rendered.handle.tree.get().map((plane): TreePlane => {
        const route = routes.find((candidate) => plane.route.endsWith(candidate))!;
        const place = PLACES[route];
        return {
            ...plane,
            location: { translateX: place.x, translateY: place.y, translateZ: place.z, rotateX: 0, rotateY: 0 },
            manuallyPositioned: true,
            free: true,
            sizeMode: 'manual',
            width: place.width,
            height: place.height,
        };
    });
    await act(async () => {
        rendered.handle.tree.set(tree);
    });
    await flushFrames(2);
    const ids: Record<string, string> = {};
    for (const plane of rendered.handle.tree.get()) {
        ids[routes.find((candidate) => plane.route.endsWith(candidate))!.slice(1)] = plane.planeID;
    }
    return { ...rendered, ids };
};

const element = (
    rendered: RenderedPlurid,
    planeID: string,
) => rendered.container.querySelector(`[data-plurid-plane="${planeID}"]`) as HTMLElement;

const faded = (
    rendered: RenderedPlurid,
) => rendered.handle.planes.occluded().planeIDs;


describe('occluded planes fade', () => {
    it('THE USER\'S CASE: framing the parent fades the four planes in front of it, and the pointer goes through them', async () => {
        const rendered = await render();
        const { handle, ids } = rendered;
        const heard: unknown[] = [];
        rendered.api.pubsub.subscribe({
            topic: 'space.changed',
            callback: (data: any) => {
                if (data?.kind === 'occluded') {
                    heard.push(data.value);
                }
            },
        } as any);
        await act(async () => {
            handle.camera.frame({ planeID: ids.parent }, { animate: false });
        });
        await quiet();
        expect([...faded(rendered)].sort()).toEqual([ids.c1, ids.c2, ids.c3, ids.c4].sort());
        expect(handle.planes.occluded().target).toBe(ids.parent);
        for (const id of [ids.c1, ids.c2, ids.c3, ids.c4]) {
            expect(element(rendered, id).getAttribute('data-plurid-occluding')).toBe('true');
            expect(element(rendered, id).style.opacity).toBe('0.1');
            expect(element(rendered, id).style.pointerEvents).toBe('none');
        }
        expect(element(rendered, ids.parent).getAttribute('data-plurid-occluding')).toBeNull();
        expect(heard.at(-1)).toEqual({ target: ids.parent, planeIDs: faded(rendered) });
        await rendered.unmount();
    });

    it('THEY COME BACK THE MOMENT THE CAMERA MOVES, fade again at its rest, and go when the target changes', async () => {
        const rendered = await render();
        const { handle, ids } = rendered;
        await act(async () => {
            handle.camera.frame({ planeID: ids.parent }, { animate: false });
        });
        await quiet();
        expect(faded(rendered)).toHaveLength(4);

        await act(async () => {
            handle.camera.moveBy({ yaw: 3 });
        });
        expect(faded(rendered)).toEqual([]);
        expect(element(rendered, ids.c1).getAttribute('data-plurid-occluding')).toBeNull();
        await quiet();
        expect(faded(rendered)).toHaveLength(4);

        await act(async () => {
            handle.camera.frame({ planeID: ids.c1 }, { animate: false });
        });
        await quiet();
        expect(handle.planes.occluded()).toEqual({ target: ids.c1, planeIDs: [] });
        await rendered.unmount();
    });

    it('NOTHING FADES DURING TRAVEL: a tween on its way fades nothing; its landing does', async () => {
        const clock = installFrameClock();
        const rendered = await renderPlurid({
            planes,
            view: routes,
            configuration: { space: { navigation: { motion: { duration: 600 } } } } as any,
        });
        await flushFrames(2);
        const tree = rendered.handle.tree.get().map((plane): TreePlane => {
            const route = routes.find((candidate) => plane.route.endsWith(candidate))!;
            const place = PLACES[route];
            return { ...plane, location: { translateX: place.x, translateY: place.y, translateZ: place.z, rotateX: 0, rotateY: 0 }, manuallyPositioned: true, free: true, sizeMode: 'manual', width: place.width, height: place.height };
        });
        await act(async () => {
            rendered.handle.tree.set(tree);
        });
        const parent = rendered.handle.tree.get().find((plane) => plane.route.endsWith('/parent'))!.planeID;
        await flushFrames(2);
        await act(async () => {
            rendered.handle.camera.frame({ planeID: parent }, { animate: true, duration: 600 });
        });
        await flushFrames(3);
        expect(rendered.api.getSnapshot().space.motion).toBe('tween');
        await quiet();
        expect(faded(rendered)).toEqual([]);
        await flushFrames(60);
        expect(rendered.api.getSnapshot().space.motion).toBe('idle');
        await quiet();
        expect(faded(rendered)).toHaveLength(4);
        await rendered.unmount();
        clock.restore();
    });

    it('OPTS OUT: `space.occlusion: \'none\'`, or a move with `occlusion: \'none\'`', async () => {
        const off = await render({ occlusion: 'none' });
        await act(async () => {
            off.handle.camera.frame({ planeID: off.ids.parent }, { animate: false });
        });
        await quiet();
        expect(faded(off)).toEqual([]);
        await off.unmount();

        const once = await render();
        await act(async () => {
            once.handle.camera.frame({ planeID: once.ids.parent }, { animate: false, occlusion: 'none' });
        });
        await quiet();
        expect(faded(once)).toEqual([]);
        await once.unmount();
    });

    it('a pinned plane never fades, and a plane that takes the focus is the one looked at', async () => {
        const rendered = await render();
        const { handle, ids } = rendered;
        await act(async () => {
            handle.planes.pin(ids.c1);
            handle.camera.frame({ planeID: ids.parent }, { animate: false });
        });
        await quiet();
        expect([...faded(rendered)].sort()).toEqual([ids.c2, ids.c3, ids.c4].sort());

        // a focus into the parent's content aims it too (after a fit named nothing)
        await act(async () => {
            handle.camera.fit({ animate: false });
        });
        await quiet();
        expect(handle.planes.occluded().target).toBe('');
        const anchor = rendered.container.querySelector(`[data-plurid-plane-anchor="${ids.parent}"]`) as HTMLElement;
        await act(async () => {
            anchor.focus();
        });
        await quiet();
        expect(handle.planes.occluded().target).toBe(ids.parent);
        await rendered.unmount();
    });
});
// #endregion module
