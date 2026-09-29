/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, { act } from 'react';

    import PluridPubSub from '@plurid/plurid-pubsub';

    import {
        PLURID_PUBSUB_TOPIC,
        PluridPubSub as IPluridPubSub,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
        RenderedPlurid,
        installFrameClock,
    } from '../../../../../testing';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE BUS UNDER PRESSURE (2026-09-29). What a host (or an agent) does that the per-topic tests did
 * not: two commands in one tick, a command while a tween runs, a command without its payload, a
 * token for a plane that will never come, a plane that is removed while it is isolated.
 */
const Page = () => <div>page</div>;

const render = async (
    routes = ['/a', '/b', '/c'],
    configuration: any = {},
    extra: Record<string, unknown> = {},
): Promise<RenderedPlurid & { bus: IPluridPubSub; changed: { kind: string; value: any }[] }> => {
    const bus = new PluridPubSub({ onDrop: null });
    const changed: { kind: string; value: any }[] = [];
    bus.subscribe({
        topic: PLURID_PUBSUB_TOPIC.CHANGED,
        callback: (data: any) => {
            changed.push(data);
        },
    } as any);
    const rendered = await renderPlurid({
        planes: routes.map((route) => ({ route, component: Page })),
        view: routes,
        pubsub: bus,
        configuration: {
            ...configuration,
            space: {
                navigation: { motion: { duration: 0 } },
                ...configuration.space,
            },
        },
        ...extra,
    } as any);
    return { ...rendered, bus, changed };
};

const publish = async (
    bus: IPluridPubSub,
    topic: string,
    data?: unknown,
) => {
    await act(async () => {
        bus.publish({ topic, data } as any);
    });
};

const space = (rendered: RenderedPlurid) => rendered.api.getSnapshot().space;
const rootIDs = (rendered: RenderedPlurid) => space(rendered).tree.map((plane: any) => plane.planeID);


describe('the bus reads the store, not the last render', () => {
    it('two view.addPlane in one tick keep both planes', async () => {
        const rendered = await render(['/a', '/b', '/c'], {}, { view: ['/a'] });
        await act(async () => {
            rendered.bus.publish({ topic: PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE, data: { planeID: '/b' } } as any);
            rendered.bus.publish({ topic: PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE, data: { planeID: '/c' } } as any);
        });
        expect(space(rendered).view).toEqual(['/a', '/b', '/c']);
        expect(space(rendered).tree.map((plane: any) => plane.route.replace(/^.*\/\/[^/]*/, ''))).toEqual(['/a', '/b', '/c']);
        await rendered.unmount();
    });

    it('a command after a selection in the same tick sees the selection', async () => {
        const rendered = await render();
        const [a, b] = rootIDs(rendered);
        await act(async () => {
            rendered.bus.publish({ topic: PLURID_PUBSUB_TOPIC.SET_SELECTION, data: { planeIDs: [a, b] } } as any);
            rendered.bus.publish({ topic: PLURID_PUBSUB_TOPIC.SPACE_COMMAND, data: { id: 'clearSelection' } } as any);
        });
        expect(space(rendered).selectedPlaneIDs).toEqual([]);
        const report = rendered.changed.find((change) => change.kind === 'command');
        expect(report?.value).toMatchObject({ id: 'clearSelection', ran: true });
        await rendered.unmount();
    });
});


describe('a camera jump stops a running tween', () => {
    it('space.rotateYWith during a tween is not overwritten by the tween\'s next frame', async () => {
        const clock = installFrameClock();
        try {
            const rendered = await render(['/a', '/b', '/c'], { space: { navigation: { motion: { duration: 600 } } } });
            await publish(rendered.bus, PLURID_PUBSUB_TOPIC.SPACE_CAMERA_DELTA, { yaw: 40, animate: true });
            await act(async () => {
                clock.advance(16);
            });
            expect(space(rendered).motion).toBe('tween');
            const before = space(rendered).camera.yaw;

            await publish(rendered.bus, PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_WITH, { value: -10 });
            expect(space(rendered).motion).toBe('idle');
            const jumped = space(rendered).camera.yaw;
            expect(jumped).not.toBeCloseTo(before, 3);

            await act(async () => {
                for (let frame = 0; frame < 60; frame += 1) {
                    clock.advance(16);
                }
            });
            expect(space(rendered).camera.yaw).toBeCloseTo(jumped, 6);
            await rendered.unmount();
        } finally {
            clock.restore();
        }
    });
});


describe('a command without its payload does nothing, and says so', () => {
    it('the legacy camera topics, the root navigation and the transform take no payload without breaking', async () => {
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
        const warnings = jest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const rendered = await render();
            const camera = space(rendered).camera;
            for (const topic of [
                PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH,
                PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_TO,
                PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_WITH,
                PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_TO,
                PLURID_PUBSUB_TOPIC.SPACE_TRANSFORM,
                PLURID_PUBSUB_TOPIC.NAVIGATE_TO_ROOT,
                PLURID_PUBSUB_TOPIC.NAVIGATE_TO_PLANE,
                PLURID_PUBSUB_TOPIC.REFRESH_PLANE,
                PLURID_PUBSUB_TOPIC.SPACE_SPAWN_PLANE,
            ]) {
                await publish(rendered.bus, topic);
            }
            await publish(rendered.bus, PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH, { value: Number.NaN });
            expect(space(rendered).camera).toEqual(camera);
            // no subscriber threw (the bus reports a throw with console.error in development)
            expect(errors).not.toHaveBeenCalled();
            expect(warnings.mock.calls.map((call) => String(call[0])).some((message) => message.includes('space.rotateXWith'))).toBe(true);
            await rendered.unmount();
        } finally {
            errors.mockRestore();
            warnings.mockRestore();
        }
    });
});


