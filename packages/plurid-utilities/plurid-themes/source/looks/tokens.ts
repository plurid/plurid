// #region imports
    // #region internal
    import {
        LookTokenDefinition,
        LookTokenName,
    } from './interfaces';
    // #endregion internal
// #endregion imports



// #region module
/** The custom property a token is emitted as. */
export const lookProperty = (
    name: LookTokenName,
): string => '--plurid-' + name.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());

const define = (
    name: LookTokenName,
    group: LookTokenDefinition['group'],
    description: string,
): LookTokenDefinition => ({ name, property: lookProperty(name), group, description });

/** THE TOKEN TABLE, in the order the docs print it. Every `LookTokens` key has one row (the test proves it). */
export const LOOK_TOKENS: readonly LookTokenDefinition[] = [
    define('scheme', 'scheme', 'the colour scheme, `dark` or `light`; sets `color-scheme` on the application'),

    define('space', 'space', 'the space behind the planes'),
    define('spaceVignette', 'space', 'a radial gradient over the space, or `none`'),
    define('spaceGrid', 'space', 'the colour of the space\'s major grid lines, or `none` for no grid'),
    define('spaceGridSize', 'space', 'the major grid pitch'),
    define('spaceGridMinor', 'space', 'the colour of the minor grid lines, or `none`'),
    define('spaceGridMinorSize', 'space', 'the minor grid pitch'),

    define('plane', 'plane', 'a plane\'s sheet, when the space is opaque and the plane declares no background'),
    define('planeInk', 'plane', 'the text colour a plane inherits'),
    define('planeRim', 'plane', 'the hairline around a plane'),
    define('planeShadow', 'plane', 'the shadow under a plane in the space'),

    define('surface', 'surface', 'the chrome\'s fill: a pill, a bar (translucent)'),
    define('surfaceStrong', 'surface', 'the fill when hovered, pressed or open'),
    define('surfaceSolid', 'surface', 'an opaque panel: a dialog, a drawer, the minimap'),
    define('hover', 'surface', 'a control hovered or pressed inside a surface: a translucent wash of the ink'),
    define('rim', 'surface', 'the light hairline around a control or a panel'),
    define('halo', 'surface', 'the dark ring behind the rim, so chrome reads over anything'),
    define('shadow', 'surface', 'the drop shadow of a panel'),
    define('blur', 'surface', 'the backdrop blur of translucent chrome'),

    define('ink', 'ink', 'glyphs and text on chrome'),
    define('inkMuted', 'ink', 'secondary text: a label, a path'),
    define('inkFaint', 'ink', 'a disabled glyph, a separator'),
    define('accent', 'ink', 'the one accent: an active state, the eye on the minimap, a link'),
    define('accentInk', 'ink', 'text on an accent-filled control'),
    define('line', 'ink', 'a beam between planes, a guide, the bridge\'s film'),
    define('danger', 'ink', 'a destructive control'),

    define('focus', 'focus', 'the focus ring'),
    define('focusHalo', 'focus', 'the second ring behind it, so the focus reads over anything'),

    define('control', 'geometry', 'a control\'s size: the pills, the plane bar\'s buttons'),
    define('controlSmall', 'geometry', 'a small control: a handle, a key'),
    define('radius', 'geometry', 'a control\'s corner radius'),
    define('radiusPanel', 'geometry', 'a panel\'s corner radius'),
    define('margin', 'geometry', 'the chrome\'s distance from the view\'s edges'),
    define('gap', 'geometry', 'the gap between neighbouring controls'),
    define('bar', 'geometry', 'the plane bar\'s height'),

    define('font', 'type', 'the chrome\'s font stack'),
    define('fontMono', 'type', 'the monospace stack: keys, the debuggers, a path'),
    define('fontSize', 'type', 'the chrome\'s text size'),
    define('fontSizeSmall', 'type', 'a small label'),
    define('fontSizeTitle', 'type', 'a drawer\'s title'),
    define('weight', 'type', 'the chrome\'s font weight'),

    define('fade', 'motion', 'the chrome\'s fade: the dock fade, the aside fade, a hover'),
    define('ease', 'motion', 'the easing of those fades'),
    define('opacityPersistent', 'motion', 'the resting opacity of persistent chrome: the rail, the `?`'),
    define('opacityAmbient', 'motion', 'the resting opacity of ambient chrome: a beam, a bridge, an arrow'),
];

/** The token names, in table order. */
export const LOOK_TOKEN_NAMES: readonly LookTokenName[] = LOOK_TOKENS.map((token) => token.name);
// #endregion module
