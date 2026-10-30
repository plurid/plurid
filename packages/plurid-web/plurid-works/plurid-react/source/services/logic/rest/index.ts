// #region module
/** What the waiting reads of the engine's state: the camera, its motion, and a relayout's glide. */
export interface PluridRestSource {
    getState: () => unknown;
}

export interface PluridRestOptions {
    /** Give up after this many ms, and resolve `false`. Default 4000; one that is not a number from 0 is the default. */
    timeout?: number;
    /** How many frames in a row the space must be still: a whole number from 1. Default 3; anything else is the default. */
    frames?: number;
}

export const DEFAULT_REST_TIMEOUT = 4000;
export const DEFAULT_REST_FRAMES = 3;

/**
 * The numbers as a wait can use them (2026-10-30): a `NaN` timeout never ran out, so a space that
 * kept moving never answered, and `0` frames answered at once, before a command's motion had even
 * started.
 */
const validTimeout = (
    timeout: unknown,
): number => (typeof timeout === 'number' && timeout >= 0 && !Number.isNaN(timeout) ? timeout : DEFAULT_REST_TIMEOUT);

const validFrames = (
    frames: unknown,
): number => (typeof frames === 'number' && Number.isInteger(frames) && frames >= 1 ? frames : DEFAULT_REST_FRAMES);

const nextFrame = (
    callback: () => void,
) => {
    if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => callback());
        return;
    }
    setTimeout(callback, 16);
};

interface RestReading {
    moving: boolean;
    camera: unknown;
}

const read = (
    state: unknown,
): RestReading => {
    const space = (state as { space?: { motion?: string; layoutTransition?: number; camera?: unknown } } | undefined)?.space;
    return {
        moving: !!space && ((space.motion ?? 'idle') !== 'idle' || (space.layoutTransition ?? 0) > 0),
        camera: space?.camera,
    };
};

/**
 * THE SPACE AT REST. An action returns before its consequence has landed: a swing to a page runs
 * for a few hundred milliseconds, a spawned plane is measured and the roots relaid a frame later.
 * What waits for the space (an agent's answer, a host drawing over a stop, a tour's recorder) waits
 * until the camera is still and no relayout glides for `stillFrames` frames in a row (three: a
 * command handled on this frame starts its motion on the next), or until `timeout` ms — `false`
 * then, and the space is still moving.
 *
 * STILL MEANS THE CAMERA DID NOT CHANGE (2026-10-30, moved here from the agent so the handle's
 * `whenAtRest` and the tours read the same rest): a wheel's smoothed tail and the arrow keys move
 * the camera with the motion `idle`, and a frame in which the camera changed counts as moving.
 */
export const waitForRest = (
    store: PluridRestSource,
    timeout: number = DEFAULT_REST_TIMEOUT,
    stillFrames = DEFAULT_REST_FRAMES,
): Promise<boolean> => new Promise((resolve) => {
    const limit = validTimeout(timeout);
    const frames = validFrames(stillFrames);
    const started = Date.now();
    let still = 0;
    let camera = read(store.getState()).camera;
    const tick = () => {
        const reading = read(store.getState());
        const moved = reading.camera !== camera;
        camera = reading.camera;
        still = reading.moving || moved ? 0 : still + 1;
        if (still >= frames) {
            resolve(true);
            return;
        }
        if (Date.now() - started > limit) {
            resolve(false);
            return;
        }
        nextFrame(tick);
    };
    nextFrame(tick);
});

/** `waitForRest` with its options named, as the handle takes them. */
export const whenAtRest = (
    store: PluridRestSource,
    options: PluridRestOptions = {},
): Promise<boolean> => waitForRest(
    store,
    options.timeout ?? DEFAULT_REST_TIMEOUT,
    options.frames ?? DEFAULT_REST_FRAMES,
);
// #endregion module
