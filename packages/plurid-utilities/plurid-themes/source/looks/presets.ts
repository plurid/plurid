// #region imports
    // #region internal
    import {
        Look,
        LookBase,
    } from './interfaces';
    import {
        deriveLook,
    } from './derive';
    // #endregion internal
// #endregion imports



// #region module
/** The twelve looks: seven dark, five light. Each is a base; the tokens derive (`deriveLook`). */
export const LOOK_BASES = {
    /** the default: near-black, a cool blue accent — the page presentation's chrome as first drawn */
    graphite: { scheme: 'dark', space: '#0a0c0f', surface: '#0c0e12', ink: '#ffffff', accent: '#4da3ff' },
    /** pure black, a soft blue */
    noir: { scheme: 'dark', space: '#000000', surface: '#0b0b0d', ink: '#f2f2f2', accent: '#8ab4ff' },
    /** a cool grey */
    slate: { scheme: 'dark', space: '#161a20', surface: '#1b2028', ink: '#e8ecf2', accent: '#7fb3ff' },
    /** deep navy, an amber accent */
    ink: { scheme: 'dark', space: '#0b1220', surface: '#111b2e', ink: '#e6edf7', accent: '#ffb454' },
    /** warm dark, an orange accent */
    ember: { scheme: 'dark', space: '#120d0b', surface: '#1b1410', ink: '#f5ebe4', accent: '#ff8a3d' },
    /** green-black */
    moss: { scheme: 'dark', space: '#0b120e', surface: '#111b15', ink: '#e3f0e6', accent: '#7ee787' },
    /** violet-black */
    plum: { scheme: 'dark', space: '#120b16', surface: '#1b1121', ink: '#efe6f5', accent: '#d2a8ff' },

    /** warm white */
    paper: { scheme: 'light', space: '#f6f5f1', surface: '#ffffff', ink: '#1c1c1a', accent: '#1f6feb' },
    /** cool white */
    snow: { scheme: 'light', space: '#f3f5f8', surface: '#ffffff', ink: '#151a21', accent: '#0a66c2' },
    /** warm beige */
    sand: { scheme: 'light', space: '#f2ead9', surface: '#fbf6ea', ink: '#2b2418', accent: '#a8491a' },
    /** pale green */
    mint: { scheme: 'light', space: '#ecf5ef', surface: '#ffffff', ink: '#14231a', accent: '#1b7f4b' },
    /** pale blue, a strong accent */
    cobalt: { scheme: 'light', space: '#e9eef8', surface: '#ffffff', ink: '#0f1a33', accent: '#1f4fd8' },
} as const satisfies Record<string, LookBase>;

export type LookName = keyof typeof LOOK_BASES;

export const LOOK_NAMES = Object.keys(LOOK_BASES) as LookName[];

/** The default look. */
export const DEFAULT_LOOK_NAME: LookName = 'graphite';

/** Every preset, derived once. */
export const looks: Record<LookName, Look> = Object.fromEntries(
    LOOK_NAMES.map((name) => [name, deriveLook(LOOK_BASES[name], name)]),
) as Record<LookName, Look>;

export const isLookName = (
    value: unknown,
): value is LookName => typeof value === 'string' && Object.prototype.hasOwnProperty.call(LOOK_BASES, value);
// #endregion module
