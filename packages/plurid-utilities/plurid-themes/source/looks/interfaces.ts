// #region module
/**
 * THE LOOK — the engine's design tokens. Every piece of chrome (the toolbar, the viewcube, the
 * minimap, the rail, the plane bar, the shortcuts, the beams, the guides, the space itself) is
 * drawn from these and nothing else, so one look means one look everywhere. The tokens are emitted
 * as `--plurid-*` custom properties on the application; a host overrides any of them through the
 * configuration or through CSS. A look is DERIVED from a small base (`deriveLook`): a scheme, a few
 * colours, a font — so twelve presets stay consistent, and a host's own three colours make a whole.
 */

export type LookScheme =
    | 'dark'
    | 'light';

/** What a look is made from: the whole token set derives from these (`deriveLook`). */
export interface LookBase {
    /** the colour scheme: dark chrome over a dark space, or light over light */
    scheme: LookScheme;
    /** the space behind the planes */
    space: string;
    /** the chrome's material — pills, panels — before translucency */
    surface: string;
    /** the chrome's glyphs and text */
    ink: string;
    /** the one accent: the active state, the focus of a beam, a link */
    accent: string;
    /** the chrome's typeface (a CSS font stack) */
    font?: string;
    /** the monospace typeface (keys, the debuggers) */
    fontMono?: string;
    /** draw the space's grid (default: dark looks yes, light looks no) */
    grid?: boolean;
    /** a soft vignette over the space (default: no) */
    vignette?: boolean;
}

/** The token set: the values of the `--plurid-*` custom properties, keyed in camel case. */
export interface LookTokens {
    scheme: LookScheme;

    space: string;
    spaceVignette: string;
    spaceGrid: string;
    spaceGridSize: string;
    spaceGridMinor: string;
    spaceGridMinorSize: string;

    plane: string;
    planeInk: string;
    planeRim: string;
    planeShadow: string;

    surface: string;
    surfaceStrong: string;
    surfaceSolid: string;
    /** a control's hover wash ON a surface: translucent ink, so it reads on the bar it sits in */
    hover: string;
    rim: string;
    halo: string;
    shadow: string;
    blur: string;

    ink: string;
    inkMuted: string;
    inkFaint: string;
    accent: string;
    accentInk: string;
    line: string;
    danger: string;

    focus: string;
    focusHalo: string;

    control: string;
    controlSmall: string;
    radius: string;
    radiusPanel: string;
    margin: string;
    gap: string;
    bar: string;

    font: string;
    fontMono: string;
    fontSize: string;
    fontSizeSmall: string;
    fontSizeTitle: string;
    weight: string;

    fade: string;
    ease: string;
    opacityPersistent: string;
    opacityAmbient: string;
}

export type LookTokenName = keyof LookTokens;

/** A resolved look: its name (a preset's, or `custom`), the base it came from, every token. */
export interface Look {
    name: string;
    base: LookBase;
    tokens: LookTokens;
}

/** One row of the token table: the source of the generated `docs/LOOKS.md` and of the CSS names. */
export interface LookTokenDefinition {
    name: LookTokenName;
    /** the custom property, `--plurid-<property>` */
    property: string;
    group: 'scheme' | 'space' | 'plane' | 'surface' | 'ink' | 'focus' | 'geometry' | 'type' | 'motion';
    description: string;
}
// #endregion module
