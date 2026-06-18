// #region imports
    import {
        parseHSL,
    } from '../themes/generate/utilities';
// #endregion imports



// #region module
export interface DecomposedColor {
    hue: number;
    saturation: number;
    lightness: number;
    alpha: number;
}


/**
 * Decomposes a `colorString` into its constituents: hue, saturation, and lightness.
 *
 *
 * @param colorString
 */
export const decomposeColor = (
    colorString: string,
): DecomposedColor | undefined => {
    const decomposed = parseHSL(colorString);

    if (!decomposed) {
        return;
    }

    const hue = decomposed.hue();
    const saturation = decomposed.saturation();
    const lightness = decomposed.lightness();

    const decomposedAlpha = decomposed.alpha();
    const alpha = decomposedAlpha
        ? decomposedAlpha
        : 1;

    return {
        hue,
        saturation,
        lightness,
        alpha,
    };
}
// #endregion module
