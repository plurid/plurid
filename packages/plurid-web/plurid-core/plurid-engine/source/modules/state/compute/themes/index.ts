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
const resolveThemes = (
    configuration: PluridConfiguration,
    precomputedState: Partial<PluridState> | undefined,
) => {
    let generalTheme: Theme | undefined;
    let interactionTheme: Theme | undefined;

    if (typeof configuration.global.theme === 'object') {
        const {
            general,
            interaction,
        } = configuration.global.theme;

        if (typeof general === 'string') {
            if (Object.keys(THEME_NAMES).includes(general)) {
                generalTheme = (themes as any)[general];
            }
        }

        if (typeof interaction === 'string') {
            if (Object.keys(THEME_NAMES).includes(interaction)) {
                interactionTheme = (themes as any)[interaction];
            }
        }
    } else {
        if (Object.keys(THEME_NAMES).includes(configuration.global.theme)) {
            generalTheme = (themes as any)[configuration.global.theme];
            interactionTheme = (themes as any)[configuration.global.theme];
        }
    }

    // THE LOOK DECIDES: unless the host set a theme of its own, the legacy Theme that plane content
    // and the drawers' inputs still read is derived from the look, so it matches (2026-09-06).
    const fromLook = themeFromLook(resolveLook(configuration.global.look));
    const explicit = (theme: Theme | undefined) => (theme && theme !== themes.plurid ? theme : fromLook);
    const stateThemes: PluridStateThemes = {
        general: explicit(generalTheme),
        interaction: explicit(interactionTheme),
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
