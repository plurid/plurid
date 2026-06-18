// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_GENERATED,
        THEME_TYPES,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';

    import {
        parseHSL,
        invertColor,
    } from './utilities';
// #endregion imports



// #region module
/**
 * Based on the type and the baseColor generates a Theme.
 *
 * @param type 'dark' or 'bright'
 * @param baseColor HSL format, e.g. hsl(220, 20%, 40%)
 */
const generateTheme = (
    type: keyof typeof THEME_TYPES,
    baseColor: string,
): Theme | undefined => {
    if (!Object.keys(THEME_TYPES).includes(type)) {
        return;
    }

    const hslBaseColor = parseHSL(baseColor);
    if (!hslBaseColor) {
        return;
    }
    const saturation = hslBaseColor.saturation();
    const hue = hslBaseColor.hue();
    const lightness = hslBaseColor.lightness();

    const hslBaseColorInverted = invertColor(hslBaseColor);
    const baseColorInverted = hslBaseColorInverted.display();

    const backgroundColorDark = `hsl(${saturation}, ${hue}%, 10%)`;
    const backgroundColorBright = `hsl(${saturation}, ${hue}%, 90%)`;

    const backgroundColorPrimary = `hsl(${saturation}, ${hue}%, ${lightness}%)`;
    const backgroundColorPrimaryAlpha = `hsl(${saturation}, ${hue}%, ${lightness}%, 0.4)`;
    const backgroundColorPrimaryInverted = `hsl(${saturation}, ${hue}%, ${100 - lightness}%)`;

    const backgroundColorSecondary = '';
    const backgroundColorSecondaryAlpha = '';
    const backgroundColorSecondaryInverted = '';

    const backgroundColorTertiary = '';
    const backgroundColorTertiaryAlpha = '';
    const backgroundColorTertiaryInverted = '';

    const backgroundColorQuaternary = '';
    const backgroundColorQuaternaryAlpha = '';
    const backgroundColorQuaternaryInverted = '';

    const colorPrimary = '';
    const colorPrimaryInverted = '';

    const colorSecondary = '';
    const colorSecondaryInverted = '';

    const colorTertiary = '';
    const colorTertiaryInverted = '';

    const boxShadowUmbra = '';
    const boxShadowUmbraColor = '';
    const boxShadowUmbraInset = '';

    const boxShadowPenumbra = '';
    const boxShadowPenumbraColor = '';
    const boxShadowPenumbraInset = '';

    const boxShadowAntumbra = '';
    const boxShadowAntumbraColor = '';
    const boxShadowAntumbraInset = '';


    const theme: Theme = {
        type,
        name: THEME_NAME_GENERATED,

        baseColor,
        baseColorInverted,

        backgroundColorDark,
        backgroundColorBright,

        backgroundColorPrimary,
        backgroundColorPrimaryAlpha,
        backgroundColorPrimaryInverted,

        backgroundColorSecondary,
        backgroundColorSecondaryAlpha,
        backgroundColorSecondaryInverted,

        backgroundColorTertiary,
        backgroundColorTertiaryAlpha,
        backgroundColorTertiaryInverted,

        backgroundColorQuaternary,
        backgroundColorQuaternaryAlpha,
        backgroundColorQuaternaryInverted,

        colorPrimary,
        colorPrimaryInverted,

        colorSecondary,
        colorSecondaryInverted,

        colorTertiary,
        colorTertiaryInverted,


        boxShadowUmbra,
        boxShadowUmbraColor,
        boxShadowUmbraInset,

        boxShadowPenumbra,
        boxShadowPenumbraColor,
        boxShadowPenumbraInset,

        boxShadowAntumbra,
        boxShadowAntumbraColor,
        boxShadowAntumbraInset,

        ...fontFamily,
    };

    return theme;
}
// #endregion module



// #region exports
export default generateTheme;
// #endregion exports
