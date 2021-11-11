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
const specifiedOrDefault = <T>(
    path: string,
    type: string,
    configuration: PluridPartialConfiguration,
): T => {
    const item = objects.getNested(configuration, path);

    if (typeof item === type) {
        return item;
    }

    return objects.getNested(defaultConfiguration, path);
}

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
        ...defaultConfiguration,
        ...target,
    };

    if (!configuration) {
        return {
            ...targetConfiguration,
        };
    }

    /**
     * HACK:
     * Bypass RecursivePartial on the `configuration.space.layout` object.
     */
    const layout: any = configuration
        && configuration.space
        && typeof configuration.space.layout === 'object'
            ? configuration.space.layout
            : targetConfiguration.space.layout;

    const mergedConfiguration: PluridConfiguration = {
        ...targetConfiguration,
        global: {
            micro: specifiedOrDefault(
                'global.micro',
                'boolean',
                configuration,
            ),
            transparentUI: specifiedOrDefault(
                'global.transparentUI',
                'boolean',
                configuration,
            ),
            language: specifiedOrDefault(
                'global.language',
                'string',
                configuration,
            ),
            render: specifiedOrDefault(
                'global.render',
                'string',
                configuration,
            ),
            theme: {
                // TODO
                // fix the Theme type
                general: resolveTheme(configuration.global?.theme, 'general') as any,
                interaction: resolveTheme(configuration.global?.theme, 'interaction') as any,
            },
        },
        elements: {
            ...targetConfiguration.elements,
            toolbar: {
                show: specifiedOrDefault(
                    'elements.toolbar.show',
                    'boolean',
                    configuration,
                ),
                opaque: specifiedOrDefault(
                    'elements.toolbar.opaque',
                    'boolean',
                    configuration,
                ),
                conceal: specifiedOrDefault(
                    'elements.toolbar.conceal',
                    'boolean',
                    configuration,
                ),
                transformIcons: specifiedOrDefault(
                    'elements.toolbar.transformIcons',
                    'boolean',
                    configuration,
                ),
                transformButtons: specifiedOrDefault(
                    'elements.toolbar.transformButtons',
                    'boolean',
                    configuration,
                ),
                drawers: (configuration.elements
                    && configuration.elements.toolbar
                    && configuration.elements.toolbar.drawers
                        ? configuration.elements.toolbar.drawers
                        : targetConfiguration.elements.toolbar.drawers) as (keyof typeof TOOLBAR_DRAWERS)[],
                toggledDrawers: (configuration.elements
                    && configuration.elements.toolbar
                    && configuration.elements.toolbar.toggledDrawers
                        ? configuration.elements.toolbar.toggledDrawers
                        : targetConfiguration.elements.toolbar.toggledDrawers) as (keyof typeof TOOLBAR_DRAWERS)[],
            },
            viewcube: {
                show: specifiedOrDefault(
                    'elements.viewcube.show',
                    'boolean',
                    configuration,
                ),
                opaque: specifiedOrDefault(
                    'elements.viewcube.opaque',
                    'boolean',
                    configuration,
                ),
                conceal: specifiedOrDefault(
                    'elements.viewcube.conceal',
                    'boolean',
                    configuration,
                ),
                buttons: specifiedOrDefault(
                    'elements.viewcube.buttons',
                    'boolean',
                    configuration,
                ),
            },
            plane: {
                width: specifiedOrDefault(
                    'elements.plane.width',
                    'number',
                    configuration,
                ),
                opacity: specifiedOrDefault(
                    'elements.plane.opacity',
                    'number',
                    configuration,
                ),
                controls: {
                    show: specifiedOrDefault(
                        'elements.plane.controls.show',
                        'boolean',
                        configuration,
                    ),
                    pathbar: {
                        domainURL: specifiedOrDefault(
                            'elements.plane.controls.pathbar.domainURL',
                            'boolean',
                            configuration,
                        ),
                    },
                },
            },
            switch: {
                show: configuration?.elements?.switch?.show ?? false,
            },
        },
        space: {
            ...targetConfiguration.space,
            layout,
            camera: specifiedOrDefault(
                'space.camera',
                'string',
                configuration,
            ),
            perspective: specifiedOrDefault(
                'space.perspective',
                'number',
                configuration,
            ),
            opaque: specifiedOrDefault(
                'space.opaque',
                'boolean',
                configuration,
            ),
            fadeInTime: specifiedOrDefault(
                'space.fadeInTime',
                'number',
                configuration,
            ),
            center: specifiedOrDefault(
                'space.center',
                'boolean',
                configuration,
            ),
            transformOrigin: {
                show: specifiedOrDefault(
                    'space.transformOrigin.show',
                    'boolean',
                    configuration,
                ),
                size: specifiedOrDefault(
                    'space.transformOrigin.size',
                    'string',
                    configuration,
                ),
            },
            transformLocks: {
                rotationX: specifiedOrDefault(
                    'space.transformLocks.rotationX',
                    'boolean',
                    configuration,
                ),
                rotationY: specifiedOrDefault(
                    'space.transformLocks.rotationY',
                    'boolean',
                    configuration,
                ),
                translationX: specifiedOrDefault(
                    'space.transformLocks.translationX',
                    'boolean',
                    configuration,
                ),
                translationY: specifiedOrDefault(
                    'space.transformLocks.translationY',
                    'boolean',
                    configuration,
                ),
                translationZ: specifiedOrDefault(
                    'space.transformLocks.translationZ',
                    'boolean',
                    configuration,
                ),
                scale: specifiedOrDefault(
                    'space.transformLocks.scale',
                    'boolean',
                    configuration,
                ),
            },
            transformMode: specifiedOrDefault(
                'space.transformMode',
                'string',
                configuration,
            ),
            transformMultimode: specifiedOrDefault(
                'space.transformMultimode',
                'boolean',
                configuration,
            ),
            transformTouch: specifiedOrDefault(
                'space.transformTouch',
                'string',
                configuration,
            ),
            firstPerson: specifiedOrDefault(
                'space.firstPerson',
                'boolean',
                configuration,
            ),
        },
        network: {
            host: specifiedOrDefault(
                'network.host',
                'string',
                configuration,
            ),
            protocol: specifiedOrDefault(
                'network.protocol',
                'string',
                configuration,
            ),
        },
        development: {
            planeDebugger: specifiedOrDefault(
                'development.planeDebugger',
                'boolean',
                configuration,
            ),
            spaceDebugger: specifiedOrDefault(
                'development.spaceDebugger',
                'boolean',
                configuration,
            ),
        },
    };

    return mergedConfiguration;
}
// #endregion module
