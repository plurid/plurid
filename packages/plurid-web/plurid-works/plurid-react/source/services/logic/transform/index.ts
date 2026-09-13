// #region imports
    // #region libraries
    import {
        FOCUS_ANCHOR_SUFFIX,
        PLURID_ATTRIBUTE_ENTITY,
        PLURID_ATTRIBUTE_PLANE,
        PLURID_ENTITY_PLANE_CONTENT,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * Move the keyboard focus INTO a plane. A plane whose content scrolls inside it (a declared or
 * configured height) focuses the scroller, so the arrow keys scroll that page; any other plane
 * focuses its invisible anchor.
 *
 * (A deprecation tag used to sit here, left behind by a refactor: it described a matrix shim over
 * the legacy six scalars that no longer exists in this file, while the function under it is live
 * and is what `navigatePlane` calls on every landing. Removed 2026-09-13.)
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
    const scroller = document.querySelector(`[${PLURID_ATTRIBUTE_PLANE}="${planeID}"] [${PLURID_ATTRIBUTE_ENTITY}="${PLURID_ENTITY_PLANE_CONTENT}"][tabindex]`) as HTMLElement | null;
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
