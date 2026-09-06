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
    if (typeof document === 'undefined') {
        // Server / node: nothing to focus.
        return;
    }
    // A plane whose content scrolls inside it (a declared or configured height) focuses the
    // scroller, so the keyboard scrolls the page; otherwise the invisible anchor.
    const scroller = document.querySelector(`[data-plurid-plane="${planeID}"] [data-plurid-entity="PluridPlaneContent"][tabindex]`) as HTMLElement | null;
    if (scroller) {
        scroller.focus({
            preventScroll: true,
        });
        return;
    }
    const selector = `[id='${planeID + FOCUS_ANCHOR_SUFFIX}']`;
    const focusAnchor: HTMLAnchorElement | null = document.querySelector(selector);

    if (focusAnchor) {
        focusAnchor.focus({
            preventScroll: true,
        });
    }
}
// #endregion module