describe('the view takes its typed entries', () => {
    it('view.setPlanes takes { plane } and refuses { route }', async () => {
        const warnings = jest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const rendered = await render();
            await publish(rendered.bus, PLURID_PUBSUB_TOPIC.VIEW_SET_PLANES, { view: [{ plane: '/b' }, '/c'] });
            expect(space(rendered).tree).toHaveLength(2);

            await publish(rendered.bus, PLURID_PUBSUB_TOPIC.VIEW_SET_PLANES, { view: [{ route: '/a' }] });
            expect(space(rendered).tree).toHaveLength(2);
            expect(warnings.mock.calls.map((call) => String(call[0])).join('\n')).toContain('{ plane: route }');

            // and view.removePlane finds a `{ plane }` entry
            await publish(rendered.bus, PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE, { planeID: '/b' });
            expect(space(rendered).view).toEqual(['/c']);
            await rendered.unmount();
        } finally {
            warnings.mockRestore();
        }
    });
});


describe('every token is answered', () => {
    it('refused: a route nothing is registered at, a parent that is not there', async () => {
        const warnings = jest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const rendered = await render();
            const [a] = rootIDs(rendered);
            await publish(rendered.bus, PLURID_PUBSUB_TOPIC.SPACE_SPAWN_PLANE, { route: '/nowhere', parentPlaneID: a, token: 't1' });
            await publish(rendered.bus, PLURID_PUBSUB_TOPIC.SPACE_SPAWN_PLANE, { route: '/b', parentPlaneID: 'no-such-plane', token: 't2' });
            await publish(rendered.bus, PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE, { planeID: '/nowhere', token: 't3' });
            const refused = rendered.changed.filter((change) => change.kind === 'refused').map((change) => change.value);
            expect(refused).toEqual([
                { token: 't1', route: '/nowhere', reason: 'unregistered' },
                { token: 't2', route: '/b', reason: 'noParent' },
                { token: 't3', route: '/nowhere', reason: 'unregistered' },
            ]);
            await rendered.unmount();
        } finally {
            warnings.mockRestore();
        }
    });

    it('a spawn of a route already open is answered at once, with the plane that is there', async () => {
        const rendered = await render();
        const [a] = rootIDs(rendered);
        await publish(rendered.bus, PLURID_PUBSUB_TOPIC.SPACE_SPAWN_PLANE, { route: '/b', parentPlaneID: a, token: 'first' });
        const first = rendered.changed.find((change) => change.kind === 'plane' && change.value.token === 'first');
        expect(first?.value.planeID).toBeTruthy();

        await publish(rendered.bus, PLURID_PUBSUB_TOPIC.SPACE_SPAWN_PLANE, { route: '/b', parentPlaneID: a, token: 'again' });
        const again = rendered.changed.find((change) => change.kind === 'plane' && change.value.token === 'again');
        expect(again?.value).toMatchObject({ planeID: first!.value.planeID, parentPlaneID: a });
        // one child, not two
        expect(space(rendered).tree.find((plane: any) => plane.planeID === a)?.children).toHaveLength(1);
        await rendered.unmount();
    });
});


describe('a plane that is gone is forgotten', () => {
    it('removing an isolated, selected, active plane lifts the isolation and drops it from the selection', async () => {
        const rendered = await render();
        const [, b, c] = rootIDs(rendered);
        await publish(rendered.bus, PLURID_PUBSUB_TOPIC.ISOLATE_PLANE, { planeID: b });
        await publish(rendered.bus, PLURID_PUBSUB_TOPIC.SET_SELECTION, { planeIDs: [b, c] });
        expect(space(rendered).isolatePlane).toBe(b);

        await publish(rendered.bus, PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE, { planeID: '/b' });
        expect(rootIDs(rendered)).not.toContain(b);
        expect(space(rendered).isolatePlane).toBe('');
        expect(space(rendered).selectedPlaneIDs).toEqual([c]);
        await rendered.unmount();
    });
});


describe('the configuration relays the roots only when where they go changes', () => {
    it('a look-only publish keeps a plane where the reader moved it; a layout publish relays once', async () => {
        const rendered = await render();
        const [a] = rootIDs(rendered);
        await publish(rendered.bus, PLURID_PUBSUB_TOPIC.SPACE_MOVE_PLANES, { planeIDs: [a], deltaX: 120, deltaY: 0 });
        const moved = space(rendered).tree[0].location.translateX;

        await publish(rendered.bus, PLURID_PUBSUB_TOPIC.CONFIGURATION, { global: { look: 'noir' } });
        expect(space(rendered).tree[0].location.translateX).toBe(moved);

        const trees: unknown[] = [];
        let previous = space(rendered).tree;
        const stop = rendered.api.store.subscribe(() => {
            const tree = space(rendered).tree;
            if (tree !== previous) {
                trees.push(tree);
                previous = tree;
            }
        });
        await publish(rendered.bus, PLURID_PUBSUB_TOPIC.CONFIGURATION, { space: { layout: { type: 'ROWS', rows: 1 } } });
        stop();
        expect(trees).toHaveLength(1);
        await rendered.unmount();
    });
});


describe('the space says when it has booted', () => {
    it('loading is false once the first layout is resolved', async () => {
        const rendered = await render();
        expect(space(rendered).loading).toBe(false);
        expect(rendered.changed.some((change) => change.kind === 'loading' && change.value === false)).toBe(true);
        await rendered.unmount();
    });
});
// #endregion module
