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
// #endregion module



// #region exports
export default configuredPlaneSize;
// #endregion exports
