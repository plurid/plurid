// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_TYPE_DARK,
        THEME_NAME_DEWIKI,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const dewiki: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DEWIKI,

    baseColor: 'hsl(0, 81%, 23%)',
    baseColorInverted: 'hsl(0, 81%, 77%)',

    backgroundColorDark: 'hsl(0, 81%, 10%)',
    backgroundColorBright: 'hsl(0, 81%, 90%)',

    backgroundColorPrimary: 'hsl(0, 81%, 23%)',
    backgroundColorPrimaryAlpha: 'hsla(0, 81%, 23%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(0, 81%, 77%)',

    backgroundColorSecondary: 'hsl(0, 81%, 30%)',
    backgroundColorSecondaryAlpha: 'hsla(0, 81%, 30%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(0, 81%, 70%)',

    backgroundColorTertiary: 'hsl(0, 81%, 40%)',
    backgroundColorTertiaryAlpha: 'hsla(0, 81%, 40%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(0, 81%, 04%)',

    backgroundColorQuaternary: 'hsl(0, 81%, 50%)',
    backgroundColorQuaternaryAlpha: 'hsla(0, 81%, 50%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(0, 81%, 50%)',

    colorPrimary: 'hsl(0, 7%, 97%)',
    colorPrimaryInverted: 'hsl(0, 7%, 3%)',

    colorSecondary: 'hsl(0, 7%, 77%)',
    colorSecondaryInverted: 'hsl(0, 7%, 23%)',

    colorTertiary: 'hsl(0, 7%, 67%)',
    colorTertiaryInverted: 'hsl(0, 7%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(0, 81%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(0, 81%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(0, 81%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(0, 81%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(0, 81%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(0, 81%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(0, 81%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(0, 81%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(0, 81%, 10%, 0.9)',

    ...fontFamily,
};
// #endregion module



// #region exports
export default dewiki;
// #endregion exports
