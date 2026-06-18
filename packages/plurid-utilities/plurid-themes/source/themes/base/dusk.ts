// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DUSK,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const dusk: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DUSK,

    baseColor: 'hsl(220, 2%, 15%)',
    baseColorInverted: 'hsl(220, 2%, 85%)',

    backgroundColorDark: 'hsl(220, 2%, 10%)',
    backgroundColorBright: 'hsl(220, 2%, 90%)',

    backgroundColorPrimary: 'hsl(220, 2%, 15%)',
    backgroundColorPrimaryAlpha: 'hsla(220, 2%, 15%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(220, 2%, 85%)',

    backgroundColorSecondary: 'hsl(220, 2%, 25%)',
    backgroundColorSecondaryAlpha: 'hsla(220, 2%, 25%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(220, 2%, 75%)',

    backgroundColorTertiary: 'hsl(220, 2%, 35%)',
    backgroundColorTertiaryAlpha: 'hsla(220, 2%, 35%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(220, 2%, 65%)',

    backgroundColorQuaternary: 'hsl(220, 2%, 45%)',
    backgroundColorQuaternaryAlpha: 'hsla(220, 2%, 45%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(220, 2%, 55%)',

    colorPrimary: 'hsl(220, 2%, 95%)',
    colorPrimaryInverted: 'hsl(220, 2%, 5%)',

    colorSecondary: 'hsl(220, 2%, 65%)',
    colorSecondaryInverted: 'hsl(220, 2%, 35%)',

    colorTertiary: 'hsl(220, 2%, 55%)',
    colorTertiaryInverted: 'hsl(220, 2%, 45%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(220, 2%, 5%, 0.8)',
    boxShadowUmbraColor: 'hsla(220, 2%, 5%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(220, 2%, 5%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(220, 2%, 5%, 0.8)',
    boxShadowPenumbraColor: 'hsla(220, 2%, 5%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(220, 2%, 5%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(220, 2%, 5%, 0.8)',
    boxShadowAntumbraColor: 'hsla(220, 2%, 5%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(220, 2%, 5%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default dusk;
// #endregion exports
