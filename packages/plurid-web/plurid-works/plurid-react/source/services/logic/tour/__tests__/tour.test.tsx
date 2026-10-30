/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, {
        act,
    } from 'react';

    import type {
        PluridTour,
        PluridTourStep,
        PluridTourEnd,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        resolveAnchor,
        sameCamera,
    } from '~services/logic/camera';
    import type {
        AppState,
    } from '~services/state/store';

    import {
        renderPlurid,
        gestures,
        flushFrames,
        installFrameClock,
    } from '../../../../testing';
    import type {
        RenderedPlurid,
    } from '../../../../testing';
    // #endregion external
// #endregion imports



// #region module
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const planes = [
    { route: '/one', component: () => <div style={{ height: 200 }}>one</div> },
    { route: '/two', component: () => <div style={{ height: 200 }}>two <input data-testid="field" /></div> },
    { route: '/three', component: () => <div style={{ height: 200 }}>three</div> },
];

const step = (
    id: string,
    path: string,
    more: Partial<PluridTourStep> = {},
): PluridTourStep => ({ id, anchor: { path }, dwell: null, ...more });

const tourOf = (
    ...steps: PluridTourStep[]
): PluridTour => ({ plurid: 'plurid/tour', version: 1, steps });

const render = (
    motion: Record<string, unknown> = { duration: 160 },
) => renderPlurid({
    planes,
    view: ['/one', '/two', '/three'],
    configuration: { space: { navigation: { motion }, gestures: { disableMomentum: true } } } as any,
});

const stateOf = (
    rendered: RenderedPlurid,
) => rendered.api.getSnapshot() as unknown as AppState;

/** Whether the camera draws what `path`'s stop resolves to now. */
const atStop = (
    rendered: RenderedPlurid,
    path: string,
) => {
    const resolution = resolveAnchor(stateOf(rendered), { path });
    return resolution.ok && sameCamera(stateOf(rendered).space.camera, resolution.camera);
};

const keydown = async (
    target: Element,
    key: string,
) => {
    await act(async () => {
        target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key, code: key }));
    });
};

/** The reduced-motion query, answered as asked, as a browser answers the reader's setting. */
const preferReducedMotion = (
    matches: boolean,
) => {
    Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: (query: string) => ({
            matches: matches && query.includes('reduce'),
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }),
    });
};


