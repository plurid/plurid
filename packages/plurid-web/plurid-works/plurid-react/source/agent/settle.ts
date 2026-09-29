// #region module
/** What the waiting reads of the engine's state: the camera's motion and a relayout's glide. */
export interface PluridAgentSettleSource {
    getState: () => unknown;
}

const nextFrame = (
    callback: () => void,
) => {
    if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => callback());
        return;
    }
    setTimeout(callback, 16);
};

const moving = (
    state: unknown,
) => {
    const space = (state as { space?: { motion?: string; layoutTransition?: number } } | undefined)?.space;
    return !!space && ((space.motion ?? 'idle') !== 'idle' || (space.layoutTransition ?? 0) > 0);
};

/**
 * THE SPACE AT REST. An action returns before its consequence has landed: a swing to a page runs
 * for a few hundred milliseconds, a spawned plane is measured and the roots relaid a frame later.
 * An agent that observes at once reads the space in flight, so the answer waits until the camera
 * is still and no relayout glides for `stillFrames` frames in a row (three: a command handled on
 * this frame starts its motion on the next), or until `timeout` ms — `false` then, and the
 * observation says the space is still moving.
 */
export const waitForRest = (
    store: PluridAgentSettleSource,
    timeout: number,
    stillFrames = 3,
): Promise<boolean> => new Promise((resolve) => {
    const started = Date.now();
    let still = 0;
    const tick = () => {
        still = moving(store.getState()) ? 0 : still + 1;
        if (still >= stillFrames) {
            resolve(true);
            return;
        }
        if (Date.now() - started > timeout) {
            resolve(false);
            return;
        }
        nextFrame(tick);
    };
    nextFrame(tick);
});
// #endregion module
