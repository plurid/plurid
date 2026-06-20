// #region imports
    // #region libraries
    import {
        SpaceTransform,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * A "viewpoint" is the camera/space transform — the 6 scalars in `SpaceTransform`
 * (`rotationX/Y`, `translationX/Y/Z`, `scale`). These helpers make a viewpoint a first-class,
 * encodable value so it can ride the URL (deep-links, "share from here"), be bookmarked, or be
 * sequenced into a tour. Restore by dispatching `setSpaceLocation(viewpoint)` — it sets the
 * scalars AND recomputes the rendered `matrix3d` (plain `setTransform` does not recompute).
 */

/** Query-string key the viewpoint rides on, e.g. `?v=12,…,0.4068`. */
export const VIEWPOINT_PARAM = 'v';

const PRECISION = 4;
const factor = 10 ** PRECISION;
const round = (value: number): number => Math.round(value * factor) / factor;

const ORDER: (keyof SpaceTransform)[] = [
    'rotationX',
    'rotationY',
    'translationX',
    'translationY',
    'translationZ',
    'scale',
];


/**
 * Encode a viewpoint as a compact, URL-safe, human-readable tuple
 * `rotationX,rotationY,translationX,translationY,translationZ,scale` (each rounded).
 */
export const encodeViewpoint = (
    transform: SpaceTransform,
): string => {
    return ORDER
        .map(key => round(transform[key]))
        .join(',');
};


/**
 * Decode a viewpoint tuple. Returns `null` for anything that is not exactly 6 finite numbers with a
 * positive `scale` — so a malformed or hand-edited `?v=` is ignored rather than corrupting the view.
 */
export const decodeViewpoint = (
    encoded: string | null | undefined,
): SpaceTransform | null => {
    if (!encoded) {
        return null;
    }

    const parts = encoded.split(',').map(part => Number(part));
    if (parts.length !== ORDER.length) {
        return null;
    }
    if (parts.some(value => !Number.isFinite(value))) {
        return null;
    }

    const [
        rotationX,
        rotationY,
        translationX,
        translationY,
        translationZ,
        scale,
    ] = parts;

    if (scale <= 0) {
        return null;
    }

    return {
        rotationX,
        rotationY,
        translationX,
        translationY,
        translationZ,
        scale,
    };
};


/** Read the viewpoint encoded in the current URL's `?v=` (or `null` if absent/invalid). SSR-safe. */
export const readViewpointFromURL = (): SpaceTransform | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    const raw = new URLSearchParams(window.location.search).get(VIEWPOINT_PARAM);
    return decodeViewpoint(raw);
};


/**
 * Reflect a viewpoint into the URL via `replaceState` — preserving pathname, other query params, and
 * hash, and NOT pushing a history entry (the transform changes per-frame during orbit; pushState
 * would flood the back-stack). SSR-safe.
 */
export const writeViewpointToURL = (
    transform: SpaceTransform,
): void => {
    if (typeof window === 'undefined') {
        return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set(VIEWPOINT_PARAM, encodeViewpoint(transform));
    window.history.replaceState(window.history.state, '', url.toString());
};
// #endregion module
