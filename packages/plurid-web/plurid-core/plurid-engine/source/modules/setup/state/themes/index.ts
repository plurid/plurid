// #region imports
    // #region libraries
    import themes, {
        Theme,
        THEME_NAMES,
    } from '@plurid/plurid-themes';

    import {
        PluridConfiguration,
        PluridStateThemes,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
const resolveThemes = (
    configuration: PluridConfiguration,
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

    const stateThemes: PluridStateThemes = {
        general: generalTheme || themes.plurid,
        interaction: interactionTheme || themes.plurid,
    };

    return stateThemes;
}
// #endregion module



// #region exports
export {
    resolveThemes,
};
// #endregion exports
