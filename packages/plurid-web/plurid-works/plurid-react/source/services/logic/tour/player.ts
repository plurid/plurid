// #region imports
    // #region libraries
    import type {
        CameraState,
        PluridTour,
        PluridTourStep,
        PluridTourState,
        PluridTourStatus,
        PluridTourEvent,
        PluridTourEnd,
        PluridTourEndReason,
        PluridTourPauseReason,
        PluridTourSkipReason,
        PluridTourPlayOptions,
        PluridTourMissingAction,
        PluridTourControls,
        PluridTourObservation,
        PluridTourRecorder,
        PluridTourRecordOptions,
        PluridAnchorResolution,
        PluridPubSubMessageTour,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import type {
        AppState,
    } from '~services/state/store';
    import type {
        PluridThunkExtra,
    } from '~services/state/extra';

    import {
        cameraCommand,
        resolveAnchor,
        sameCamera,
    } from '~services/logic/camera';
    import {
        waitForRest,
    } from '~services/logic/rest';
    import {
        isEditableTarget,
        isModifierKey,
        pinnedFrameOf,
    } from '~services/logic/input/guard';
    import {
        isDevelopment,
    } from '~services/logic/development/environment';
    // #endregion external


    // #region internal
    import {
        parseTour,
        PLURID_TOUR_FORMAT,
        PLURID_TOUR_VERSION,
        PLURID_TOUR_MAX_DWELL,
    } from './format';
    import {
        anchorOf,
        sameAnchor,
    } from './anchor';
    // #endregion internal
// #endregion imports



// #region module
/** What the player drives: the application's store, its thunk extra (the motion, the view), its bus. */
export interface TourPlayerHost {
    getState: () => AppState;
    dispatch: (action: any) => unknown;
    subscribe: (listener: () => void) => () => void;
    extra: PluridThunkExtra;
    /** Tell the bus (`space.changed` kind `tour`). */
    observe?: (observation: PluridTourObservation) => void;
}

/** The application's player: the controls, the bus's `space.tour`, and the end of its life. */
export interface PluridTourPlayer extends PluridTourControls {
    command: (message: PluridPubSubMessageTour | undefined) => void;
    dispose: () => void;
}

/** The inputs that pause a tour: a press, a wheel, a key, each on the view. */
const INPUTS = ['pointerdown', 'wheel', 'keydown'] as const;

/** How long a retry waits for the space to come to rest before it resolves the step again. */
const RETRY_REST_TIMEOUT = 2000;

/** How long the recorder waits for a moving camera to come to rest before it looks again. */
const RECORD_REST_TIMEOUT = 10000;

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/** The space has booted: its first layout resolved. A tour waits for this, never buffers. */
const ready = (
    state: AppState,
): boolean => !state.space.loading && state.space.resolvedLayout;

const messageOf = (
    error: unknown,
): string => (error instanceof Error ? error.message : String(error));

const report = (
    what: string,
    error: unknown,
) => {
    if (isDevelopment() && typeof console !== 'undefined') {
        console.error('[plurid] a tour ' + what + ' threw:', error);
    }
};

/** Run `work` on the next microtask: a run of skipped steps yields between steps, never stacks. */
const later = (
    work: () => void,
) => {
    void Promise.resolve().then(work);
};


/**
 * THE TOUR PLAYER (2026-10-30): one per application, attached to its shell. It owns the sequence and
 * the timing; the camera moves go through the one exit every programmatic move takes
 * (`cameraCommand` kind `anchor`), so reduced motion, docking and the motion controller apply as to
 * any other move.
 *
 * - READINESS FIRST: a step waits for the space to boot, then resolves against the space as it is
 *   at that moment. Nothing is buffered or replayed.
 * - The host prepares each stop (`onStep`, awaited) before it resolves, so a stop can open what it
 *   shows. A plane that is absent or hidden asks `onMissing`: skip, retry once the space is at rest,
 *   or stop; so does a plane closed under a step in flight. A skip yields a microtask before the
 *   next step, so a run of missing steps never stacks.
 * - THE STOP FOLLOWS ITS PLANE: while a step travels or dwells, a relayout, a measurement or a
 *   resize resolves it again, and the travel is re-aimed (`continues`) or the camera follows.
 * - INPUT PAUSES, NEVER DESTROYS: a press, a wheel or a key on the view (an editable field and a
 *   lone modifier aside) pauses the tour where it is. So does any other move that takes the camera:
 *   an interrupted travel (the tween is exclusive: `onInterrupt`), and at a stop, a camera that
 *   leaves the stop without the tour moving it. A pause holds through a skip: no `onStep` runs
 *   until resume. Resume resolves the step again: it travels back if the camera left the stop, and
 *   a dwell the camera never left goes on with what it had left.
 * - Reduced motion makes every travel a jump; the dwell stays, since the dwell is the reading.
 * - Every transition sets its status BEFORE it dispatches or emits: under reduced motion (or with
 *   no View) the move settles inside the dispatch, and every event carries the state it leaves.
 */
export const createTourPlayer = (
    host: TourPlayerHost,
): PluridTourPlayer => {
    const listeners = new Set<(event: PluridTourEvent, state: PluridTourState) => void>();
    const recorders = new Set<PluridTourRecorder>();

    let tour: PluridTour<any> | undefined;
    let options: PluridTourPlayOptions<any> = {};
    let status: PluridTourStatus = 'idle';
    let index = -1;
    let planeID = '';
    let pausedReason: PluridTourPauseReason | undefined;
    let pausedFrom: 'preparing' | 'travelling' | 'dwelling' | undefined;
    let endedReason: PluridTourEndReason | undefined;
    /** the step run: a new step, an end, a new tour. Every await checks it. */
    let run = 0;
    /** the camera move: a travel, a re-aim, a pause. Every camera callback checks it. */
    let move = 0;
    /** every `play` called: one started inside another's replacing end is the newer */
    let plays = 0;
    /** a tween of the tour's is running */
    let inFlight = false;
    /** the tour's last move: only its callbacks say whether a tween is in flight */
    let flight = 0;
    let abort: AbortController | undefined;
    let dwellTimer: ReturnType<typeof setTimeout> | undefined;
    let dwellStarted = 0;
    let dwellLength: number | null = null;
    let dwellLeft: number | null | undefined;
    /** the camera the step resolved to last */
    let target: CameraState | undefined;
    /** the step finished preparing while the tour was paused: it travels on resume */
    let held = false;
    /** a step that began during a pause waits here, before its `onStep`, for resume */
    let waitingResume: (() => void) | undefined;
    let finish: ((end: PluridTourEnd) => void) | undefined;
    let seen: { tree: unknown; view: unknown; configuration: unknown } = { tree: undefined, view: undefined, configuration: undefined };
    /** the camera at the store's last notification: where it was before a change */
    let seenCamera: CameraState | undefined;
    let unsubscribeStore: (() => void) | undefined;
    let inputElement: HTMLElement | null = null;
    let waitingReady: (() => void) | undefined;


    // #region state
    const step = (): PluridTourStep<any> | undefined => (tour && index >= 0 ? tour.steps[index] : undefined);

    const state = (): PluridTourState => ({
        status,
        tourID: tour?.id ?? '',
        index,
        stepID: step()?.id ?? '',
        count: tour?.steps.length ?? 0,
        planeID,
        ...(status === 'paused' && pausedReason ? { paused: pausedReason } : {}),
        ...(status === 'ended' && endedReason ? { ended: endedReason } : {}),
    });

    const emit = (
        event: PluridTourEvent,
    ) => {
        const snapshot = state();
        for (const listener of [...listeners]) {
            try {
                listener(event, snapshot);
            } catch (error) {
                report('listener', error);
            }
        }
        host.observe?.({ state: snapshot, event });
    };

    const active = () => status === 'preparing' || status === 'travelling' || status === 'dwelling';
    // #endregion state


    // #region dwell
    const dwellOf = (
        current: PluridTourStep<any>,
    ): number | null => (current.dwell !== undefined ? current.dwell : (tour?.dwell ?? null));

    const clearDwell = () => {
        if (dwellTimer !== undefined) {
            clearTimeout(dwellTimer);
            dwellTimer = undefined;
        }
    };

    /** Stay at the stop for its dwell (or what is `left` of it), then go on; `null` waits for `next()`. */
    const startDwell = (
        token: number,
        left?: number | null,
    ) => {
        clearDwell();
        const current = step();
        if (!current) {
            return;
        }
        dwellLength = left !== undefined ? left : dwellOf(current);
        dwellStarted = now();
        if (dwellLength === null) {
            return;
        }
        // a timer's longest delay: a longer one fires at once (`parseTour` refuses one)
        dwellTimer = setTimeout(() => {
            dwellTimer = undefined;
            if (token === run && status === 'dwelling') {
                runStep(index + 1, 1);
            }
        }, Math.min(PLURID_TOUR_MAX_DWELL, Math.max(0, dwellLength)));
    };
    // #endregion dwell


    // #region camera
    /** Stop the tour's own tween where it is: what it was going to is not this step's any more. */
    const ground = () => {
        move += 1;
        if (inFlight) {
            inFlight = false;
            host.extra.motion?.cancel();
        }
    };

    /** A move of the tour's, through the anchor command: exclusive, so the tour learns how it ended. */
    const commit = (
        onSettle: () => void,
        onInterrupt: () => void,
        continues = false,
    ) => {
        const current = step();
        if (!current) {
            return;
        }
        const flightToken = ++flight;
        const landed = () => {
            if (flightToken === flight) {
                inFlight = false;
            }
        };
        inFlight = true;
        host.dispatch(cameraCommand(
            { kind: 'anchor', anchor: current.anchor },
            {
                animate: true,
                ...(current.duration !== undefined ? { duration: current.duration } : {}),
                ...(current.easing ? { easing: current.easing } : {}),
                ...(continues ? { continues: true } : {}),
                onSettle: () => {
                    landed();
                    onSettle();
                },
                onInterrupt: () => {
                    landed();
                    onInterrupt();
                },
            },
        ));
    };

    const arrive = (
        token: number,
        moveToken: number,
        left?: number | null,
    ) => {
        if (token !== run || moveToken !== move || status !== 'travelling') {
            return;
        }
        status = 'dwelling';
        seenCamera = host.getState().space.camera;
        startDwell(token, left);
        const current = step();
        if (current) {
            emit({ type: 'arrive', index, step: current, planeID });
        }
    };

    const interrupted = (
        token: number,
        moveToken: number,
    ) => {
        if (token !== run || moveToken !== move) {
            return;
        }
        pauseWith('interrupted');
    };

    /** Travel to the step's stop: the status first, then the event, then the move. */
    const travel = (
        token: number,
        resolution: Extract<PluridAnchorResolution, { ok: true }>,
        left?: number | null,
    ) => {
        const current = step();
        if (!current) {
            return;
        }
        planeID = resolution.planeID;
        target = resolution.camera;
        const moveToken = ++move;
        status = 'travelling';
        remember(host.getState());
        emit({ type: 'travel', index, step: current, planeID });
        if (token !== run || moveToken !== move) {
            return;
        }
        // a listener of `travel` may have changed the space: the anchor is read again at the move,
        // and the command reads it in the same instant
        const fresh = resolveAnchor(host.getState(), current.anchor);
        if (!fresh.ok) {
            status = 'preparing';
            void locate(token);
            return;
        }
        planeID = fresh.planeID;
        target = fresh.camera;
        commit(
            () => arrive(token, moveToken, left),
            () => interrupted(token, moveToken),
        );
    };

    const remember = (
        current: AppState,
    ) => {
        seen = {
            tree: current.space.tree,
            view: current.space.viewSize,
            configuration: current.configuration,
        };
        seenCamera = current.space.camera;
    };

    /**
     * THE STOP FOLLOWS ITS PLANE. A relayout, a measurement, a resize or a configuration change
     * moves the plane under a step in flight: the step resolves again and the travel is re-aimed (it
     * continues, keeping its callbacks), or, at the stop, the camera follows. The camera is followed
     * when it stood at the stop BEFORE this change (`before`): a resize re-derives the camera in the
     * same action that resizes the view. A plane the change closed or took away goes through the
     * missing flow, as a missing plane at the start of a step does.
     */
    const follow = (
        current: AppState,
        before: CameraState | undefined,
    ) => {
        const currentStep = step();
        if (!currentStep || !target) {
            return;
        }
        const resolution = resolveAnchor(current, currentStep.anchor);
        if (!resolution.ok) {
            clearDwell();
            ground();
            planeID = resolution.planeID ?? '';
            status = 'preparing';
            void locate(run);
            return;
        }
        const previous = target;
        target = resolution.camera;
        planeID = resolution.planeID;
        if (status === 'travelling') {
            // the running travel still lands on the stop: the change did not move it
            if (sameCamera(previous, target)) {
                return;
            }
        } else {
            // at the stop: followed when the camera stood there before this change and is not there
            // now (a resize re-derives the camera even where the stop's camera is the same)
            if (!inFlight && !(before && sameCamera(before, previous))) {
                return;
            }
            if (sameCamera(current.space.camera, target)) {
                return;
            }
        }
        const token = run;
        const moveToken = ++move;
        if (status === 'travelling') {
            commit(
                () => arrive(token, moveToken),
                () => interrupted(token, moveToken),
                true,
            );
            return;
        }
        commit(
            () => {
                seenCamera = host.getState().space.camera;
            },
            () => interrupted(token, moveToken),
        );
    };

    /**
     * ANOTHER CALLER TOOK THE CAMERA AT A STOP (2026-10-30): a host's frame, an agent's move, a drag
     * or a zoom under `pauseOnInput: false`. No tween runs during a dwell, so no interrupt says so;
     * the camera leaving the stop without the tour moving it does, and the tour pauses
     * (`interrupted`). Before, the dwell ran out and the next travel took the camera back.
     */
    const watch = (
        current: AppState,
    ) => {
        if (status === 'dwelling' && !inFlight && target && !sameCamera(current.space.camera, target)) {
            pauseWith('interrupted');
        }
    };
    // #endregion camera


    // #region steps
    const untilReady = (): Promise<void> => new Promise((resolve) => {
        if (ready(host.getState())) {
            resolve();
            return;
        }
        waitingReady = resolve;
    });

    const untilResumed = (): Promise<void> => new Promise((resolve) => {
        waitingResume = resolve;
    });

    /** Resolve the step; a missing plane asks the host (skip by default), as often as it says retry. */
    const locate = async (
        token: number,
    ) => {
        const current = step();
        const signal = abort?.signal;
        if (!current || !signal) {
            return;
        }
        for (let attempt = 1; ; attempt += 1) {
            const resolution = resolveAnchor(host.getState(), current.anchor);
            if (resolution.ok) {
                planeID = resolution.planeID;
                if (status === 'paused') {
                    held = true;
                    return;
                }
                travel(token, resolution);
                return;
            }
            planeID = resolution.planeID ?? '';
            let action: PluridTourMissingAction = 'skip';
            if (options.onMissing) {
                try {
                    action = await options.onMissing(current, {
                        index,
                        signal,
                        reason: resolution.reason,
                        attempt,
                    });
                } catch (error) {
                    if (token === run) {
                        report('onMissing', error);
                        end('error', 'onMissing threw: ' + messageOf(error));
                    }
                    return;
                }
                if (token !== run) {
                    return;
                }
            }
            if (action === 'stop') {
                end('stopped');
                return;
            }
            if (action !== 'retry') {
                skip(token, current, resolution.reason);
                return;
            }
            await waitForRest(host, RETRY_REST_TIMEOUT);
            if (token !== run) {
                return;
            }
        }
    };

    /** A step begins: readiness, a pause in force, the host's preparation, then the stop. */
    const prepare = async (
        token: number,
    ) => {
        if (!ready(host.getState())) {
            await untilReady();
            if (token !== run) {
                return;
            }
        }
        // A PAUSE HOLDS THROUGH A SKIP (2026-10-30): the next step's preparation (a file opening, a
        // caption) waits for resume
        if (status === 'paused') {
            await untilResumed();
            if (token !== run) {
                return;
            }
        }
        const current = step();
        const signal = abort?.signal;
        if (!current || !signal) {
            return;
        }
        if (options.onStep) {
            let answer: unknown;
            try {
                answer = await options.onStep(current, { index, signal });
            } catch (error) {
                if (token === run) {
                    report('onStep', error);
                    end('error', 'onStep threw: ' + messageOf(error));
                }
                return;
            }
            if (token !== run) {
                return;
            }
            if (answer === 'stop') {
                end('stopped');
                return;
            }
            if (answer === 'skip') {
                skip(token, current, 'host');
                return;
            }
        }
        await locate(token);
    };

    /** The way the tour is going: a skip going back goes on back. */
    let direction: 1 | -1 = 1;

    const skip = (
        token: number,
        current: PluridTourStep<any>,
        reason: PluridTourSkipReason,
    ) => {
        if (token !== run) {
            return;
        }
        const from = index;
        emit({ type: 'skip', index: from, step: current, reason });
        if (token !== run) {
            return;
        }
        // nothing before the first step: a skip back from it goes forward
        const next = direction === -1 && from > 0 ? from - 1 : from + 1;
        // the next step on the next microtask: a tour of missing steps with no callback skipped
        // them all inside one call, and about 1 400 of them overflowed the stack (2026-10-30)
        later(() => {
            if (token === run) {
                runStep(next, next < from ? -1 : 1, status === 'paused');
            }
        });
    };

    /** Begin the step at `requested` (past the last ends the tour). A pause in force stays. */
    const runStep = (
        requested: number,
        towards: 1 | -1,
        keepPaused = false,
    ) => {
        if (!tour) {
            return;
        }
        const wasPaused = status === 'paused' && !keepPaused;
        clearDwell();
        abort?.abort();
        abort = undefined;
        held = false;
        waitingResume = undefined;
        // the step being left was travelling: its tween stops where it is, it was going to a stop
        // the tour has left (2026-10-30: it flew on while the next step's `onStep` ran)
        ground();
        const token = ++run;
        direction = towards;
        if (requested >= tour.steps.length) {
            end('complete');
            return;
        }
        index = Math.max(0, requested);
        planeID = '';
        target = undefined;
        if (!keepPaused) {
            status = 'preparing';
            pausedReason = undefined;
            pausedFrom = undefined;
        } else {
            pausedFrom = 'preparing';
        }
        abort = new AbortController();
        // `next`, `previous` and `seek` go on from a pause: they say so
        if (wasPaused) {
            emit({ type: 'resume', index });
            if (token !== run) {
                return;
            }
        }
        void prepare(token);
    };

    /** End the tour: everything waiting is dropped, the camera stops where a travel had it. */
    const end = (
        reason: PluridTourEndReason,
        error?: string,
    ) => {
        if (status === 'idle' || status === 'ended') {
            return;
        }
        run += 1;
        abort?.abort();
        abort = undefined;
        clearDwell();
        held = false;
        waitingReady = undefined;
        waitingResume = undefined;
        ground();
        deactivate();
        status = 'ended';
        endedReason = reason;
        pausedReason = undefined;
        pausedFrom = undefined;
        const event: PluridTourEnd = {
            type: 'end',
            index,
            reason,
            ...(error ? { error } : {}),
        };
        const done = finish;
        finish = undefined;
        emit(event);
        done?.(event);
    };

    const pauseWith = (
        reason: PluridTourPauseReason,
    ) => {
        if (!active()) {
            return;
        }
        const from = status as 'preparing' | 'travelling' | 'dwelling';
        if (from === 'dwelling') {
            dwellLeft = dwellLength === null ? null : Math.max(0, dwellLength - (now() - dwellStarted));
            clearDwell();
        } else {
            dwellLeft = undefined;
        }
        // what the camera does next is not this step's travel; the tour's own tween stops where it is,
        // unless another caller already took the camera
        move += 1;
        if (inFlight) {
            inFlight = false;
            if (reason !== 'interrupted') {
                host.extra.motion?.cancel();
            }
        }
        status = 'paused';
        pausedReason = reason;
        pausedFrom = from;
        emit({ type: 'pause', index, reason });
    };
    // #endregion steps


    // #region listening
    const onInput = (
        event: Event,
    ) => {
        if (!active() || options.pauseOnInput === false) {
            return;
        }
        // a field's keys are the field's, and a pinned plane's input is its own: neither moves the camera
        if (isEditableTarget(event.target) || pinnedFrameOf(event.target)) {
            return;
        }
        if (event.type === 'keydown' && isModifierKey(event as KeyboardEvent)) {
            return;
        }
        pauseWith('input');
    };

    const detachInput = () => {
        if (!inputElement) {
            return;
        }
        for (const type of INPUTS) {
            inputElement.removeEventListener(type, onInput, { capture: true });
        }
        inputElement = null;
    };

    /**
     * The view the input is read on, as the View registers it (a remount gives another). Listened to
     * in the CAPTURE phase: the tour pauses before the engine's own handlers take the camera.
     */
    const syncInput = () => {
        const element = host.extra.view ?? null;
        if (element === inputElement) {
            return;
        }
        detachInput();
        if (!element || typeof element.addEventListener !== 'function') {
            return;
        }
        inputElement = element;
        for (const type of INPUTS) {
            element.addEventListener(type, onInput, { capture: true, passive: true });
        }
    };

    const onStore = () => {
        const current = host.getState();
        if (waitingReady && ready(current)) {
            const resolve = waitingReady;
            waitingReady = undefined;
            resolve();
        }
        syncInput();
        const before = seenCamera;
        seenCamera = current.space.camera;
        if (status !== 'travelling' && status !== 'dwelling') {
            return;
        }
        if (current.space.tree !== seen.tree || current.space.viewSize !== seen.view || current.configuration !== seen.configuration) {
            seen = {
                tree: current.space.tree,
                view: current.space.viewSize,
                configuration: current.configuration,
            };
            follow(current, before);
            return;
        }
        if (current.space.camera !== before) {
            watch(current);
        }
    };

    const activate = () => {
        if (!unsubscribeStore) {
            unsubscribeStore = host.subscribe(onStore);
        }
        seenCamera = host.getState().space.camera;
        syncInput();
    };

    const deactivate = () => {
        unsubscribeStore?.();
        unsubscribeStore = undefined;
        detachInput();
    };
    // #endregion listening


    // #region controls
    const indexOf = (
        candidate: PluridTour<any> | undefined,
        reference: number | string | undefined,
    ): number | undefined => {
        if (!candidate) {
            return undefined;
        }
        if (typeof reference === 'number') {
            return Number.isInteger(reference) && reference >= 0 && reference < candidate.steps.length
                ? reference
                : undefined;
        }
        if (typeof reference === 'string') {
            const found = candidate.steps.findIndex((item) => item.id === reference);
            return found === -1 ? undefined : found;
        }
        return undefined;
    };

    /**
     * A play the player cannot start: the tour playing goes on, untouched (2026-10-30: it was ended
     * first, and then the new tour turned out not to be one). The bus hears why.
     */
    const refuse = (
        error: string,
    ): Promise<PluridTourEnd> => {
        if (isDevelopment() && typeof console !== 'undefined') {
            console.warn('[plurid] a tour was not played: ' + error);
        }
        host.observe?.({ state: state(), error });
        return Promise.resolve({ type: 'end', index: -1, reason: 'error', error });
    };

    const play = <P = unknown>(
        input: PluridTour<P>,
        playOptions: PluridTourPlayOptions<P> = {},
    ): Promise<PluridTourEnd> => {
        // the new tour is read, and its start found, BEFORE anything playing is touched
        const parsed = parseTour<P>(input);
        if (!parsed.ok) {
            return refuse(parsed.error);
        }
        const start = playOptions.start === undefined ? 0 : indexOf(parsed.tour, playOptions.start);
        if (start === undefined) {
            return refuse(`the tour has no step ${JSON.stringify(playOptions.start)} to start at`);
        }
        const ticket = ++plays;
        if (active() || status === 'paused') {
            end('replaced');
        }
        // a play started by a listener of that end is the newer call: it plays, and this one, which
        // never began, says it was replaced (2026-10-30: it took the player over and the newer
        // play's promise never settled)
        if (ticket !== plays) {
            return Promise.resolve({ type: 'end', index: -1, reason: 'replaced' });
        }
        return new Promise<PluridTourEnd>((resolve) => {
            options = playOptions as PluridTourPlayOptions<any>;
            pausedReason = undefined;
            pausedFrom = undefined;
            endedReason = undefined;
            planeID = '';
            tour = parsed.tour;
            index = -1;
            finish = resolve;
            status = 'preparing';
            activate();
            runStep(start, 1);
        });
    };

    const resume = () => {
        if (status !== 'paused' || !tour) {
            return;
        }
        const from = pausedFrom;
        const left = dwellLeft;
        pausedReason = undefined;
        pausedFrom = undefined;
        dwellLeft = undefined;
        const token = run;
        // a preparation still running travels when it is done; one waiting for this goes on now
        if (from === 'preparing' && !held) {
            status = 'preparing';
            const waiting = waitingResume;
            waitingResume = undefined;
            emit({ type: 'resume', index });
            if (token === run) {
                waiting?.();
            }
            return;
        }
        held = false;
        const current = step();
        if (!current) {
            return;
        }
        // THE STEP RESOLVES AGAIN: its plane may have moved while the tour waited, and the reader may
        // have taken the camera somewhere else
        const resolution = resolveAnchor(host.getState(), current.anchor);
        if (resolution.ok && from === 'dwelling' && sameCamera(host.getState().space.camera, resolution.camera)) {
            // the camera never left the stop: the dwell goes on with what it had left, and the
            // resume says `dwelling` (2026-10-30: it said `preparing`, and nothing said otherwise)
            planeID = resolution.planeID;
            target = resolution.camera;
            remember(host.getState());
            status = 'dwelling';
            startDwell(token, left);
            emit({ type: 'resume', index });
            return;
        }
        status = 'preparing';
        emit({ type: 'resume', index });
        if (token !== run || status !== 'preparing') {
            return;
        }
        if (!resolution.ok) {
            void locate(token);
            return;
        }
        // back to the stop, and its whole dwell: the reader was away
        travel(token, resolution);
    };

    const steerable = () => !!tour && (active() || status === 'paused');

    const controls: PluridTourPlayer = {
        play,
        pause: () => pauseWith('host'),
        resume,
        next: () => {
            if (steerable()) {
                runStep(index + 1, 1);
            }
        },
        previous: () => {
            if (steerable()) {
                runStep(index - 1, -1);
            }
        },
        seek: (reference) => {
            if (!steerable()) {
                return;
            }
            const found = indexOf(tour, reference);
            if (found === undefined) {
                if (isDevelopment() && typeof console !== 'undefined') {
                    console.warn('[plurid] the tour has no step ' + JSON.stringify(reference) + ' to seek to');
                }
                return;
            }
            runStep(found, found < index ? -1 : 1);
        },
        stop: () => end('stopped'),
        state,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        record: (recordOptions) => {
            const recorder = createTourRecorder(host, () => active(), recordOptions);
            recorders.add(recorder);
            return {
                ...recorder,
                stop: () => {
                    recorders.delete(recorder);
                    return recorder.stop();
                },
            };
        },
        command: (message) => {
            const action = message?.action;
            switch (action) {
                case 'play':
                    if (!message?.tour) {
                        warn('`play` needs `tour`');
                        return;
                    }
                    void play(message.tour, message.step !== undefined ? { start: message.step } : {});
                    return;
                case 'pause':
                    controls.pause();
                    return;
                case 'resume':
                    resume();
                    return;
                case 'next':
                    controls.next();
                    return;
                case 'previous':
                    controls.previous();
                    return;
                case 'seek':
                    if (message?.step === undefined) {
                        warn('`seek` needs `step`');
                        return;
                    }
                    controls.seek(message.step);
                    return;
                case 'stop':
                    end('stopped');
                    return;
                case 'state':
                    host.observe?.({ state: state() });
                    return;
                default:
                    warn('`action` is one of play, pause, resume, next, previous, seek, stop, state');
            }
        },
        // the listeners stay: StrictMode replays an unmount, and a host subscribed in `onReady` keeps
        // hearing; the recorders stop with the space they listen to
        dispose: () => {
            end('stopped');
            deactivate();
            for (const recorder of recorders) {
                recorder.stop();
            }
            recorders.clear();
        },
    };

    return controls;
};

const warn = (
    reason: string,
) => {
    if (isDevelopment() && typeof console !== 'undefined') {
        console.warn('[plurid] \'space.tour\' was ignored: ' + reason);
    }
};
// #endregion controls


// #region recorder
/**
 * THE RECORDER (2026-10-30). A stop each time the camera comes to rest somewhere new: the camera
 * changed (a gesture, a fling, a wheel's tail, a key, a host's move), then the space stayed still
 * for the rest's frames, then `anchorOf` names where it is. The active plane is no trigger: it
 * follows the pointer. A rest on the stop already last adds nothing, and nothing is recorded while
 * a tour plays (its stops are its own). A stopped recorder captures nothing more.
 */
export const createTourRecorder = (
    host: Pick<TourPlayerHost, 'getState' | 'subscribe'>,
    playing: () => boolean,
    recordOptions: PluridTourRecordOptions = {},
): PluridTourRecorder => {
    const steps: PluridTourStep[] = [];
    let counter = 0;
    let camera = host.getState().space.camera;
    let waiting = false;
    let pending = false;
    let stopped = false;

    const capture = (): PluridTourStep | undefined => {
        if (stopped) {
            return undefined;
        }
        const anchor = anchorOf(host.getState());
        if (!anchor) {
            return undefined;
        }
        const last = steps[steps.length - 1];
        if (last && sameAnchor(last.anchor, anchor)) {
            return undefined;
        }
        counter += 1;
        const captured: PluridTourStep = {
            id: 'stop-' + counter,
            anchor,
            ...(recordOptions.dwell !== undefined ? { dwell: recordOptions.dwell } : {}),
        };
        steps.push(captured);
        try {
            recordOptions.onCapture?.(captured, [...steps]);
        } catch (error) {
            report('recorder\'s onCapture', error);
        }
        return captured;
    };

    /** One wait for the rest: a camera that moves on during it is part of the same move (the rest restarts). */
    const settle = async () => {
        waiting = true;
        while (!stopped) {
            pending = false;
            const still = await waitForRest(host, RECORD_REST_TIMEOUT);
            if (stopped) {
                break;
            }
            if (still) {
                if (!playing()) {
                    capture();
                }
                break;
            }
            // still moving when the wait ran out: wait again only for a camera that moved on
            if (!pending) {
                break;
            }
        }
        waiting = false;
    };

    const unsubscribe = host.subscribe(() => {
        const next = host.getState().space.camera;
        if (next === camera) {
            return;
        }
        camera = next;
        if (playing()) {
            return;
        }
        pending = true;
        if (!waiting) {
            void settle();
        }
    });

    return {
        steps: () => [...steps],
        capture,
        stop: () => {
            if (!stopped) {
                stopped = true;
                unsubscribe();
            }
            return {
                plurid: PLURID_TOUR_FORMAT,
                version: PLURID_TOUR_VERSION,
                steps: [...steps],
            };
        },
    };
};
// #endregion recorder
// #endregion module
