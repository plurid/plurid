// #region imports
    // #region libraries
    import {
        CameraState,
        PluridConfiguration,
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries

    // #region external
    import {
        space,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE UNMEASURED PAGE.
 *
 * Until the browser has measured the view (`resolvedLayout` false: the server's render, and the
 * hydrating client's first, which must be the server's), the state holds the boot FALLBACK view
 * (771 × 764), and every px the camera and the planes derive from it is a guess: a server-rendered
 * page painted as a 771 × 764 box — cut off on a phone, a third of a wide screen — until its script
 * ran and the page grew to the window (2026-09-29).
 *
 * A DOCKED page needs no view size to be placed: it is face-on, its center under the view's, at the
 * dock scale. So, docked and unmeasured, it is placed in the view's own terms: its configured size
 * as fractions of the view's box (`viewLength`), and the camera as a CSS transform of the roots,
 * `cameraMatrix`'s own `T(C) · R · S(scale) · T(−pivot)` with the center `C` and the pivot (the
 * page's center) stated as fractions of the roots' box, which is the view's while unmeasured.
 * Exact wherever the dock does not depend on the view's size — the page presentation's view-sized
 * pages, any fraction of the view; a page sized in px keeps the scale the fallback gave it.
 */
export interface UnmeasuredPage {
    /** the docked page */
    planeID: string;
    /** the roots' transform: the dock camera, about the view's center */
    transform: string;
}


/** A configured dimension as a length over the view's box, when it is a fraction of the view (else `undefined`: its px stand). */
export const viewLength = (
    configured: number | undefined,
): string | undefined => {
    const extent = space.layout.configuredPlaneExtent(configured);
    return extent && 'fraction' in extent
        ? `${extent.fraction * 100}%`
        : undefined;
};

/** Minus half the page's dock extent along one axis, in the view's terms: `dockGeometry`'s choice of size. */
const halfExtentBack = (
    own: boolean,
    measured: number,
    configured: number | undefined,
): string => {
    const extent = space.layout.configuredPlaneExtent(configured);
    if ((own && measured > 0) || !extent) {
        return `${-measured / 2}px`;
    }
    return 'fraction' in extent
        ? `${-extent.fraction * 50}%`
        : `${-extent.px / 2}px`;
};


/** The docked page before the view is measured, and the transform that places it; `undefined` otherwise. */
export const unmeasuredPage = (
    resolvedLayout: boolean,
    configuration: PluridConfiguration,
    tree: TreePlane[],
    camera: CameraState,
    dockedPlaneID: string,
): UnmeasuredPage | undefined => {
    if (resolvedLayout || configuration.space.presentation !== 'page' || !dockedPlaneID) {
        return undefined;
    }
    const page = space.tree.logic.getTreePlaneByID(tree, dockedPlaneID);
    if (!page) {
        return undefined;
    }

    const own = page.sizeMode === 'declared' || page.sizeMode === 'manual';
    const {
        translateX,
        translateY,
        translateZ,
        rotateX,
        rotateY,
    } = page.location;
    // the page's center is its origin plus its half extents along ITS OWN axes (`planeCenter`):
    // the offset is turned into them, taken, and turned back
    const turned = rotateX !== 0 || rotateY !== 0;
    // the camera's scale is uniform in THREE dimensions: CSS `scale()` leaves z alone, which a
    // turned page (depth along its own axes) would show
    const scale = `scale3d(${camera.scale}, ${camera.scale}, ${camera.scale})`;

    return {
        planeID: page.planeID,
        transform: [
            'translate(50%, 50%)',
            camera.roll ? `rotateZ(${camera.roll}deg)` : '',
            camera.pitch ? `rotateX(${camera.pitch}deg)` : '',
            camera.yaw ? `rotateY(${camera.yaw}deg)` : '',
            scale,
            `translate3d(${-translateX}px, ${-translateY}px, ${-translateZ}px)`,
            turned ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : '',
            `translate(${halfExtentBack(own, page.width, configuration.elements.plane.width)}, ${halfExtentBack(own, page.height, configuration.elements.plane.height)})`,
            turned ? `rotateY(${-rotateY}deg) rotateX(${-rotateX}deg)` : '',
        ].filter(Boolean).join(' '),
    };
};
// #endregion module
