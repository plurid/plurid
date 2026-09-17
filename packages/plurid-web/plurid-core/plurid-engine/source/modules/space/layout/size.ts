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

/** A configured dimension against the view's: unset or ≤ 0 → 0 (content-driven); an integer above 1 → px; else a fraction. */
const resolveDimension = (
    configured: number | undefined,
    viewExtent: number,
): number => {
    if (configured === undefined || configured <= 0) {
        return 0;
    }
    if (mathematics.numbers.checkIntegerNonUnit(configured)) {
        return configured;
    }
    return configured * viewExtent;
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
