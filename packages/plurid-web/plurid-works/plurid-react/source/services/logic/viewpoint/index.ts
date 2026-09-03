// #region imports
    // #region libraries
    import {
        SpaceTransform,
        CameraState,
        CameraLimits,
        ViewSize,
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
 * A "viewpoint" is the camera as a first-class, encodable value, so it can ride the URL
 * (deep-links, "share from here"), be bookmarked, or be sequenced into a tour.
 *
 * Two encodings are supported, both always accepted on decode:
 *  - v1 — the six legacy scalars `rotationX,rotationY,translationX,translationY,translationZ,scale`
 *    (what existing share links carry; exact, with the orbit pivot at the view center);
 *  - v2 — the full camera `v2|yaw|pitch|scale|pivotX|pivotY|pivotZ|offsetX|offsetY|offsetZ|perspective`,
 *    which preserves the orbit pivot and the pan offset.
 *
 * Restore by dispatching `setCamera` with the decoded camera (or `setCameraFromLegacy` with the
 * decoded scalars) — both recompute the rendered matrix.
 */

/** Query-string key the viewpoint rides on, e.g. `?v=12,…,0.4068`. */
export const VIEWPOINT_PARAM = 'v';

export const VIEWPOINT_V2_PREFIX = 'v2';
const V2_SEPARATOR = '|';

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

/** The view assumed when a v2 viewpoint must be reduced to the legacy scalars without a view. */
const DEFAULT_VIEW: ViewSize = {
    width: 1440,
    height: 800,
};


/**
 * Encode a viewpoint as the compact, URL-safe v1 tuple
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
 * Encode the camera: v1 (default — the legacy scalars, exact for the rendered picture) or v2 (the
 * full camera, preserving pivot and pan).
 */
export const encodeCameraViewpoint = (
    camera: CameraState,
    view: ViewSize,
    version: 1 | 2 = 1,
): string => {
    if (version === 2) {
        return [
            VIEWPOINT_V2_PREFIX,
            round(camera.yaw),
            round(camera.pitch),
            round(camera.scale),
            round(camera.pivot.x),
            round(camera.pivot.y),
            round(camera.pivot.z),
            round(camera.offset.x),
            round(camera.offset.y),
            round(camera.offset.z),
            round(camera.perspective),
        ].join(V2_SEPARATOR);
    }

    return encodeViewpoint(cameraEngine.toLegacy(camera, view));
};


export const isViewpointV2 = (
    encoded: string | null | undefined,
): boolean => typeof encoded === 'string'
    && encoded.startsWith(VIEWPOINT_V2_PREFIX + V2_SEPARATOR);


const parseV2 = (
    encoded: string,
): CameraState | null => {
    const parts = encoded.split(V2_SEPARATOR);
    if (parts.length !== 11 || parts[0] !== VIEWPOINT_V2_PREFIX) {
        return null;
    }

    const numbers = parts.slice(1).map(part => Number(part));
    if (numbers.some(value => !Number.isFinite(value))) {
        return null;
    }

    const [
        yaw,
        pitch,
        scale,
        pivotX,
        pivotY,
        pivotZ,
        offsetX,
        offsetY,
        offsetZ,
        perspective,
    ] = numbers;

    if (scale <= 0 || perspective <= 0) {
        return null;
    }

    return {
        yaw,
        pitch,
        scale,
        pivot: { x: pivotX, y: pivotY, z: pivotZ },
        offset: { x: offsetX, y: offsetY, z: offsetZ },
        perspective,
    };
};


const parseV1 = (
    encoded: string,
): SpaceTransform | null => {
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


/**
 * Decode a viewpoint to the legacy scalars. Returns `null` for anything malformed — so a hand-edited
 * `?v=` is ignored rather than corrupting the view. A v2 string is reduced through `toLegacy` for
 * the given `view` (a default desktop view when omitted).
 */
export const decodeViewpoint = (
    encoded: string | null | undefined,
    view: ViewSize = DEFAULT_VIEW,
): SpaceTransform | null => {
    if (!encoded) {
        return null;
    }

    if (isViewpointV2(encoded)) {
        const camera = parseV2(encoded);
        return camera
            ? cameraEngine.toLegacy(camera, view)
            : null;
    }

    return parseV1(encoded);
};


/**
 * Decode a viewpoint (v1 or v2) to a camera for the given view. The caller's `perspective` wins
 * over the one carried by a v2 string, so a shared link renders with THIS application's lens.
 */
export const decodeCameraViewpoint = (
    encoded: string | null | undefined,
    view: ViewSize,
    perspective?: number,
    limits?: CameraLimits,
): CameraState | null => {
    if (!encoded) {
        return null;
    }

    if (isViewpointV2(encoded)) {
        const camera = parseV2(encoded);
        if (!camera) {
            return null;
        }
        return cameraEngine.clampCamera(
            {
                ...camera,
                perspective: perspective ?? camera.perspective,
            },
            limits,
        );
    }

    const transform = parseV1(encoded);
    if (!transform) {
        return null;
    }

    return cameraEngine.fromLegacy(transform, view, perspective, limits);
};


/** The raw encoded viewpoint in the current URL's `?<param>=`, or `null`. SSR-safe. */
export const readEncodedViewpointFromURL = (
    param: string = VIEWPOINT_PARAM,
): string | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    return new URLSearchParams(window.location.search).get(param);
};


/**
 * Read the viewpoint encoded in the current URL's `?<param>=` as legacy scalars (or `null` if
 * absent/invalid). SSR-safe.
 */
export const readViewpointFromURL = (
    param: string = VIEWPOINT_PARAM,
    view?: ViewSize,
): SpaceTransform | null => decodeViewpoint(readEncodedViewpointFromURL(param), view);


/**
 * Reflect a viewpoint (an encoded string, or legacy scalars encoded as v1) into the URL `?<param>=`
 * via `replaceState` — preserving pathname, other query params, and hash, and NOT pushing a history
 * entry (the transform changes per-frame during orbit; pushState would flood the back-stack). SSR-safe.
 */
export const writeViewpointToURL = (
    viewpoint: SpaceTransform | string,
    param: string = VIEWPOINT_PARAM,
): void => {
    if (typeof window === 'undefined') {
        return;
    }

    const encoded = typeof viewpoint === 'string'
        ? viewpoint
        : encodeViewpoint(viewpoint);

    const url = new URL(window.location.href);
    url.searchParams.set(param, encoded);
    window.history.replaceState(window.history.state, '', url.toString());
};
// #endregion module