describe('tours in an application', () => {
    afterEach(() => {
        installFrameClock().restore();
        preferReducedMotion(false);
    });

    it('plays through the View\'s motion controller: a tween to each stop, an arrival at its landing', async () => {
        installFrameClock();
        const rendered = await render();
        const events: string[] = [];
        rendered.handle.tour.subscribe((event) => events.push(event.type + '@' + event.index));
        let ended: PluridTourEnd | undefined;

        await act(async () => {
            void rendered.handle.tour.play(tourOf(step('two', '/two'), step('three', '/three'))).then((end) => {
                ended = end;
            });
        });
        expect(rendered.handle.tour.state().status).toBe('travelling');
        expect(stateOf(rendered).space.motion).toBe('tween');
        await flushFrames(14, 16);
        expect(rendered.handle.tour.state().status).toBe('dwelling');
        expect(atStop(rendered, '/two')).toBe(true);

        await act(async () => {
            rendered.handle.tour.next();
        });
        await flushFrames(14, 16);
        expect(atStop(rendered, '/three')).toBe(true);
        await act(async () => {
            rendered.handle.tour.next();
        });
        expect(ended).toMatchObject({ reason: 'complete' });
        expect(events).toEqual(['travel@0', 'arrive@0', 'travel@1', 'arrive@1', 'end@1']);
        await rendered.unmount();
    });

    it('INPUT PAUSES IT, NEVER DESTROYS IT: a drag, a wheel, a key; resume travels back to the stop', async () => {
        installFrameClock();
        const rendered = await render();
        const tour = rendered.handle.tour;
        await act(async () => {
            void tour.play(tourOf(step('two', '/two'), step('three', '/three')));
        });
        expect(tour.state().status).toBe('travelling');

        // a drag mid-travel: paused where it is
        await gestures.drag(rendered.view, { x: 60, y: 700 }, { x: 160, y: 700 }, { steps: 3 });
        expect(tour.state()).toMatchObject({ status: 'paused', paused: 'input', index: 0 });

        await act(async () => {
            tour.resume();
        });
        await flushFrames(14, 16);
        expect(tour.state().status).toBe('dwelling');
        expect(atStop(rendered, '/two')).toBe(true);

        // a wheel at the stop: paused, and the camera moved with the wheel
        await gestures.wheel(rendered.view, { deltaY: -120, x: 500, y: 300 });
        await flushFrames(6, 16);
        expect(tour.state()).toMatchObject({ status: 'paused', paused: 'input' });
        expect(atStop(rendered, '/two')).toBe(false);
        // resume resolves the stop again: the camera left it, so the tour travels back
        await act(async () => {
            tour.resume();
        });
        expect(tour.state().status).toBe('travelling');
        await flushFrames(14, 16);
        expect(atStop(rendered, '/two')).toBe(true);

        // a key on the view pauses; a modifier alone and a field the reader types into do not
        await keydown(rendered.view, 'Shift');
        expect(tour.state().status).toBe('dwelling');
        const field = rendered.container.querySelector('[data-testid="field"]') as HTMLElement;
        await keydown(field, 'a');
        await act(async () => {
            field.dispatchEvent(new (window as any).PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, buttons: 1, pointerId: 3 }));
        });
        expect(tour.state().status).toBe('dwelling');
        await keydown(rendered.view, 'F9');
        expect(tour.state()).toMatchObject({ status: 'paused', paused: 'input' });

        // next goes on from a pause
        await act(async () => {
            tour.next();
        });
        await flushFrames(14, 16);
        expect(tour.state()).toMatchObject({ status: 'dwelling', index: 1 });
        await rendered.unmount();
    });

    it('`pauseOnInput: false` goes on through a press on content and a key; a drag that takes the camera pauses it, on the way and at a stop', async () => {
        installFrameClock();
        const rendered = await render();
        const tour = rendered.handle.tour;
        await act(async () => {
            void tour.play(tourOf(step('two', '/two', { dwell: 400 }), step('three', '/three')), { pauseOnInput: false });
        });
        // reading: a press on the content leaves the camera where the tour has it, on the way
        const content = rendered.container.querySelector('[data-plurid-entity="PluridPlaneContent"]') as HTMLElement;
        const press = async () => {
            await act(async () => {
                content.dispatchEvent(new (window as any).PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, buttons: 1, pointerId: 4 }));
                content.dispatchEvent(new (window as any).PointerEvent('pointerup', { bubbles: true, cancelable: true, button: 0, buttons: 0, pointerId: 4 }));
            });
        };
        await press();
        expect(tour.state().status).toBe('travelling');
        await flushFrames(14, 16);
        expect(tour.state().status).toBe('dwelling');
        // and a press or a key at the stop
        await press();
        await keydown(rendered.view, 'F9');
        expect(tour.state().status).toBe('dwelling');

        // at the stop, a drag takes the camera: no tween runs to be interrupted, the camera leaving
        // the stop pauses the tour, and the dwell does not take the camera back
        await gestures.drag(rendered.view, { x: 60, y: 700 }, { x: 260, y: 700 }, { steps: 3 });
        expect(tour.state()).toMatchObject({ status: 'paused', paused: 'interrupted', index: 0 });
        const dragged = stateOf(rendered).space.camera;
        await flushFrames(40, 16);
        expect(tour.state()).toMatchObject({ status: 'paused', index: 0 });
        expect(stateOf(rendered).space.camera).toBe(dragged);

        // on the way, the drag stops the exclusive tween: interrupted too
        await act(async () => {
            tour.next();
        });
        expect(tour.state().status).toBe('travelling');
        await gestures.drag(rendered.view, { x: 60, y: 700 }, { x: 160, y: 700 }, { steps: 3 });
        expect(tour.state()).toMatchObject({ status: 'paused', paused: 'interrupted', index: 1 });
        await rendered.unmount();
    });

    it('A LONE MODIFIER IS NO INPUT: Shift during a travel neither stops the camera nor pauses the tour', async () => {
        installFrameClock();
        const rendered = await render();
        const tour = rendered.handle.tour;
        await act(async () => {
            void tour.play(tourOf(step('two', '/two'), step('three', '/three')));
        });
        await flushFrames(2, 16);
        for (const key of ['Shift', 'Control', 'Alt', 'Meta']) {
            await keydown(rendered.view, key);
        }
        expect(tour.state().status).toBe('travelling');
        expect(stateOf(rendered).space.motion).toBe('tween');
        await flushFrames(14, 16);
        expect(tour.state().status).toBe('dwelling');
        expect(atStop(rendered, '/two')).toBe(true);
        await rendered.unmount();
    });

    it('A STOP JOINING A HOST\'S FRAME, in the View: the host is told it landed, and the tour arrives', async () => {
        installFrameClock();
        const rendered = await render();
        const two = stateOf(rendered).space.tree[1].planeID;
        const told: string[] = [];
        rendered.handle.tour.subscribe((event) => told.push('tour ' + event.type));
        await act(async () => {
            rendered.handle.camera.frame({ planeID: two }, { onSettle: () => told.push('host landed') });
        });
        await flushFrames(2, 16);
        await act(async () => {
            void rendered.handle.tour.play(tourOf(step('two', '/two', { anchor: { path: '/two', pose: 'frame' } })));
        });
        await flushFrames(14, 16);
        expect(told).toEqual(['tour travel', 'host landed', 'tour arrive']);
        expect(rendered.handle.tour.state().status).toBe('dwelling');

        // a host's tween the tour replaces: its settle rides the tour's travel, told when it lands
        await act(async () => {
            rendered.handle.camera.frame({ planeID: stateOf(rendered).space.tree[0].planeID }, { onSettle: () => told.push('host 2 landed') });
        });
        // the host's frame takes the camera off the stop from its first frame: the dwell pauses
        await flushFrames(2, 16);
        expect(rendered.handle.tour.state()).toMatchObject({ status: 'paused', paused: 'interrupted' });
        await act(async () => {
            void rendered.handle.tour.play(tourOf(step('three', '/three')));
        });
        await flushFrames(14, 16);
        expect(told.slice(-3)).toEqual(['tour travel', 'host 2 landed', 'tour arrive']);
        expect(atStop(rendered, '/three')).toBe(true);
        await rendered.unmount();
    });

    it('REDUCED MOTION: the travel is one jump, and the arrival comes with it', async () => {
        preferReducedMotion(true);
        installFrameClock();
        const rendered = await render();
        expect(rendered.handle.camera.reducedMotion()).toBe(true);
        const events: string[] = [];
        rendered.handle.tour.subscribe((event) => events.push(event.type));
        await act(async () => {
            void rendered.handle.tour.play(tourOf(step('three', '/three')));
        });
        expect(events).toEqual(['travel', 'arrive']);
        expect(rendered.handle.tour.state().status).toBe('dwelling');
        expect(atStop(rendered, '/three')).toBe(true);
        expect(stateOf(rendered).space.motion).toBe('idle');
        await rendered.unmount();
    });

    it('the camera topics carry their motion: `duration` and `easing` reach the tween; a jump\'s motion is no part of its delta', async () => {
        installFrameClock();
        const rendered = await render({ duration: 600 });
        const three = stateOf(rendered).space.tree[2].planeID;
        await act(async () => {
            rendered.api.pubsub.publish({ topic: 'space.frame', data: { planeID: three, duration: 64, easing: 'linear' } });
        });
        expect(stateOf(rendered).space.motion).toBe('tween');
        await flushFrames(6, 16);
        expect(stateOf(rendered).space.motion).toBe('idle');
        expect(atStop(rendered, '/three')).toBe(true);

        const yaw = stateOf(rendered).space.camera.yaw;
        await act(async () => {
            rendered.api.pubsub.publish({ topic: 'space.cameraDelta', data: { yaw: 30, animate: true, duration: 48 } });
        });
        await flushFrames(5, 16);
        expect(stateOf(rendered).space.motion).toBe('idle');
        expect(stateOf(rendered).space.camera.yaw).toBeCloseTo(yaw + 30, 6);

        await act(async () => {
            rendered.api.pubsub.publish({ topic: 'space.cameraDelta', data: { yaw: 10, duration: 500, easing: 'linear' } });
        });
        expect(stateOf(rendered).space.motion).toBe('idle');
        expect(stateOf(rendered).space.camera.yaw).toBeCloseTo(yaw + 40, 6);
        expect(Object.values(stateOf(rendered).space.camera).every((value) => typeof value !== 'number' || Number.isFinite(value))).toBe(true);

        // the topic's own default is still the configuration's: 64 ms in, a 600 ms home is under way
        await act(async () => {
            rendered.api.pubsub.publish({ topic: 'space.home' });
        });
        await flushFrames(4, 16);
        expect(stateOf(rendered).space.motion).toBe('tween');

        // `animate` is read by its truth, as the topics always read it: `0` jumps
        await act(async () => {
            rendered.api.pubsub.publish({ topic: 'space.fitToView', data: { animate: 0 } as any });
        });
        expect(stateOf(rendered).space.motion).toBe('idle');
        await act(async () => {
            rendered.api.pubsub.publish({ topic: 'space.home', data: { animate: 0 } as any });
        });
        expect(stateOf(rendered).space.motion).toBe('idle');
        await act(async () => {
            rendered.api.pubsub.publish({ topic: 'space.setViewpoint', data: { viewpoint: rendered.api.getViewpoint(), animate: 1 } as any });
        });
        await rendered.unmount();
    });

    it('`space.tour` drives the player from the bus, and every action is answered on `space.changed` kind `tour`', async () => {
        installFrameClock();
        const rendered = await render();
        const heard: any[] = [];
        rendered.api.pubsub.subscribe({
            topic: 'space.changed',
            callback: (data: any) => {
                if (data.kind === 'tour') {
                    heard.push(data);
                }
            },
        } as any);
        await act(async () => {
            rendered.api.pubsub.publish({ topic: 'space.tour', data: { action: 'play', tour: tourOf(step('two', '/two'), step('three', '/three')) } });
        });
        expect(heard[0]).toMatchObject({ application: 'default', value: { event: { type: 'travel', index: 0 }, state: { status: 'travelling' } } });
        await act(async () => {
            rendered.api.pubsub.publish({ topic: 'space.tour', data: { action: 'seek', step: 'three' } });
            rendered.api.pubsub.publish({ topic: 'space.tour', data: { action: 'state' } });
        });
        expect(heard[heard.length - 1].value).toEqual({ state: expect.objectContaining({ index: 1, stepID: 'three', status: 'travelling' }) });
        await act(async () => {
            rendered.api.pubsub.publish({ topic: 'space.tour', data: { action: 'stop' } });
        });
        expect(rendered.handle.tour.state()).toMatchObject({ status: 'ended', ended: 'stopped' });
        await rendered.unmount();
    });

    it('the handle\'s camera: an anchored move answers where it went, a cancel interrupts, the rest is awaited', async () => {
        installFrameClock();
        const rendered = await render();
        expect(rendered.handle.camera.reducedMotion()).toBe(false);
        expect(rendered.handle.camera.anchor({ path: '/nowhere' })).toEqual({ ok: false, reason: 'absent' });
        expect(stateOf(rendered).space.motion).toBe('idle');

        let resolution: ReturnType<typeof rendered.handle.camera.anchor> | undefined;
        await act(async () => {
            resolution = rendered.handle.camera.anchor({ path: '/two', pose: 'dock' }, { duration: 96 });
        });
        expect(resolution?.ok).toBe(true);
        let rested: boolean | undefined;
        void rendered.handle.whenAtRest().then((value) => {
            rested = value;
        });
        await flushFrames(12, 16);
        expect(rested).toBe(true);
        expect(resolution?.ok && sameCamera(stateOf(rendered).space.camera, resolution.camera)).toBe(true);

        await act(async () => {
            void rendered.handle.tour.play(tourOf(step('three', '/three')));
        });
        await act(async () => {
            rendered.handle.camera.cancel();
        });
        expect(rendered.handle.tour.state()).toMatchObject({ status: 'paused', paused: 'interrupted' });
        await rendered.unmount();
    });

    it('records where the reader comes to rest, and the recorded tour plays back there', async () => {
        installFrameClock();
        const rendered = await render();
        const recorder = rendered.handle.tour.record();
        await act(async () => {
            rendered.handle.camera.frame({ planeID: stateOf(rendered).space.tree[1].planeID }, { animate: false });
            rendered.handle.camera.moveBy({ yaw: 22, pitch: -8 });
        });
        await flushFrames(5, 16);
        expect(recorder.steps()).toHaveLength(1);
        const recordedCamera = stateOf(rendered).space.camera;
        const tour = recorder.stop();

        await act(async () => {
            rendered.handle.camera.reset({ animate: false });
        });
        await act(async () => {
            void rendered.handle.tour.play(tour);
        });
        await flushFrames(14, 16);
        expect(rendered.handle.tour.state().status).toBe('dwelling');
        expect(sameCamera(stateOf(rendered).space.camera, recordedCamera)).toBe(true);
        await rendered.unmount();
    });

    it('a tour does not outlive its application', async () => {
        installFrameClock();
        const rendered = await render();
        let ended: PluridTourEnd | undefined;
        await act(async () => {
            void rendered.handle.tour.play(tourOf(step('two', '/two'))).then((end) => {
                ended = end;
            });
        });
        await rendered.unmount();
        await act(async () => {});
        expect(ended).toMatchObject({ reason: 'stopped' });
    });
});
// #endregion module
