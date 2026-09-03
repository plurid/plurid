// #region imports
    // #region libraries
    import {
        LinkCoordinates,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * Where a link sits on its plane, in plane-local px from the plane's top-left corner: the sum of
 * `offsetLeft/Top` along the `offsetParent` chain up to the plane element (the plane is positioned,
 * so it is an offset parent), minus the scroll offsets of any scroller in between. Layout values,
 * never `getBoundingClientRect` — the camera's CSS 3D transform does not leak in. `x` is the link's
 * right edge (where the bridge starts), `y` its vertical middle.
 */
export const measureLinkCoordinates = (
    linkElement: HTMLElement,
    planeElement: HTMLElement,
): LinkCoordinates => {
    let left = 0;
    let top = 0;

    let element: HTMLElement | null = linkElement;
    while (element && element !== planeElement) {
        left += element.offsetLeft;
        top += element.offsetTop;
        const parent = element.offsetParent as HTMLElement | null;
        if (!parent || !planeElement.contains(parent)) {
            break;
        }
        element = parent;
    }

    let scroller: HTMLElement | null = linkElement.parentElement;
    while (scroller && scroller !== planeElement) {
        left -= scroller.scrollLeft || 0;
        top -= scroller.scrollTop || 0;
        scroller = scroller.parentElement;
    }

    return {
        x: Math.round((left + linkElement.offsetWidth) * 2) / 2,
        y: Math.round((top + linkElement.offsetHeight / 2) * 2) / 2,
    };
};


const escapeAttribute = (
    value: string,
): string => (typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(value)
    : value.replace(/["\\]/g, '\\$&'));


/**
 * The stable identity of a link: the host's explicit `linkID`, else
 * `<parentPlaneID>#<route>#<ordinal>` where the ordinal is the link's index among the links to the
 * same route inside the plane (DOM order) — deterministic across re-renders, and what the spawned
 * plane records in `spawnedByLinkID`.
 */
export const resolveLinkID = (
    linkElement: HTMLElement,
    planeElement: HTMLElement,
    route: string,
    explicit?: string,
): string => {
    if (explicit) {
        return explicit;
    }

    const parentPlaneID = planeElement.getAttribute('data-plurid-plane') || '';
    const siblings = Array.from(
        planeElement.querySelectorAll(`[data-plurid-link-route="${escapeAttribute(route)}"]`),
    );
    const ordinal = Math.max(0, siblings.indexOf(linkElement));

    return parentPlaneID + '#' + route + '#' + ordinal;
};
// #endregion module
