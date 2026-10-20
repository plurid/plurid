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
/** A theme part as configured: a name (checked) or a Theme object, which is the host's own. */
const themeOf = (
    configured: unknown,
): { theme: Theme | undefined; own: boolean } => {
    if (configured && typeof configured === 'object') {
        return { theme: configured as Theme, own: true };
    }
    if (typeof configured === 'string' && Object.keys(THEME_NAMES).includes(configured)) {
        return { theme: (themes as any)[configured], own: false };
    }
    return { theme: undefined, own: false };
};

const resolveThemes = (
    configuration: PluridConfiguration,
    precomputedState: Partial<PluridState> | undefined,
) => {
    const configured = configuration.global.theme as unknown;
    const parts = configured && typeof configured === 'object'
        ? configured as { general?: unknown; interaction?: unknown }
        : { general: configured, interaction: configured };
    const general = themeOf(parts.general);
    const interaction = themeOf(parts.interaction);

    // THE LOOK DECIDES: unless the host set a theme of its own, the legacy Theme that plane content
    // and the drawers' inputs still read is derived from the look, so it matches. A Theme OBJECT is
    // the host's own and is taken as given (2026-10-20: only names were read, so an object was the
    // look's theme); the NAME `plurid` is the default value, so it leaves the theme to the look — the
    // plurid theme's object (`themes.plurid`) is how a host asks for it.
    const fromLook = themeFromLook(resolveLook(configuration.global.look));
    const explicit = (part: { theme: Theme | undefined; own: boolean }) => (
        part.theme && (part.own || part.theme !== themes.plurid) ? part.theme : fromLook
    );
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
