// #region imports
    // #region external
    import {
        Theme,
    } from '../interfaces';
    // #endregion external

    // #region internal
    import {
        Look,
    } from './interfaces';
    import {
        withAlpha,
        shiftLightness,
    } from './color';
    // #endregion internal
// #endregion imports



// #region module
/**
 * The legacy `Theme` a look implies, so what still reads a `Theme` — a plane's default sheet, the
 * toolbar drawers' inputs from plurid-ui-components, a host that never moved — matches the look
 * without knowing it. The fields the chrome used to read are derived from the tokens; the rest are
 * given sensible neighbours (the legacy interface has 41 fields, the chrome read 16).
 */
export const themeFromLook = (
    look: Look,
): Theme => {
    const { tokens } = look;
    const dark = tokens.scheme === 'dark';
    const tertiary = shiftLightness(tokens.surfaceSolid, dark ? 0.06 : -0.05);
    const quaternary = shiftLightness(tokens.surfaceSolid, dark ? 0.1 : -0.09);
    const inset = (shadow: string) => 'inset ' + shadow;

    return {
        type: dark ? 'dark' : 'bright',
        name: 'plurid',

        baseColor: tokens.space,
        baseColorInverted: tokens.ink,

        backgroundColorDark: dark ? tokens.space : tokens.ink,
        backgroundColorBright: dark ? tokens.ink : tokens.space,

        backgroundColorPrimary: tokens.plane,
        backgroundColorPrimaryAlpha: withAlpha(tokens.plane, 0.6),
        backgroundColorPrimaryInverted: tokens.ink,

        backgroundColorSecondary: tokens.surfaceSolid,
        backgroundColorSecondaryAlpha: tokens.surface,
        backgroundColorSecondaryInverted: tokens.inkMuted,

        backgroundColorTertiary: tertiary,
        backgroundColorTertiaryAlpha: tokens.surfaceStrong,
        backgroundColorTertiaryInverted: tokens.inkFaint,

        backgroundColorQuaternary: quaternary,
        backgroundColorQuaternaryAlpha: withAlpha(quaternary, 0.7),
        backgroundColorQuaternaryInverted: tokens.plane,

        colorPrimary: tokens.ink,
        colorPrimaryInverted: tokens.space,

        colorSecondary: tokens.inkMuted,
        colorSecondaryInverted: tokens.plane,

        colorTertiary: tokens.inkFaint,
        colorTertiaryInverted: tokens.surfaceSolid,

        boxShadowUmbra: tokens.shadow,
        boxShadowUmbraColor: tokens.halo,
        boxShadowUmbraInset: inset(tokens.shadow),

        boxShadowPenumbra: tokens.planeShadow,
        boxShadowPenumbraColor: tokens.halo,
        boxShadowPenumbraInset: inset(tokens.planeShadow),

        boxShadowAntumbra: tokens.planeShadow,
        boxShadowAntumbraColor: tokens.halo,
        boxShadowAntumbraInset: inset(tokens.planeShadow),

        fontFamilySansSerif: tokens.font,
        fontFamilySerif: "ui-serif, Georgia, 'Times New Roman', serif",
        fontFamilyMonospace: tokens.fontMono,
    };
};
// #endregion module
