// #region imports
    // #region internal
    import {
        THEME_NAMES,
        THEME_TYPES,
    } from './constants';

    import {
        Theme,
        ThemeType,
        ThemeName,
    } from './interfaces';

    import {
        decomposeColor,
    } from './utilities';

    import generateTheme from './themes/generate';

    import night from './themes/base/night';
    import dusk from './themes/base/dusk';
    import dawn from './themes/base/dawn';
    import light from './themes/base/light';

    import ponton from './themes/base/ponton';
    import jaune from './themes/base/jaune';
    import furor from './themes/base/furor';

    import deback from './themes/products/deback';
    import decode from './themes/products/decode';
    import defile from './themes/products/defile';
    import deform from './themes/products/deform';
    import delook from './themes/products/delook';
    import deloss from './themes/products/deloss';
    import demail from './themes/products/demail';
    import demand from './themes/products/demand';
    import denote from './themes/products/denote';
    import depack from './themes/products/depack';
    import depict from './themes/products/depict';
    import deself from './themes/products/deself';
    import desite from './themes/products/desite';
    import detime from './themes/products/detime';
    import detour from './themes/products/detour';
    import detune from './themes/products/detune';
    import deturn from './themes/products/deturn';
    import deveil from './themes/products/deveil';
    import devert from './themes/products/devert';
    import deview from './themes/products/deview';
    import dewiki from './themes/products/dewiki';

    import plurid from './themes/products/plurid';
    // #endregion internal
// #endregion imports



// #region exports
export {
    /** interfaces */
    Theme,
    ThemeType,
    ThemeName,

    /** constants */
    THEME_NAMES,
    THEME_TYPES,

    /** functions */
    generateTheme,
    decomposeColor,

    /** themes */
    /** base */
    night,
    dusk,
    dawn,
    light,

    ponton,
    jaune,
    furor,

    /** product */
    deback,
    decode,
    defile,
    deform,
    delook,
    deloss,
    demail,
    demand,
    denote,
    depack,
    depict,
    deself,
    desite,
    detime,
    detour,
    detune,
    deturn,
    deveil,
    devert,
    deview,
    dewiki,

    plurid,
};


const themes = {
    night,
    dusk,
    dawn,
    light,

    ponton,
    jaune,
    furor,

    deback,
    decode,
    defile,
    deform,
    delook,
    deloss,
    demail,
    demand,
    denote,
    depack,
    depict,
    deself,
    desite,
    detime,
    detour,
    detune,
    deturn,
    deveil,
    devert,
    deview,
    dewiki,

    plurid,
};

export default themes;
// #endregion exports
