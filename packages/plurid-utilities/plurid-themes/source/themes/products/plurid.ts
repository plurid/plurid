// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_PLURID,
        THEME_TYPE_BRIGHT,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const plurid: Theme = {
    type: THEME_TYPE_BRIGHT,
    name: THEME_NAME_PLURID,

    baseColor: 'hsl(220, 10%, 32%)',
    baseColorInverted: 'hsl(220, 10%, 68%)',

    backgroundColorDark: 'hsl(220, 10%, 10%)',
    backgroundColorBright: 'hsl(220, 10%, 90%)',

    backgroundColorPrimary: 'hsl(220, 10%, 32%)',
    backgroundColorPrimaryAlpha: 'hsla(220, 10%, 32%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(220, 10%, 68%)',

    backgroundColorSecondary: 'hsl(220, 10%, 26%)',
    backgroundColorSecondaryAlpha: 'hsla(220, 10%, 26%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(220, 10%, 74%)',

    backgroundColorTertiary: 'hsl(220, 10%, 18%)',
    backgroundColorTertiaryAlpha: 'hsla(220, 10%, 18%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(220, 10%, 82%)',

    backgroundColorQuaternary: 'hsl(220, 10%, 12%)',
    backgroundColorQuaternaryAlpha: 'hsla(220, 10%, 12%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(220, 10%, 88%)',

    colorPrimary: 'hsl(220, 10%, 97%)',
    colorPrimaryInverted: 'hsl(220, 10%, 3%)',

    colorSecondary: 'hsl(220, 10%, 80%)',
    colorSecondaryInverted: 'hsl(220, 10%, 20%)',

    colorTertiary: 'hsl(220, 10%, 60%)',
    colorTertiaryInverted: 'hsl(220, 10%, 40%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(220, 10%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(220, 10%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(220, 10%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(220, 10%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(220, 10%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(220, 10%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(220, 10%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(220, 10%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(220, 10%, 10%, 0.9)',

    ...fontFamily,
};
// #endregion module



// #region exports
export default plurid;
// #endregion exports
