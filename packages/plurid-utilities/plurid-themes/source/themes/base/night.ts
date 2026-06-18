// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_NIGHT,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const night: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_NIGHT,

    baseColor: 'hsl(220, 2%, 4%)',
    baseColorInverted: 'hsl(220, 2%, 96%)',

    backgroundColorDark: 'hsl(220, 2%, 10%)',
    backgroundColorBright: 'hsl(220, 2%, 90%)',

    backgroundColorPrimary: 'hsl(220, 2%, 4%)',
    backgroundColorPrimaryAlpha: 'hsla(220, 2%, 4%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(220, 2%, 96%)',

    backgroundColorSecondary: 'hsl(220, 2%, 9%)',
    backgroundColorSecondaryAlpha: 'hsla(220, 2%, 9%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(220, 2%, 91%)',

    backgroundColorTertiary: 'hsl(220, 2%, 14%)',
    backgroundColorTertiaryAlpha: 'hsla(220, 2%, 14%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(220, 2%, 86%)',

    backgroundColorQuaternary: 'hsl(220, 2%, 19%)',
    backgroundColorQuaternaryAlpha: 'hsla(220, 2%, 19%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(220, 2%, 81%)',

    colorPrimary: 'hsl(220, 2%, 87%)',
    colorPrimaryInverted: 'hsl(220, 2%, 13%)',

    colorSecondary: 'hsl(220, 2%, 67%)',
    colorSecondaryInverted: 'hsl(220, 2%, 23%)',

    colorTertiary: 'hsl(220, 2%, 47%)',
    colorTertiaryInverted: 'hsl(220, 2%, 53%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(220, 2%, 0%, 0.8)',
    boxShadowUmbraColor: 'hsla(220, 2%, 0%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(220, 2%, 0%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(220, 2%, 0%, 0.8)',
    boxShadowPenumbraColor: 'hsla(220, 2%, 0%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(220, 2%, 0%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(220, 2%, 0%, 0.8)',
    boxShadowAntumbraColor: 'hsla(220, 2%, 0%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(220, 2%, 0%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default night;
// #endregion exports
