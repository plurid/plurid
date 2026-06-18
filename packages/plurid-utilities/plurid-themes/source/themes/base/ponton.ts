// #region imports
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_PONTON,
        THEME_TYPE_DARK,
    } from '../../constants';

    import {
        fontFamily,
    } from '../general';
// #endregion imports



// #region module
const ponton: Theme = {
    type: THEME_TYPE_DARK,
    name: THEME_NAME_PONTON,

    baseColor: 'hsl(247, 19%, 19%)',
    baseColorInverted: 'hsl(247, 19%, 61%)',

    backgroundColorDark: 'hsl(247, 19%, 10%)',
    backgroundColorBright: 'hsl(247, 19%, 90%)',

    backgroundColorPrimary: 'hsl(247, 19%, 19%)',
    backgroundColorPrimaryAlpha: 'hsla(247, 19%, 19%, 0.4)',
    backgroundColorPrimaryInverted: 'hsl(247, 19%, 81%)',

    backgroundColorSecondary: 'hsl(247, 19%, 29%)',
    backgroundColorSecondaryAlpha: 'hsla(247, 19%, 29%, 0.4)',
    backgroundColorSecondaryInverted: 'hsl(247, 19%, 71%)',

    backgroundColorTertiary: 'hsl(247, 19%, 39%)',
    backgroundColorTertiaryAlpha: 'hsla(247, 19%, 39%, 0.4)',
    backgroundColorTertiaryInverted: 'hsl(247, 19%, 61%)',

    backgroundColorQuaternary: 'hsl(247, 19%, 9%)',
    backgroundColorQuaternaryAlpha: 'hsla(247, 19%, 9%, 0.4)',
    backgroundColorQuaternaryInverted: 'hsl(247, 19%, 91%)',

    colorPrimary: 'hsl(247, 7%, 97%)',
    colorPrimaryInverted: 'hsl(247, 7%, 3%)',

    colorSecondary: 'hsl(247, 7%, 80%)',
    colorSecondaryInverted: 'hsl(247, 7%, 20%)',

    colorTertiary: 'hsl(247, 7%, 60%)',
    colorTertiaryInverted: 'hsl(247, 7%, 40%)',


    boxShadowUmbra: '0px 3px 6px 0px hsla(247, 94%, 10%, 0.8)',
    boxShadowUmbraColor: 'hsla(247, 94%, 10%, 0.8)',
    boxShadowUmbraInset: 'inset 0px -3px 4px 0px hsla(247, 94%, 10%, 0.9)',

    boxShadowPenumbra: '0px 3px 12px 0px hsla(247, 94%, 10%, 0.8)',
    boxShadowPenumbraColor: 'hsla(247, 94%, 10%, 0.8)',
    boxShadowPenumbraInset: 'inset 0px -3px 6px 0px hsla(247, 94%, 10%, 0.9)',

    boxShadowAntumbra: '0px 3px 18px 0px hsla(247, 94%, 10%, 0.8)',
    boxShadowAntumbraColor: 'hsla(247, 94%, 10%, 0.8)',
    boxShadowAntumbraInset: 'inset 0px -3px 8px 0px hsla(247, 94%, 10%, 0.9)',


    ...fontFamily,
};
// #endregion module



// #region exports
export default ponton;
// #endregion exports
