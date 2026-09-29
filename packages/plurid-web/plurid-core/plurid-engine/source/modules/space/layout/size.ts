// #region imports
    // #region libraries
    import {
        PluridConfiguration,
        ViewSize,
    } from '@plurid/plurid-data';
    import {
        mathematics,
    } from '@plurid/plurid-functions';
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
 * The size an UNDECLARED plane renders at, from `elements.plane.width` / `height`: a value up to 1
 * is a fraction of the view, above 1 px (`checkIntegerNonUnit`). The one place both readers agree.
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
 * A configured dimension WITHOUT a view: unset or ≤ 0 → `undefined` (content-driven); an integer
 * above 1 → px; else a fraction of the view. What a render that has no measured view yet (the
 * server's, and the hydrating client's first) can state exactly, where a px size would be a guess.
 */
export const configuredPlaneExtent = (
    configured: number | undefined,
): PlaneExtent | undefined => {
    if (configured === undefined || configured <= 0) {
        return undefined;
    }
    if (mathematics.numbers.checkIntegerNonUnit(configured)) {
        return { px: configured };
    }
    return { fraction: configured };
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
