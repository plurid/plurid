// #region imports
    // #region libraries
    import {
        PluridConfiguration,
        ViewSize,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export interface ConfiguredPlaneSize {
    width: number;
    /** 0 = content-driven (no configured height). */
    height: number;
    /** The cap of a content-driven height; 0 = none. */
    maxHeight: number;
}


/**
 * THE ONE RULE FOR A CONFIGURED LENGTH: a fraction (of the view for a plane's size, of the plane's
 * width for a gap or a depth step) is 1, or a number with a decimal of at most `FRACTION_LIMIT`;
 * anything else is px. Every number with a decimal was a fraction (`checkIntegerNonUnit`), so a px
 * size with one (460.5, a measured width passed on) was 460.5 views wide, and a 12.5 px gap twelve
 * and a half planes (2026-10-20).
 */
export const FRACTION_LIMIT = 4;

export const isFractionalLength = (
    value: number,
): boolean => value === 1 || (!Number.isInteger(value) && Math.abs(value) <= FRACTION_LIMIT);

/** A configured length in px: a fraction of `extent` (`isFractionalLength`), else the value itself. */
export const lengthInPx = (
    value: number,
    extent: number,
): number => isFractionalLength(value) ? value * extent : value;


/**
 * The size an UNDECLARED plane renders at, from `elements.plane.width` / `height`: a fraction of the
 * view, or px (`isFractionalLength`). The one place both readers agree.
 */
export const configuredPlaneSize = (
    configuration: PluridConfiguration,
    view: ViewSize,
): ConfiguredPlaneSize => {
    return {
        width: resolveDimension(configuration.elements.plane.width, view.width),
        height: resolveDimension(configuration.elements.plane.height, view.height),
        maxHeight: resolveDimension(configuration.elements.plane.maxHeight, view.height),
    };
};

/** A configured dimension in the view's own terms: a fraction of the view's extent, or a length in px. */
export type PlaneExtent =
    | { fraction: number }
    | { px: number };

/**
 * A configured dimension WITHOUT a view: unset or ≤ 0 → `undefined` (content-driven); a fraction of
 * the view, or px (`isFractionalLength`). What a render that has no measured view yet (the server's,
 * and the hydrating client's first) can state exactly, where a px size would be a guess.
 */
export const configuredPlaneExtent = (
    configured: number | undefined,
): PlaneExtent | undefined => {
    if (configured === undefined || configured <= 0) {
        return undefined;
    }
    if (isFractionalLength(configured)) {
        return { fraction: configured };
    }
    return { px: configured };
};

/** A configured dimension against the view's: 0 where it is left to the content. */
const resolveDimension = (
    configured: number | undefined,
    viewExtent: number,
): number => {
    const extent = configuredPlaneExtent(configured);
    if (!extent) {
        return 0;
    }
    return 'px' in extent ? extent.px : extent.fraction * viewExtent;
};

/**
 * THE SIZE AN UNMEASURED PLANE IS PLACED AT: the configured width, and where the configuration
 * leaves the height to the content, a reading proportion of the width (0.7, at least 200). The
 * layouts used to pitch an unmeasured root by the VIEW's height (840 on a server), so a space
 * booted with its rows a screen apart and jumped when the first measurement came in.
 */
export const fallbackPlaneSize = (
    configuration: PluridConfiguration,
    view: ViewSize,
): { width: number; height: number } => {
    const configured = configuredPlaneSize(configuration, view);
    return {
        width: configured.width,
        height: configured.height || Math.max(200, Math.round(configured.width * 0.7)),
    };
};

// #endregion module



// #region exports
export default configuredPlaneSize;
// #endregion exports
