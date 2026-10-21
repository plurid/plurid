// #region imports
    // #region libraries
    import themes, {
        Theme,
        THEME_NAMES,
        themeFromLook,
    } from '@plurid/plurid-themes';

    import {
        PluridConfiguration,
        PluridStateThemes,
        PluridState,
    } from '@plurid/plurid-data';
    // #endregion libraries

    // #region external
    import {
        resolveLook,
    } from '../../../general/look';
    // #endregion external
// #endregion imports



// #region module
/**
 * A theme part as configured: a Theme object (the host's own; the colours a partial one leaves out are
 * the look's, 2026-10-22: they were undefined) or a theme name; `look`, none.
 */
const themeOf = (
    configured: unknown,
    fromLook: Theme,
): Theme | undefined => {
    if (configured && typeof configured === 'object') {
        const own = configured as Partial<Theme>;
        return Object.keys(fromLook).every((key) => key in own)
            ? own as Theme
            : { ...fromLook, ...own };
    }
    if (typeof configured === 'string' && Object.keys(THEME_NAMES).includes(configured)) {
        return (themes as any)[configured];
    }
    return undefined;
};

const resolveThemes = (
    configuration: PluridConfiguration,
    precomputedState: Partial<PluridState> | undefined,
) => {
    const configured = configuration.global.theme as unknown;
    const parts = configured && typeof configured === 'object'
        ? configured as { general?: unknown; interaction?: unknown }
        : { general: configured, interaction: configured };

    // THE LOOK DECIDES: unless the host set a theme, the legacy Theme that plane content and the
    // drawers' inputs still read is derived from the look, so it matches. `look` (the default) and
    // any other value that names no theme follow it; a name sets that theme, the name `plurid` too
    // (2026-10-21: `plurid` was the default value, so it followed the look); a Theme OBJECT is the
    // host's own and is taken as given (2026-10-20: only names were read).
    const fromLook = themeFromLook(resolveLook(configuration.global.look));
    const general = themeOf(parts.general, fromLook);
    const interaction = themeOf(parts.interaction, fromLook);
    const explicit = (theme: Theme | undefined) => theme ?? fromLook;
    const stateThemes: PluridStateThemes = {
        general: explicit(general),
        interaction: explicit(interaction),
        ...precomputedState?.themes,
    };

    return stateThemes;
}
// #endregion module



// #region exports
export {
    resolveThemes,
};
// #endregion exports
