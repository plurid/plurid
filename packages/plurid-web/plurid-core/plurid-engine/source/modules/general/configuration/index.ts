// #region imports
    // #region libraries
    import {
        TOOLBAR_DRAWERS,

        PluridPartialConfiguration,
        PluridConfigurationTheme,
        PluridConfiguration,
        RecursivePartial,

        defaultConfiguration,
    } from '@plurid/plurid-data';

    import {
        objects,
    } from '@plurid/plurid-functions';
    // #endregion libraries
// #endregion imports



// #region module
const resolveTheme = (
    theme: string | number | symbol | RecursivePartial<PluridConfigurationTheme> | undefined,
    type: 'general' | 'interaction',
) => {
    if (!theme) {
        return 'plurid';
    }

    if (typeof theme === 'string') {
        return theme;
    }

    if (typeof theme !== 'object') {
        return 'plurid';
    }

    const {
        general,
        interaction,
    } = theme;

    if (type === 'general' && general) {
        return general;
    }

    if (type === 'interaction' && interaction) {
        return interaction;
    }

    return 'plurid';
}


export const merge = (
    configuration?: PluridPartialConfiguration,
    target?: PluridConfiguration,
): PluridConfiguration => {
    const targetConfiguration = {
        ...objects.clone(defaultConfiguration),
        ...objects.clone(target || {}),
    };

    if (!configuration) {
        return targetConfiguration;
    }

    const mergedConfiguration = objects.merge(
        targetConfiguration,
        configuration,
        {
            'global.theme.general': () => resolveTheme(configuration.global?.theme, 'general') as any,
            'global.theme.interaction': () => resolveTheme(configuration.global?.theme, 'interaction') as any,

            'elements.toolbar.drawers': () => (configuration.elements
                && configuration.elements.toolbar
                && configuration.elements.toolbar.drawers
                    ? configuration.elements.toolbar.drawers
                    : targetConfiguration.elements.toolbar.drawers) as (keyof typeof TOOLBAR_DRAWERS)[],
            'elements.toolbar.toggledDrawers': () => (configuration.elements
                && configuration.elements.toolbar
                && configuration.elements.toolbar.toggledDrawers
                    ? configuration.elements.toolbar.toggledDrawers
                    : targetConfiguration.elements.toolbar.toggledDrawers) as (keyof typeof TOOLBAR_DRAWERS)[],
            'elements.switch.show': () => configuration?.elements?.switch?.show ?? false,

            'space.layout': () => configuration
                && configuration.space
                && typeof configuration.space.layout === 'object'
                    ? configuration.space.layout
                    : targetConfiguration.space.layout,
        },
    );

    return mergedConfiguration;
}
// #endregion module
