// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DEBACK,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const deback: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DEBACK,

    baseColor: 'hsl(211, 100%, 15%)',
    baseColorInverted: 'hsl(211, 100%, 85%)',

    backgroundColorDark: 'hsl(211, 100%, 10%)',
    backgroundColorBright: 'hsl(211, 100%, 90%)',

    backgroundColorPrimary: 'hsl(211, 100%, 15%)',
    backgroundColorPrimaryAlpha: 'hsla(211, 100%, 15%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(211, 100%, 85%)',

    backgroundColorSecondary: 'hsl(211, 100%, 25%)',
    backgroundColorSecondaryAlpha: 'hsla(211, 100%, 25%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(211, 100%, 75%)',

    backgroundColorTertiary: 'hsl(211, 100%, 35%)',
    backgroundColorTertiaryAlpha: 'hsla(211, 100%, 35%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(211, 100%, 75%)',

    backgroundColorQuaternary: 'hsl(211, 100%, 45%)',
    backgroundColorQuaternaryAlpha: 'hsla(211, 100%, 45%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(211, 100%, 55%)',

    colorPrimary: 'hsl(211, 100%, 97%)',
    colorPrimaryInverted: 'hsl(211, 100%, 3%)',

    colorSecondary: 'hsl(211, 100%, 77%)',
    colorSecondaryInverted: 'hsl(211, 100%, 23%)',

    colorTertiary: 'hsl(211, 100%, 67%)',
    colorTertiaryInverted: 'hsl(211, 100%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(211, 100%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(211, 100%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(211, 100%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(211, 100%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(211, 100%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(211, 100%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(211, 100%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(211, 100%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(211, 100%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default deback;
// #endregion exports
