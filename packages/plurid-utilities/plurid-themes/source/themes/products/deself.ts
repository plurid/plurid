// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DESELF,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const deself: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DESELF,

    baseColor: 'hsl(358, 78%, 22%)',
    baseColorInverted: 'hsl(358, 78%, 78%)',

    backgroundColorDark: 'hsl(358, 78%, 10%)',
    backgroundColorBright: 'hsl(358, 78%, 90%)',

    backgroundColorPrimary: 'hsl(358, 78%, 22%)',
    backgroundColorPrimaryAlpha: 'hsla(358, 78%, 22%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(358, 78%, 78%)',

    backgroundColorSecondary: 'hsl(358, 78%, 32%)',
    backgroundColorSecondaryAlpha: 'hsla(358, 78%, 32%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(358, 78%, 68%)',

    backgroundColorTertiary: 'hsl(358, 78%, 42%)',
    backgroundColorTertiaryAlpha: 'hsla(358, 78%, 42%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(358, 78%, 58%)',

    backgroundColorQuaternary: 'hsl(358, 78%, 52%)',
    backgroundColorQuaternaryAlpha: 'hsla(358, 78%, 52%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(358, 78%, 48%)',

    colorPrimary: 'hsl(358, 78%, 97%)',
    colorPrimaryInverted: 'hsl(358, 78%, 3%)',

    colorSecondary: 'hsl(358, 78%, 77%)',
    colorSecondaryInverted: 'hsl(358, 78%, 23%)',

    colorTertiary: 'hsl(358, 78%, 67%)',
    colorTertiaryInverted: 'hsl(358, 78%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(358, 78%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(358, 78%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(358, 78%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(358, 78%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(358, 78%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(358, 78%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(358, 78%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(358, 78%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(358, 78%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default deself;
// #endregion exports
