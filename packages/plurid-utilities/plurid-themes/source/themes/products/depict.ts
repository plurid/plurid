// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_DEPICT,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const depict: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_DEPICT,

    baseColor: 'hsl(327, 94%, 20%)',
    baseColorInverted: 'hsl(327, 94%, 80%)',

    backgroundColorDark: 'hsl(327, 94%, 10%)',
    backgroundColorBright: 'hsl(327, 94%, 90%)',

    backgroundColorPrimary: 'hsl(327, 94%, 20%)',
    backgroundColorPrimaryAlpha: 'hsla(327, 94%, 20%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(327, 94%, 80%)',

    backgroundColorSecondary: 'hsl(327, 94%, 30%)',
    backgroundColorSecondaryAlpha: 'hsla(327, 94%, 30%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(327, 94%, 70%)',

    backgroundColorTertiary: 'hsl(327, 94%, 37%)',
    backgroundColorTertiaryAlpha: 'hsla(327, 94%, 37%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(327, 94%, 63%)',

    backgroundColorQuaternary: 'hsl(327, 94%, 47%)',
    backgroundColorQuaternaryAlpha: 'hsla(327, 94%, 47%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(327, 94%, 53%)',

    colorPrimary: 'hsl(327, 7%, 97%)',
    colorPrimaryInverted: 'hsl(327, 7%, 3%)',

    colorSecondary: 'hsl(327, 7%, 77%)',
    colorSecondaryInverted: 'hsl(327, 7%, 23%)',

    colorTertiary: 'hsl(327, 7%, 67%)',
    colorTertiaryInverted: 'hsl(327, 7%, 33%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(327, 94%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(327, 94%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(327, 94%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(327, 94%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(327, 94%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(327, 94%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(327, 94%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(327, 94%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(327, 94%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default depict;
// #endregion exports
