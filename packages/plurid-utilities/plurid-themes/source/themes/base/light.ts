// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_LIGHT,
        THEME_TYPE_BRIGHT,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const light: Theme = {
    type: THEME_TYPE_BRIGHT,
    name: THEME_NAME_LIGHT,

    baseColor: 'hsl(220, 2%, 97%)',
    baseColorInverted: 'hsl(220, 2%, 3%)',

    backgroundColorDark: 'hsl(220, 2%, 10%)',
    backgroundColorBright: 'hsl(220, 2%, 90%)',

    backgroundColorPrimary: 'hsl(220, 2%, 97%)',
    backgroundColorPrimaryAlpha: 'hsla(220, 2%, 97%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(220, 2%, 3%)',

    backgroundColorSecondary: 'hsl(220, 2%, 77%)',
    backgroundColorSecondaryAlpha: 'hsla(220, 2%, 77%, 0.4)',
    backgroundColorSecondaryInverted: 'hsla(220, 2%, 77%, 0.4)',

    backgroundColorTertiary: 'hsl(220, 2%, 57%)',
    backgroundColorTertiaryAlpha: 'hsla(220, 2%, 57%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(220, 2%, 43%)',

    backgroundColorQuaternary: 'hsl(220, 2%, 47%)',
    backgroundColorQuaternaryAlpha: 'hsla(220, 2%, 47%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(220, 2%, 53%)',

    colorPrimary: 'hsl(220, 2%, 10%)',
    colorPrimaryInverted: 'hsl(220, 2%, 90%)',

    colorSecondary: 'hsl(220, 2%, 40%)',
    colorSecondaryInverted: 'hsl(220, 2%, 60%)',

    colorTertiary: 'hsl(220, 2%, 65%)',
    colorTertiaryInverted: 'hsl(220, 2%, 35%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(220, 2%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(220, 2%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(220, 2%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(220, 2%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(220, 2%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(220, 2%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(220, 2%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(220, 2%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(220, 2%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default light;
// #endregion exports
