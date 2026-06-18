// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DETOUR,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const detour: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DETOUR,

    baseColor: 'hsl(197, 68%, 25%)',
    baseColorInverted: 'hsl(197, 68%, 75%)',

    backgroundColorDark: 'hsl(197, 68%, 10%)',
    backgroundColorBright: 'hsl(197, 68%, 90%)',

    backgroundColorPrimary: 'hsl(197, 68%, 25%)',
    backgroundColorPrimaryAlpha: 'hsla(197, 68%, 25%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(197, 68%, 75%)',

    backgroundColorSecondary: 'hsl(197, 68%, 35%)',
    backgroundColorSecondaryAlpha: 'hsla(197, 68%, 35%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(197, 68%, 65%)',

    backgroundColorTertiary: 'hsl(197, 68%, 45%)',
    backgroundColorTertiaryAlpha: 'hsla(197, 68%, 45%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(197, 68%, 55%)',

    backgroundColorQuaternary: 'hsl(197, 68%, 55%)',
    backgroundColorQuaternaryAlpha: 'hsla(197, 68%, 55%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(197, 68%, 45%)',

    colorPrimary: 'hsl(197, 68%, 97%)',
    colorPrimaryInverted: 'hsl(197, 68%, 3%)',

    colorSecondary: 'hsl(197, 68%, 77%)',
    colorSecondaryInverted: 'hsl(197, 68%, 23%)',

    colorTertiary: 'hsl(197, 68%, 67%)',
    colorTertiaryInverted: 'hsl(197, 68%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(197, 68%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(197, 68%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(197, 68%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(197, 68%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(197, 68%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(197, 68%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(197, 68%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(197, 68%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(197, 68%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default detour;
// #endregion exports
