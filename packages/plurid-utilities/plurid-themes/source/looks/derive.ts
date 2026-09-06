// #region imports
    // #region internal
    import {
        Look,
        LookBase,
        LookTokens,
    } from './interfaces';
    import {
        withAlpha,
        shiftLightness,
        isDark,
    } from './color';
    // #endregion internal
// #endregion imports



// #region module
/** The chrome's typefaces when a base names none: the platform's own. */
export const LOOK_FONT_SANS = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, sans-serif";
export const LOOK_FONT_MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

/**
 * A whole look from a few values. The rules are the ones the page presentation's chrome was drawn
 * with (2026-09-06): a translucent surface with a light rim and a dark halo behind it, so a control
 * reads over the space and over a page alike; one accent; two opacity tiers; one radius for controls
 * and one for panels; the platform's typefaces. A light look keeps every rule and flips the values.
 */
export const deriveLook = (
    base: LookBase,
    name = 'custom',
): Look => {
    const dark = base.scheme === 'dark';
    const {
        space,
        surface,
        ink,
        accent,
    } = base;
    const grid = base.grid ?? true;

    const tokens: LookTokens = {
        scheme: base.scheme,

        space,
        spaceVignette: base.vignette
            ? `radial-gradient(ellipse at 50% 40%, ${withAlpha(surface, dark ? 0.22 : 0.6)}, transparent 72%)`
            : 'none',
        spaceGrid: grid ? withAlpha(ink, dark ? 0.04 : 0.07) : 'none',
        spaceGridSize: '120px',
        spaceGridMinor: grid ? withAlpha(ink, dark ? 0.024 : 0.045) : 'none',
        spaceGridMinorSize: '24px',

        plane: shiftLightness(space, dark ? 0.03 : 0.04),
        planeInk: ink,
        planeRim: withAlpha(ink, 0.08),
        planeShadow: dark ? '0 10px 30px rgba(0, 0, 0, 0.45)' : '0 10px 30px rgba(0, 0, 0, 0.12)',

        surface: withAlpha(surface, 0.62),
        surfaceStrong: withAlpha(surface, 0.84),
        surfaceSolid: shiftLightness(surface, dark ? 0.035 : 0),
        hover: withAlpha(ink, dark ? 0.1 : 0.07),
        rim: withAlpha(ink, dark ? 0.22 : 0.16),
        halo: dark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.1)',
        shadow: dark ? '0 2px 8px rgba(0, 0, 0, 0.25)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
        blur: '8px',

        ink,
        inkMuted: withAlpha(ink, 0.62),
        inkFaint: withAlpha(ink, 0.3),
        accent,
        accentInk: isDark(accent) ? '#ffffff' : '#0a0c0f',
        line: withAlpha(ink, dark ? 0.16 : 0.12),
        danger: dark ? '#ff7b72' : '#c62828',

        focus: ink,
        focusHalo: dark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.75)',

        control: '32px',
        controlSmall: '24px',
        radius: '9px',
        radiusPanel: '14px',
        margin: '16px',
        gap: '8px',
        bar: '56px',

        font: base.font ?? LOOK_FONT_SANS,
        fontMono: base.fontMono ?? LOOK_FONT_MONO,
        fontSize: '13px',
        fontSizeSmall: '11px',
        fontSizeTitle: '15px',
        weight: '500',

        fade: '240ms',
        ease: 'ease',
        opacityPersistent: '0.85',
        opacityAmbient: '0.55',
    };

    return {
        name,
        base: { ...base },
        tokens,
    };
};
// #endregion module
