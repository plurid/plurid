// #region imports
    // #region libraries
    import {
        Look,
        LookBase,
        LookTokens,
        looks,
        deriveLook,
        isLookName,
        lookNameOf,
        DEFAULT_LOOK_NAME,
    } from '@plurid/plurid-themes';

    import {
        PluridConfigurationLook,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
const derived: WeakMap<object, Look> = new WeakMap();

const isBase = (
    value: object,
): value is LookBase => 'scheme' in value && 'space' in value && 'surface' in value && 'ink' in value && 'accent' in value;

/**
 * THE ONE RESOLUTION of `global.look`: a preset name → the preset (a legacy theme name → its nearest
 * preset, `LEGACY_LOOKS`); a base → a look derived from it;
 * `{ preset, tokens }` → the preset (the default when unnamed) with the tokens laid over. Anything
 * unknown → the default look. Objects resolve once (identity-memoised), so the application can call
 * this on every render.
 */
export const resolveLook = (
    setting: PluridConfigurationLook | undefined,
): Look => {
    if (setting === undefined || setting === null) {
        return looks[DEFAULT_LOOK_NAME];
    }
    if (typeof setting === 'string') {
        // a preset name, or a legacy theme name mapped to its nearest preset
        return looks[lookNameOf(setting) ?? DEFAULT_LOOK_NAME];
    }
    if (typeof setting !== 'object') {
        return looks[DEFAULT_LOOK_NAME];
    }
    const cached = derived.get(setting);
    if (cached) {
        return cached;
    }
    let look: Look;
    if (isBase(setting)) {
        look = deriveLook(setting);
    } else {
        const preset = 'preset' in setting && isLookName(setting.preset) ? looks[setting.preset] : looks[DEFAULT_LOOK_NAME];
        const overrides: Partial<LookTokens> = ('tokens' in setting && setting.tokens) ? setting.tokens : {};
        look = {
            name: Object.keys(overrides).length > 0 ? preset.name + '+' : preset.name,
            base: preset.base,
            tokens: { ...preset.tokens, ...overrides },
        };
    }
    derived.set(setting, look);
    return look;
};
// #endregion module
