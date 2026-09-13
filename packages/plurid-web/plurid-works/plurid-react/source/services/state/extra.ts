// #region imports
    // #region libraries
    import type {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import type {
        CameraMotionController,
    } from '~services/logic/motion';
    import type {
        PlaneMeasurer,
    } from '~services/logic/size';
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
    /** The application's one plane measurer (`observePlaneSize`), created on the first plane's mount. */
    measurer?: PlaneMeasurer;
    /**
     * MAKE A PLANE OF THIS SPACE for a path, exactly as opening it would (`resolveViewItem` against
     * this application's registrar and hostname): `undefined` for a path it does not register. A
     * paste from another space asks this before it can hold what it was given — the planes it makes
     * are the target's own, on the target's host, with the target's declared sizes
     * (`materializeFragment`). The store never depends on the engine's registrar class.
     */
    resolvePlane?: (path: string) => TreePlane | undefined;
}


export const createThunkExtra = (): PluridThunkExtra => ({
    motion: undefined,
    view: undefined,
});
// #endregion module
