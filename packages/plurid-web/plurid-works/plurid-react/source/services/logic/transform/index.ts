// #region imports
    // #region libraries
    import {
        PLURID_ATTRIBUTE_PLANE_ANCHOR,
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
 *
 * The plane is looked up in `scope`, the application's view: two applications with the same routes
 * hold the same plane ids, and a lookup in the whole document focused the other one's plane. The id
 * is escaped, as a route can carry a quote (2026-10-20).
 */
export const focusPluridPlaneAnchor = (
    planeID: string,
    scope?: ParentNode | null,
) => {
    if (typeof document === 'undefined') {
        // Server / node: nothing to focus.
        return;
    }
    const within: ParentNode = scope ?? document;
    const id = planeID.replace(/["\\]/g, '\\$&');
    // A plane whose content scrolls inside it (a declared or configured height) focuses the
    // scroller, so the keyboard scrolls the page; otherwise the invisible anchor.
    const scroller = within.querySelector(`[${PLURID_ATTRIBUTE_PLANE}="${id}"] [${PLURID_ATTRIBUTE_ENTITY}="${PLURID_ENTITY_PLANE_CONTENT}"][tabindex]`) as HTMLElement | null;
    if (scroller) {
        scroller.focus({
            preventScroll: true,
        });
        return;
    }
    const selector = `[${PLURID_ATTRIBUTE_PLANE_ANCHOR}="${id}"]`;
    const focusAnchor: HTMLAnchorElement | null = within.querySelector(selector);

    if (focusAnchor) {
        focusAnchor.focus({
            preventScroll: true,
        });
    }
}
// #endregion module
