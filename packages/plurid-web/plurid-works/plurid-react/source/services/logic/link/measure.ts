// #region imports
    // #region libraries
    import {
        LinkCoordinates,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/** The layout position of `element` within `planeElement`: the `offsetLeft/Top` sum along the `offsetParent` chain. */
const offsetWithin = (
    element: HTMLElement,
    planeElement: HTMLElement,
): { left: number; top: number } => {
    let left = 0;
    let top = 0;
    let current: HTMLElement | null = element;
    while (current && current !== planeElement) {
        left += current.offsetLeft;
        top += current.offsetTop;
        const parent = current.offsetParent as HTMLElement | null;
        if (!parent || !planeElement.contains(parent)) {
            break;
        }
        current = parent;
    }
    return { left, top };
};

const CLIPPING = ['auto', 'scroll', 'hidden', 'clip'];

/**
 * Whether an element clips its overflow, per axis — a computed-style read, so it is cached per
 * element (a scroll frame measures every open link of a plane) and forgotten on a window resize,
 * the one moment a host's overflow rules plausibly change.
 */
const clipCache: WeakMap<HTMLElement, { x: boolean; y: boolean; generation: number }> = new WeakMap();
// a WeakMap cannot be cleared: entries carry the generation they were computed in, a resize bumps it
let clipGeneration = 0;
let clipInvalidationInstalled = false;

const clipsOf = (
    element: HTMLElement,
): { x: boolean; y: boolean } => {
    const cached = clipCache.get(element);
    if (cached && cached.generation === clipGeneration) {
        return cached;
    }
    if (typeof getComputedStyle !== 'function') {
        return { x: false, y: false };
    }
    if (!clipInvalidationInstalled && typeof window !== 'undefined') {
        clipInvalidationInstalled = true;
        window.addEventListener('resize', () => { clipGeneration += 1; }, { passive: true });
    }
    const style = getComputedStyle(element);
    const verdict = {
        x: CLIPPING.includes(style.overflowX || style.overflow),
        y: CLIPPING.includes(style.overflowY || style.overflow),
        generation: clipGeneration,
    };
    clipCache.set(element, verdict);
    return verdict;
};

const clips = (
    element: HTMLElement,
    axis: 'x' | 'y',
): boolean => clipsOf(element)[axis];

const half = (value: number) => Math.round(value * 2) / 2;

/**
 * Where a link sits on its plane, in plane-local px from the plane's top-left corner: the sum of
 * `offsetLeft/Top` along the `offsetParent` chain up to the plane element (the plane is positioned,
 * so it is an offset parent), minus the scroll offsets of any scroller in between — the VISUAL
 * position — and CLAMPED into the visible box of every clipping ancestor (a scroller, an
 * `overflow: hidden` box): a link scrolled beyond the fold measures AT the fold, so the plane it
 * spawned anchors at the edge of its sheet and never leaves it. Layout values, never
 * `getBoundingClientRect` — the camera's CSS 3D transform does not leak in. `x` is the link's right
 * edge (where the bridge starts), `y` its vertical middle.
 */
export const measureLinkCoordinates = (
    linkElement: HTMLElement,
    planeElement: HTMLElement,
): LinkCoordinates => {
    const origin = offsetWithin(linkElement, planeElement);
    let x = origin.left + linkElement.offsetWidth;
    let y = origin.top + linkElement.offsetHeight / 2;

    // the ancestors between the link and the plane, innermost first
    const ancestors: HTMLElement[] = [];
    for (let ancestor = linkElement.parentElement; ancestor && ancestor !== planeElement; ancestor = ancestor.parentElement) {
        ancestors.push(ancestor);
    }
    for (const ancestor of ancestors) {
        x -= ancestor.scrollLeft || 0;
        y -= ancestor.scrollTop || 0;
    }

    // clamp into each clipping ancestor's visible box, itself in visual plane coordinates (its
    // layout position minus the scroll of the ancestors OUTSIDE it)
    let outerScrollLeft = 0;
    let outerScrollTop = 0;
    for (let index = ancestors.length - 1; index >= 0; index -= 1) {
        const ancestor = ancestors[index];
        const width = ancestor.clientWidth;
        const height = ancestor.clientHeight;
        if (width > 0 || height > 0) {
            const position = offsetWithin(ancestor, planeElement);
            const left = position.left + ancestor.clientLeft - outerScrollLeft;
            const top = position.top + ancestor.clientTop - outerScrollTop;
            if (width > 0 && clips(ancestor, 'x')) {
                x = Math.min(Math.max(x, left), left + width);
            }
            if (height > 0 && clips(ancestor, 'y')) {
                y = Math.min(Math.max(y, top), top + height);
            }
        }
        outerScrollLeft += ancestor.scrollLeft || 0;
        outerScrollTop += ancestor.scrollTop || 0;
    }

    return {
        x: half(x),
        y: half(y),
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
