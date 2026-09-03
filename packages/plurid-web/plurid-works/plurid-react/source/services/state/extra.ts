// #region imports
    // #region external
    import type {
        CameraMotionController,
    } from '~services/logic/motion';
    // #endregion external
// #endregion imports



// #region module
/**
 * The store's thunk extra argument: one mutable holder per `PluridApplication`, created with the
 * store and filled in by the View once it mounts. Thunks receive it as their third parameter and
 * read it LIVE (never capture `extra.motion` — the View may remount).
 */
export interface PluridThunkExtra {
    /** The View's motion controller, while a View is mounted. */
    motion?: CameraMotionController;
    /** The View's root element, while mounted (the shortcuts' focus target). */
    view?: HTMLElement | null;
}


export const createThunkExtra = (): PluridThunkExtra => ({
    motion: undefined,
    view: undefined,
});
// #endregion module
