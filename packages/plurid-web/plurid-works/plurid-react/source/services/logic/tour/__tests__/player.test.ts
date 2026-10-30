// #region imports
    // #region libraries
    import type {
        PluridTour,
        PluridTourStep,
        PluridTourEvent,
        PluridTourObservation,
        TreePlane,
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        actions,
    } from '~services/state/modules/space';
    import {
        cameraCommand,
        resolveAnchor,
        sameCamera,
    } from '~services/logic/camera';

    import {
        treePlane,
        configurationWith,
    } from '../../../../testing/fixtures';
    import {
        makeSpaceStore,
        motionStub,
    } from '../../../../testing/store';
    import type {
        HeadlessStore,
    } from '../../../../testing/store';
    // #endregion external


    // #region internal
    import {
        createTourPlayer,
    } from '../player';
    // #endregion internal
// #endregion imports



// #region module
const roots = (): TreePlane[] => [
    treePlane('a'),
    treePlane('b', { location: { translateX: 600 } }),
];

/** A space that has booted: its first layout resolved, as the View leaves it. */
const bootedStore = (
    tree: TreePlane[] = roots(),
    configuration: PluridConfiguration = configurationWith({}),
): HeadlessStore => {
    const store = makeSpaceStore(configuration, tree);
    store.dispatch(actions.setSpaceField({ field: 'resolvedLayout', value: true } as any));
    store.dispatch(actions.setSpaceLoading(false));
    return store;
};

/** The player on a store, and what it said: its events, as `type:reason@index`, and the bus's observations. */
const playerOn = (
    store: HeadlessStore,
) => {
    const observations: PluridTourObservation[] = [];
    const player = createTourPlayer({
        getState: store.getState,
        dispatch: store.dispatch,
        subscribe: store.subscribe,
        extra: store.extra,
        observe: (observation) => observations.push(observation),
    });
    const log: string[] = [];
    const states: string[] = [];
    player.subscribe((event: PluridTourEvent, state) => {
        const reason = 'reason' in event ? ':' + event.reason : '';
        log.push(event.type + reason + '@' + event.index);
        states.push(state.status);
    });
    return { player, log, states, observations };
};

const step = (
    id: string,
    path: string,
    more: Partial<PluridTourStep> = {},
): PluridTourStep => ({ id, anchor: { path }, ...more });

const tourOf = (
    ...steps: PluridTourStep[]
): PluridTour => ({ plurid: 'plurid/tour', version: 1, steps });

/** Let the awaits in flight go on (the host's promises, a readiness, a rest). */
const settle = async () => {
    for (let index = 0; index < 6; index += 1) {
        await Promise.resolve();
    }
};


