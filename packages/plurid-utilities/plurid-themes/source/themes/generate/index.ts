// #region imports
    import {
        parseColor,
        deriveLook,
        themeFromLook,
    } from '../../looks';
    import {
        Theme,
    } from '../../interfaces';

    import {
        THEME_NAME_GENERATED,
        THEME_TYPES,
    } from '../../constants';


// #endregion imports



// #region module
/**
 * @deprecated A look is the way to make a theme from a colour: `themeFromLook(deriveLook(base))`,
 * or give the application `look: { scheme, space, surface, ink, accent }`. Kept for one release as a
 * shim over that derivation: the base colour is the space and the surface, the ink and the accent are
 * the scheme's defaults. Returns `undefined` for an unknown type or an unparsable colour, as before.
 *
 * @param type 'dark' or 'bright'
 * @param baseColor any CSS colour, e.g. hsl(220, 20%, 40%)
 */
const generateTheme = (
    type: keyof typeof THEME_TYPES,
    baseColor: string,
): Theme | undefined => {
    if (!Object.keys(THEME_TYPES).includes(type)) {
        return;
    }
    if (!parseColor(baseColor)) {
        return;
    }
    const dark = type === 'dark';
    const look = deriveLook({
        scheme: dark ? 'dark' : 'light',
        space: baseColor,
        surface: baseColor,
        ink: dark ? '#ffffff' : '#141414',
        accent: dark ? '#4da3ff' : '#1f6feb',
    }, THEME_NAME_GENERATED);
    return {
        ...themeFromLook(look),
        name: THEME_NAME_GENERATED,
        baseColor,
    };
};
// #endregion module




// #region exports
export default generateTheme;
// #endregion exports
