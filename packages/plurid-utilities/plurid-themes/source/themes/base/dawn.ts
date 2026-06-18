// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DAWN,
        THEME_TYPE_BRIGHT,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const dawn: Theme = {
    type: THEME_TYPE_BRIGHT,
    name: THEME_NAME_DAWN,

    baseColor: 'hsl(220, 2%, 70%)',
    baseColorInverted: 'hsl(220, 2%, 30%)',

    backgroundColorDark: 'hsl(220, 2%, 10%)',
    backgroundColorBright: 'hsl(220, 2%, 90%)',

    backgroundColorPrimary: 'hsl(220, 2%, 70%)',
    backgroundColorPrimaryAlpha: 'hsla(220, 2%, 70%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(220, 2%, 30%)',

    backgroundColorSecondary: 'hsl(220, 2%, 55%)',
    backgroundColorSecondaryAlpha: 'hsla(220, 2%, 55%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(220, 2%, 45%)',

    backgroundColorTertiary: 'hsl(220, 2%, 40%)',
    backgroundColorTertiaryAlpha: 'hsla(240, 13%, 40%, 0.3)',
    backgroundColorTertiaryInverted: 'hsl(220, 2%, 60%)',

    backgroundColorQuaternary: 'hsl(220, 2%, 30%)',
    backgroundColorQuaternaryAlpha: 'hsla(220, 2%, 30%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(220, 2%, 70%)',

    colorPrimary: 'hsl(220, 7%, 15%)',
    colorPrimaryInverted: 'hsl(220, 7%, 85%)',

    colorSecondary: 'hsl(220, 7%, 40%)',
    colorSecondaryInverted: 'hsl(220, 7%, 60%)',

    colorTertiary: 'hsl(220, 7%, 65%)',
    colorTertiaryInverted: 'hsl(220, 7%, 35%)',


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
export default dawn;
// #endregion exports