describe('the tour player', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });

    it('sequences the stops: it travels, arrives, dwells, goes on, and the play resolves when it completes', async () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player, log, observations } = playerOn(store);

        const done = player.play(tourOf(step('one', '/a', { dwell: 1000 }), step('two', '/b', { dwell: 500, duration: 700, easing: 'linear' })));
        expect(player.state()).toEqual({ status: 'travelling', tourID: '', index: 0, stepID: 'one', count: 2, planeID: 'a' });
        expect(stub.tweens).toHaveLength(1);
        expect(stub.land()).toBe(true);
        expect(player.state().status).toBe('dwelling');

        jest.advanceTimersByTime(999);
        expect(player.state().index).toBe(0);
        jest.advanceTimersByTime(1);
        expect(player.state()).toMatchObject({ status: 'travelling', index: 1, planeID: 'b' });
        // the step's own timing reaches the motion controller
        expect(stub.tweens[1].options).toMatchObject({ duration: 700, easing: 'linear' });
        stub.land();
        jest.advanceTimersByTime(500);

        await expect(done).resolves.toEqual({ type: 'end', index: 1, reason: 'complete' });
        expect(log).toEqual(['travel@0', 'arrive@0', 'travel@1', 'arrive@1', 'end:complete@1']);
        expect(player.state()).toMatchObject({ status: 'ended', ended: 'complete' });
        // the camera stands where the last stop resolves
        const last = resolveAnchor(store.getState(), { path: '/b' });
        expect(last.ok && sameCamera(store.space().camera, last.camera)).toBe(true);
        // the bus heard every event, with the state after it
        expect(observations.map((observation) => observation.event?.type)).toEqual(['travel', 'arrive', 'travel', 'arrive', 'end']);
        expect(observations[1].state.status).toBe('dwelling');
    });

    it('READINESS FIRST: it waits for the space to boot, then resolves against the space it finds', async () => {
        const store = makeSpaceStore(configurationWith({}), roots());
        const stub = motionStub(store);
        const { player } = playerOn(store);

        void player.play(tourOf(step('one', '/b')));
        expect(player.state().status).toBe('preparing');
        // the plane moves while the space boots: the stop is where the plane is once it has
        store.dispatch(actions.restoreArrangement({ tree: [treePlane('a'), treePlane('b', { location: { translateX: 1500 } })], links: [] }));
        store.dispatch(actions.setSpaceField({ field: 'resolvedLayout', value: true } as any));
        await settle();
        expect(stub.tweens).toHaveLength(0);
        store.dispatch(actions.setSpaceLoading(false));
        await settle();
        expect(stub.tweens).toHaveLength(1);
        const there = resolveAnchor(store.getState(), { path: '/b' });
        expect(there.ok && sameCamera(stub.tweens[0].target, there.camera)).toBe(true);
    });

    it('awaits the host\'s onStep: a stop travels once it is prepared; skip and stop are the host\'s to say', async () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player, log } = playerOn(store);
        let release: () => void = () => {};
        const contexts: { index: number; aborted: boolean }[] = [];

        const done = player.play(tourOf(step('one', '/a'), step('skipped', '/b'), step('three', '/a'), step('last', '/b')), {
            onStep: (current, context) => {
                contexts.push({ index: context.index, aborted: context.signal.aborted });
                if (current.id === 'one') {
                    return new Promise<void>((resolve) => {
                        release = resolve;
                    });
                }
                if (current.id === 'skipped') {
                    return 'skip';
                }
                if (current.id === 'last') {
                    return 'stop';
                }
                return undefined;
            },
        });
        expect(player.state().status).toBe('preparing');
        expect(stub.tweens).toHaveLength(0);
        release();
        await settle();
        expect(player.state()).toMatchObject({ status: 'travelling', index: 0 });
        stub.land();

        player.next();
        await settle();
        expect(log).toContain('skip:host@1');
        expect(player.state()).toMatchObject({ status: 'travelling', index: 2 });
        stub.land();
        player.next();
        await expect(done).resolves.toMatchObject({ reason: 'stopped', index: 3 });
        expect(contexts.map((context) => context.index)).toEqual([0, 1, 2, 3]);
    });

    it('a step left before it travelled aborts its signal, and what its onStep resolves later is ignored', async () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player } = playerOn(store);
        const signals: AbortSignal[] = [];
        let releaseFirst: () => void = () => {};

        void player.play(tourOf(step('one', '/a'), step('two', '/b')), {
            onStep: (current, context) => {
                signals.push(context.signal);
                if (current.id === 'one') {
                    return new Promise<void>((resolve) => {
                        releaseFirst = resolve;
                    });
                }
                return undefined;
            },
        });
        player.next();
        await settle();
        expect(signals[0].aborted).toBe(true);
        expect(player.state()).toMatchObject({ status: 'travelling', index: 1 });
        releaseFirst();
        await settle();
        expect(player.state().index).toBe(1);
        expect(stub.tweens).toHaveLength(1);
    });

    it('a missing plane asks onMissing: skip without one, retry once the space is at rest, or stop', async () => {
        const store = bootedStore();
        motionStub(store);
        const skipping = playerOn(store);
        void skipping.player.play(tourOf(step('gone', '/nowhere'), step('there', '/a')));
        await settle();
        expect(skipping.log.slice(0, 2)).toEqual(['skip:absent@0', 'travel@1']);
        skipping.player.stop();

        const asked: { reason: string; attempt: number }[] = [];
        const retrying = playerOn(store);
        void retrying.player.play(tourOf(step('late', '/late')), {
            onMissing: (_step, context) => {
                asked.push({ reason: context.reason, attempt: context.attempt });
                return 'retry';
            },
        });
        await settle();
        expect(asked).toEqual([{ reason: 'absent', attempt: 1 }]);
        // the host opens the plane; the retry finds it once the space is at rest
        store.dispatch(actions.restoreArrangement({ tree: [...roots(), treePlane('late', { location: { translateX: 1200 } })], links: [] }));
        await jest.advanceTimersByTimeAsync(200);
        await settle();
        expect(retrying.player.state()).toMatchObject({ status: 'travelling', planeID: 'late' });
        expect(asked).toHaveLength(1);
        retrying.player.stop();

        const hidden = bootedStore([treePlane('a'), treePlane('closed', { show: false })]);
        motionStub(hidden);
        const onHidden = playerOn(hidden);
        const ended = onHidden.player.play(tourOf(step('closed', '/closed')), { onMissing: (_step, context) => (context.reason === 'hidden' ? 'stop' : 'skip') });
        await expect(ended).resolves.toMatchObject({ reason: 'stopped' });
        expect(onHidden.log).toEqual(['end:stopped@0']);
    });

    it('ANOTHER CALLER TAKING THE CAMERA PAUSES IT; resume resolves the stop again and travels back, for the whole dwell', async () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player, log } = playerOn(store);
        void player.play(tourOf(step('one', '/a', { dwell: 1000 }), step('two', '/b')));
        expect(player.state().status).toBe('travelling');

        store.dispatch(cameraCommand({ kind: 'frame', planeID: 'b' }) as any);
        expect(player.state()).toMatchObject({ status: 'paused', paused: 'interrupted', index: 0 });
        expect(stub.land()).toBe(true);
        jest.advanceTimersByTime(5000);
        expect(player.state().status).toBe('paused');

        player.resume();
        expect(player.state().status).toBe('travelling');
        const back = resolveAnchor(store.getState(), { path: '/a' });
        expect(back.ok && sameCamera(stub.tweens[stub.tweens.length - 1].target, back.camera)).toBe(true);
        stub.land();
        jest.advanceTimersByTime(999);
        expect(player.state().index).toBe(0);
        jest.advanceTimersByTime(1);
        expect(player.state().index).toBe(1);
        expect(log.slice(0, 5)).toEqual(['travel@0', 'pause:interrupted@0', 'resume@0', 'travel@0', 'arrive@0']);
    });

    it('a pause at a stop keeps what was left of its dwell; a stop the camera never left goes on from there', () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player } = playerOn(store);
        void player.play(tourOf(step('one', '/a', { dwell: 1000 }), step('two', '/b')));
        stub.land();
        jest.advanceTimersByTime(400);
        player.pause();
        expect(player.state()).toMatchObject({ status: 'paused', paused: 'host' });
        jest.advanceTimersByTime(5000);
        expect(player.state().index).toBe(0);

        const tweens = stub.tweens.length;
        player.resume();
        expect(player.state().status).toBe('dwelling');
        expect(stub.tweens).toHaveLength(tweens);
        jest.advanceTimersByTime(599);
        expect(player.state().index).toBe(0);
        jest.advanceTimersByTime(1);
        expect(player.state()).toMatchObject({ status: 'travelling', index: 1 });
    });

    it('the host\'s pause stops the camera where it is; next and previous go on from a pause; seek goes by id', () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player } = playerOn(store);
        void player.play(tourOf(step('one', '/a'), step('two', '/b'), step('three', '/a')));
        player.pause();
        expect(stub.cancels).toBe(1);
        player.next();
        expect(player.state()).toMatchObject({ status: 'travelling', index: 1 });
        player.previous();
        expect(player.state()).toMatchObject({ status: 'travelling', index: 0 });
        // nothing before the first: it is travelled to again
        player.previous();
        expect(player.state().index).toBe(0);
        player.seek('three');
        expect(player.state().index).toBe(2);
        player.seek(1);
        expect(player.state().index).toBe(1);

        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        player.seek('nowhere');
        expect(player.state().index).toBe(1);
        expect(warn).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });

    it('THE STOP FOLLOWS ITS PLANE: a relayout re-aims the travel, continuing it, and at the stop the camera follows', () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player, log } = playerOn(store);
        void player.play(tourOf(step('one', '/b', { dwell: null })));
        const placed = (translateX: number) => store.dispatch(actions.restoreArrangement({
            tree: [treePlane('a'), treePlane('b', { location: { translateX } })],
            links: [],
        }));

        placed(1400);
        expect(stub.tweens).toHaveLength(2);
        expect(stub.tweens[1].options?.continues).toBe(true);
        const moved = resolveAnchor(store.getState(), { path: '/b' });
        expect(moved.ok && sameCamera(stub.tweens[1].target, moved.camera)).toBe(true);
        // the continued travel's landing is the arrival
        stub.land();
        expect(log).toEqual(['travel@0', 'arrive@0']);

        placed(2200);
        expect(stub.tweens).toHaveLength(3);
        expect(stub.tweens[2].options?.continues).toBeUndefined();
        stub.land();
        expect(player.state().status).toBe('dwelling');

        // another caller moved the camera off the stop: the tour pauses, and a relayout does not take
        // the camera back
        store.dispatch(actions.applyCameraDelta({ yaw: 30 }));
        expect(player.state()).toMatchObject({ status: 'paused', paused: 'interrupted' });
        placed(2600);
        expect(stub.tweens).toHaveLength(3);
        expect(player.state().status).toBe('paused');
    });

    it('A RESIZE AT A STOP IS FOLLOWED, not taken for another caller: the camera it re-derives is the engine\'s', () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player } = playerOn(store);
        void player.play(tourOf(step('one', '/b', { dwell: null })));
        stub.land();
        // the view's size and the camera re-derived for it, in one action
        store.dispatch(actions.setViewSize({ width: 820, height: 520 }));
        expect(player.state().status).toBe('dwelling');
        expect(stub.tweens).toHaveLength(2);
        const there = resolveAnchor(store.getState(), { path: '/b' });
        expect(there.ok && sameCamera(stub.tweens[1].target, there.camera)).toBe(true);
    });

    it('ANOTHER CALLER MOVING THE CAMERA AT A STOP PAUSES IT; the dwell does not run out and take the camera back', () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player, log } = playerOn(store);
        void player.play(tourOf(step('one', '/a', { dwell: 1000 }), step('two', '/b')));
        stub.land();
        jest.advanceTimersByTime(300);
        // a host's jump (an agent's frame, a key's nudge): no tween of the tour's runs to be interrupted
        store.dispatch(cameraCommand({ kind: 'delta', delta: { yaw: 40 } }, { animate: false }) as any);
        const moved = store.space().camera;
        expect(player.state()).toMatchObject({ status: 'paused', paused: 'interrupted', index: 0 });
        jest.advanceTimersByTime(5000);
        expect(player.state().index).toBe(0);
        expect(store.space().camera).toBe(moved);
        expect(log).toEqual(['travel@0', 'arrive@0', 'pause:interrupted@0']);
        // resume goes back to the stop, for its whole dwell
        player.resume();
        expect(player.state().status).toBe('travelling');
        stub.land();
        jest.advanceTimersByTime(999);
        expect(player.state().index).toBe(0);
        jest.advanceTimersByTime(1);
        expect(player.state().index).toBe(1);
    });

    it('A PLANE CLOSED UNDER A STEP goes through onMissing, at a stop and on the way', async () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const asked: string[] = [];
        const { player, log } = playerOn(store);
        void player.play(tourOf(step('one', '/b', { dwell: null }), step('two', '/a', { dwell: null })), {
            onMissing: (current, context) => {
                asked.push(current.id + ':' + context.reason);
                return 'skip';
            },
        });
        stub.land();
        const close = () => store.dispatch(actions.restoreArrangement({
            tree: [treePlane('a'), treePlane('b', { location: { translateX: 600 }, show: false })],
            links: [],
        }));
        close();
        await settle();
        expect(asked).toEqual(['one:hidden']);
        expect(log).toEqual(['travel@0', 'arrive@0', 'skip:hidden@0', 'travel@1']);

        // on the way: the tween stops, and the step is passed over
        const travelling = bootedStore();
        const motion = motionStub(travelling);
        const onWay = playerOn(travelling);
        void onWay.player.play(tourOf(step('one', '/b'), step('two', '/a')));
        expect(onWay.player.state().status).toBe('travelling');
        const cancels = motion.cancels;
        travelling.dispatch(actions.restoreArrangement({
            tree: [treePlane('a'), treePlane('b', { location: { translateX: 600 }, show: false })],
            links: [],
        }));
        expect(motion.cancels).toBe(cancels + 1);
        await settle();
        expect(onWay.log).toEqual(['travel@0', 'skip:hidden@0', 'travel@1']);
    });

    it('REDUCED MOTION: every travel is a jump, recorded as a travel and then an arrival, and the dwell stays', () => {
        const store = bootedStore();
        motionStub(store, { accept: false, reducedMotion: true });
        const { player, log } = playerOn(store);
        void player.play(tourOf(step('one', '/a', { dwell: 800 }), step('two', '/b', { dwell: 800 })));
        // the settle came inside the dispatch: the status was set before it
        expect(log).toEqual(['travel@0', 'arrive@0']);
        expect(player.state().status).toBe('dwelling');
        const there = resolveAnchor(store.getState(), { path: '/a' });
        expect(there.ok && sameCamera(store.space().camera, there.camera)).toBe(true);
        jest.advanceTimersByTime(799);
        expect(player.state().index).toBe(0);
        jest.advanceTimersByTime(1);
        expect(log).toEqual(['travel@0', 'arrive@0', 'travel@1', 'arrive@1']);
    });

    it('without a mounted View it jumps too, and still keeps time', () => {
        const store = bootedStore();
        const { player, log } = playerOn(store);
        void player.play(tourOf(step('one', '/a', { dwell: 300 }), step('two', '/b')));
        expect(log).toEqual(['travel@0', 'arrive@0']);
        jest.advanceTimersByTime(300);
        expect(player.state()).toMatchObject({ status: 'dwelling', index: 1 });
    });

    it('a new tour replaces the one playing; stop ends it; ended is ended until the next play', async () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player } = playerOn(store);
        const first = player.play(tourOf(step('one', '/a')));
        const second = player.play({ ...tourOf(step('two', '/b')), id: 'second' });
        await expect(first).resolves.toMatchObject({ reason: 'replaced' });
        expect(player.state()).toMatchObject({ tourID: 'second', status: 'travelling' });
        const cancels = stub.cancels;
        player.stop();
        expect(stub.cancels).toBe(cancels + 1);
        await expect(second).resolves.toMatchObject({ reason: 'stopped' });
        // ended is ended: steering does nothing until the next play
        player.next();
        expect(player.state().status).toBe('ended');
        await expect(player.play(tourOf())).resolves.toMatchObject({ reason: 'complete' });
    });

    it('A TOUR THAT IS NOT ONE IS REFUSED, and the tour playing goes on, untouched; the bus hears why', async () => {
        const store = bootedStore();
        motionStub(store);
        const { player, log, observations } = playerOn(store);
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const playing = player.play({ ...tourOf(step('one', '/a')), id: 'playing' });
        const before = player.state();

        await expect(player.play({ plurid: 'plurid/tour', version: 1, steps: 'x' } as any))
            .resolves.toEqual({ type: 'end', index: -1, reason: 'error', error: 'the tour: `steps` must be an array' });
        await expect(player.play(tourOf(step('two', '/b')), { start: 'nowhere' }))
            .resolves.toMatchObject({ reason: 'error', error: 'the tour has no step "nowhere" to start at' });
        await expect(player.play(tourOf(step('long', '/b', { dwell: 3e9 }))))
            .resolves.toMatchObject({ reason: 'error', error: expect.stringMatching(/at most 2147483647 ms/) });
        player.command({ action: 'play', tour: { nope: true } as any });

        expect(player.state()).toEqual(before);
        expect(log).toEqual(['travel@0']);
        expect(observations[observations.length - 1]).toEqual({ state: before, error: expect.stringMatching(/is not one/) });
        expect(warn).toHaveBeenCalledTimes(4);
        warn.mockRestore();
        player.stop();
        await expect(playing).resolves.toMatchObject({ reason: 'stopped' });
    });

    it('a play from a listener of the replacing end is the newer call: it plays, and every promise settles', async () => {
        const store = bootedStore();
        motionStub(store);
        const { player } = playerOn(store);
        void player.play({ ...tourOf(step('one', '/a')), id: 'A' });
        let inner: Promise<unknown> | undefined;
        const unsubscribe = player.subscribe((event) => {
            if (event.type === 'end' && event.reason === 'replaced' && !inner) {
                inner = player.play({ ...tourOf(step('c', '/a')), id: 'C' });
            }
        });
        const outer = player.play({ ...tourOf(step('b', '/b')), id: 'B' });
        unsubscribe();
        await expect(outer).resolves.toEqual({ type: 'end', index: -1, reason: 'replaced' });
        expect(player.state()).toMatchObject({ tourID: 'C', status: 'travelling' });
        player.stop();
        await expect(inner).resolves.toMatchObject({ reason: 'stopped' });
    });

    it('A RUN OF MISSING STEPS YIELDS BETWEEN THEM: the most a tour holds, all missing, end it with the stack untouched', async () => {
        const store = bootedStore();
        motionStub(store);
        const { player } = playerOn(store);
        const steps = Array.from({ length: 1000 }, (_, at) => step('s' + at, '/nowhere-' + at));
        let ended: unknown;
        void player.play(tourOf(...steps)).then((end) => {
            ended = end;
        });
        // one microtask per skip
        for (let turn = 0; turn < 2000 && !ended; turn += 1) {
            await Promise.resolve();
        }
        expect(ended).toEqual({ type: 'end', index: 999, reason: 'complete' });
    });

    it('a skip yields before the next step: no run of skips, however long, grows the stack', async () => {
        const store = bootedStore();
        motionStub(store);
        const { player, log } = playerOn(store);
        void player.play(tourOf(step('gone', '/nowhere'), step('there', '/a')));
        // the skip is said at once, and the next step begins on the next microtask, not inside it
        expect(log).toEqual(['skip:absent@0']);
        expect(player.state()).toMatchObject({ index: 0, status: 'preparing' });
        await Promise.resolve();
        expect(log).toEqual(['skip:absent@0', 'travel@1']);
    });

    it('a step left during its travel stops its tween, whatever the next step\'s onStep is doing', async () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player } = playerOn(store);
        void player.play(tourOf(step('one', '/a'), step('two', '/b')), {
            onStep: (current) => (current.id === 'two' ? new Promise(() => {}) : undefined),
        });
        await settle();
        expect(player.state().status).toBe('travelling');
        const cancels = stub.cancels;
        player.next();
        await settle();
        expect(stub.cancels).toBe(cancels + 1);
        // the tween to the stop the tour left is no more
        expect(stub.land()).toBe(false);
        expect(player.state()).toMatchObject({ status: 'preparing', index: 1 });
    });

    it('THE HELD PATH: a pause during a slow onStep holds the travel; resume travels to where the plane is then', async () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player, log } = playerOn(store);
        let release: () => void = () => {};
        void player.play(tourOf(step('one', '/b', { dwell: null })), {
            onStep: () => new Promise<void>((resolve) => {
                release = resolve;
            }),
        });
        player.pause();
        expect(player.state()).toMatchObject({ status: 'paused', paused: 'host' });
        store.dispatch(actions.restoreArrangement({ tree: [treePlane('a'), treePlane('b', { location: { translateX: 1900 } })], links: [] }));
        release();
        await settle();
        expect(player.state().status).toBe('paused');
        expect(stub.tweens).toHaveLength(0);

        player.resume();
        const there = resolveAnchor(store.getState(), { path: '/b' });
        expect(there.ok && sameCamera(stub.tweens[0].target, there.camera)).toBe(true);
        stub.land();
        expect(log).toEqual(['pause:host@0', 'resume@0', 'travel@0', 'arrive@0']);
    });

    it('A PAUSE HOLDS THROUGH A SKIP: the next step\'s onStep waits for resume', async () => {
        const store = bootedStore();
        motionStub(store);
        const { player, log } = playerOn(store);
        const prepared: string[] = [];
        let releaseFirst: () => void = () => {};
        void player.play(tourOf(step('one', '/a'), step('two', '/b')), {
            onStep: (current) => {
                prepared.push(current.id);
                if (current.id === 'one') {
                    return new Promise<'skip'>((resolve) => {
                        releaseFirst = () => resolve('skip');
                    });
                }
                return undefined;
            },
        });
        player.pause();
        releaseFirst();
        await settle();
        // the skip moved the tour on, and the pause stands: nothing of step two is prepared
        expect(player.state()).toMatchObject({ status: 'paused', index: 1 });
        expect(prepared).toEqual(['one']);

        player.resume();
        await settle();
        expect(prepared).toEqual(['one', 'two']);
        expect(player.state()).toMatchObject({ status: 'travelling', index: 1 });
        expect(log).toEqual(['pause:host@0', 'skip:host@0', 'resume@1', 'travel@1']);
    });

    it('A RESUME SAYS THE STATE IT LEAVES: dwelling at a stop never left; next, previous and seek from a pause say resume', () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player, log, states, observations } = playerOn(store);
        void player.play(tourOf(step('one', '/a', { dwell: 1000 }), step('two', '/b'), step('three', '/a')));
        stub.land();
        player.pause();
        player.resume();
        expect(states.slice(-1)).toEqual(['dwelling']);
        expect(observations[observations.length - 1].state.status).toBe('dwelling');

        player.pause();
        player.next();
        player.pause();
        player.seek('three');
        player.pause();
        player.previous();
        expect(log).toEqual([
            'travel@0', 'arrive@0', 'pause:host@0', 'resume@0',
            'pause:host@0', 'resume@1', 'travel@1',
            'pause:host@1', 'resume@2', 'travel@2',
            'pause:host@2', 'resume@1', 'travel@1',
        ]);
        expect(states[states.indexOf('dwelling', 2) + 0]).toBe('dwelling');
    });

    it('a host callback that throws ends the tour with the reason', async () => {
        const store = bootedStore();
        motionStub(store);
        const { player } = playerOn(store);
        const error = jest.spyOn(console, 'error').mockImplementation(() => {});
        await expect(player.play(tourOf(step('one', '/a')), { onStep: () => { throw new Error('the file is gone'); } }))
            .resolves.toMatchObject({ reason: 'error', error: 'onStep threw: the file is gone' });
        await expect(player.play(tourOf(step('one', '/nowhere')), { onMissing: () => Promise.reject(new Error('no')) }))
            .resolves.toMatchObject({ reason: 'error', error: 'onMissing threw: no' });
        expect(error).toHaveBeenCalled();
        error.mockRestore();
    });

    it('answers the bus: every action of `space.tour`, and the state on request', () => {
        const store = bootedStore();
        const stub = motionStub(store);
        const { player, observations } = playerOn(store);
        player.command({ action: 'play', tour: tourOf(step('one', '/a'), step('two', '/b')), step: 'two' });
        expect(player.state()).toMatchObject({ index: 1, status: 'travelling' });
        player.command({ action: 'pause' });
        expect(player.state().status).toBe('paused');
        player.command({ action: 'resume' });
        stub.land();
        player.command({ action: 'previous' });
        expect(player.state().index).toBe(0);
        player.command({ action: 'next' });
        player.command({ action: 'seek', step: 0 });
        expect(player.state().index).toBe(0);
        player.command({ action: 'state' });
        expect(observations[observations.length - 1]).toEqual({ state: player.state() });
        player.command({ action: 'stop' });
        expect(player.state().status).toBe('ended');

        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        player.command({ action: 'play' } as any);
        player.command({ action: 'seek' } as any);
        player.command({} as any);
        player.command(undefined);
        expect(warn).toHaveBeenCalledTimes(4);
        warn.mockRestore();
    });

    it('a listener that throws is reported and the tour goes on; disposing ends the tour', async () => {
        const store = bootedStore();
        motionStub(store);
        const { player } = playerOn(store);
        const error = jest.spyOn(console, 'error').mockImplementation(() => {});
        const unsubscribe = player.subscribe(() => {
            throw new Error('listener');
        });
        const done = player.play(tourOf(step('one', '/a')));
        expect(player.state().status).toBe('travelling');
        expect(error).toHaveBeenCalled();
        unsubscribe();
        player.dispose();
        await expect(done).resolves.toMatchObject({ reason: 'stopped' });
        error.mockRestore();
    });
});
// #endregion module
