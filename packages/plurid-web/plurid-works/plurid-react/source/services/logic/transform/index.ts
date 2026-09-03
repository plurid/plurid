// #region imports
    // #region libraries
    import {
        FOCUS_ANCHOR_SUFFIX,

        PluridStateSpace,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        interaction,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;


/**
 * @deprecated The camera core (`interaction.camera` in `@plurid/plurid-engine`) owns the matrix;
 * the space slice commits through `cameraMatrix3d`. Kept as an exact shim over the legacy six
 * scalars for any external caller.
 */
export const focusPluridPlaneAnchor = (
    planeID: string,
) => {
    const selector = `[id='${planeID + FOCUS_ANCHOR_SUFFIX}']`;
    const focusAnchor: HTMLAnchorElement | null = document.querySelector(selector);

    if (focusAnchor) {
        focusAnchor.focus({
            preventScroll: true,
        });
    }
}
// #endregion module
