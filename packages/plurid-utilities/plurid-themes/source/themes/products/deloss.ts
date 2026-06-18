// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DELOSS,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const deloss: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DELOSS,

    baseColor: 'hsl(214, 16%, 26%)',
    baseColorInverted: 'hsl(214, 16%, 74%)',

    backgroundColorDark: 'hsl(214, 16%, 10%)',
    backgroundColorBright: 'hsl(214, 16%, 90%)',

    backgroundColorPrimary: 'hsl(214, 16%, 26%)',
    backgroundColorPrimaryAlpha: 'hsla(214, 16%, 26%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(214, 16%, 74%)',

    backgroundColorSecondary: 'hsl(214, 16%, 34%)',
    backgroundColorSecondaryAlpha: 'hsla(214, 16%, 34%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(214, 16%, 16%)',

    backgroundColorTertiary: 'hsl(214, 16%, 44%)',
    backgroundColorTertiaryAlpha: 'hsla(214, 16%, 44%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(214, 16%, 56%)',

    backgroundColorQuaternary: 'hsl(214, 16%, 55%)',
    backgroundColorQuaternaryAlpha: 'hsla(214, 16%, 55%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(214, 16%, 45%)',

    colorPrimary: 'hsl(214, 16%, 97%)',
    colorPrimaryInverted: 'hsl(214, 16%, 3%)',

    colorSecondary: 'hsl(214, 16%, 77%)',
    colorSecondaryInverted: 'hsl(214, 16%, 23%)',

    colorTertiary: 'hsl(214, 16%, 67%)',
    colorTertiaryInverted: 'hsl(214, 16%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(214, 16%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(214, 16%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(214, 16%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(214, 16%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(214, 16%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(214, 16%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(214, 16%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(214, 16%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(214, 16%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default deloss;
// #endregion exports
