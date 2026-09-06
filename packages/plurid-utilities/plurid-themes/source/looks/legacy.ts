// #region imports
    // #region internal
    import {
        LookName,
    } from './presets';
    import {
        isLookName,
    } from './presets';
    // #endregion internal
// #endregion imports



// #region module
/**
 * The legacy theme NAMES (`night`, `plurid`, the product themes …) given to `look`, mapped to the
 * nearest preset, so a host that only renames the knob keeps a sensible look: the shade themes by
 * their lightness, the colour themes by their hue, the products (all dark) to the default.
 */
export const LEGACY_LOOKS: Readonly<Record<string, LookName>> = {
    night: 'noir',
    dusk: 'graphite',
    dawn: 'snow',
    light: 'snow',
    ponton: 'ink',
    jaune: 'sand',
    furor: 'ember',
    plurid: 'paper',
    generated: 'graphite',
    deback: 'graphite', decode: 'graphite', defile: 'graphite', deform: 'graphite', delook: 'graphite',
    deloss: 'graphite', demail: 'graphite', demand: 'graphite', denote: 'graphite', depack: 'graphite',
    depict: 'graphite', deself: 'graphite', desite: 'graphite', detime: 'graphite', detour: 'graphite',
    detune: 'graphite', deturn: 'graphite', deveil: 'graphite', devert: 'graphite', deview: 'graphite',
    dewiki: 'graphite',
};

/** A preset name as it is; a legacy theme name as its nearest preset; anything else `undefined`. */
export const lookNameOf = (
    name: string,
): LookName | undefined => {
    if (isLookName(name)) {
        return name;
    }
    return Object.prototype.hasOwnProperty.call(LEGACY_LOOKS, name) ? LEGACY_LOOKS[name] : undefined;
};
// #endregion module
