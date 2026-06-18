// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DEMAND,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const demand: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DEMAND,

    baseColor: 'hsl(172, 82%, 24%)',
    baseColorInverted: 'hsl(172, 82%, 76%)',

    backgroundColorDark: 'hsl(172, 82%, 10%)',
    backgroundColorBright: 'hsl(172, 82%, 90%)',

    backgroundColorPrimary: 'hsl(172, 82%, 24%)',
    backgroundColorPrimaryAlpha: 'hsla(172, 82%, 24%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(172, 82%, 76%)',

    backgroundColorSecondary: 'hsl(172, 82%, 34%)',
    backgroundColorSecondaryAlpha: 'hsla(172, 82%, 34%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(172, 82%, 66%)',

    backgroundColorTertiary: 'hsl(172, 82%, 44%)',
    backgroundColorTertiaryAlpha: 'hsla(172, 82%, 44%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(172, 82%, 56%)',

    backgroundColorQuaternary: 'hsl(172, 82%, 55%)',
    backgroundColorQuaternaryAlpha: 'hsla(172, 82%, 55%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(172, 82%, 45%)',

    colorPrimary: 'hsl(172, 82%, 97%)',
    colorPrimaryInverted: 'hsl(172, 82%, 3%)',

    colorSecondary: 'hsl(172, 82%, 77%)',
    colorSecondaryInverted: 'hsl(172, 82%, 23%)',

    colorTertiary: 'hsl(172, 82%, 67%)',
    colorTertiaryInverted: 'hsl(172, 82%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(172, 82%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(172, 82%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(172, 82%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(172, 82%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(172, 82%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(172, 82%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(172, 82%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(172, 82%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(172, 82%, 10%, 0.9)',

    ...fontFamily,
};
// #endregion module



// #region exports
export default demand;
// #endregion exports
