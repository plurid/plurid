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
    const configuredWidth = configuration.elements.plane.width;
    const configuredHeight = configuration.elements.plane.height;
    const width = mathematics.numbers.checkIntegerNonUnit(configuredWidth)
        ? configuredWidth
        : configuredWidth * view.width;
    const height = configuredHeight === undefined || configuredHeight <= 0
        ? 0
        : (mathematics.numbers.checkIntegerNonUnit(configuredHeight)
            ? configuredHeight
            : configuredHeight * view.height);
    return {
        width,
        height,
    };
};
// #endregion module



// #region exports
export default configuredPlaneSize;
// #endregion exports
