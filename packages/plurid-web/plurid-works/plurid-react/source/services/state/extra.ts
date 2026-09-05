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
    /**
     * A plane to frame again once its FIRST measurement after (re)opening lands (`reportPlaneSize`):
     * a plane that was closed is unmounted, so the tree keeps the size it had when it closed — the
     * frame at reopen targets the best-known geometry, the measured one retargets the tween.
     */
    pendingFrame?: {
        planeID: string;
        animate: boolean;
    };
}


export const createThunkExtra = (): PluridThunkExtra => ({
    motion: undefined,
    view: undefined,
});
// #endregion module
