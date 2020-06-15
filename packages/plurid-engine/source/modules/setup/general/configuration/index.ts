import {
    PluridPartialConfiguration,
    PluridConfiguration,
    defaultConfiguration,
} from '@plurid/plurid-data';

import {
    objects,
} from '@plurid/plurid-functions';



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


export const merge = (
    configuration?: PluridPartialConfiguration,
): PluridConfiguration => {
    if (!configuration) {
        return {
            ...defaultConfiguration,
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
            : defaultConfiguration.space.layout;

    const mergedConfiguration: PluridConfiguration = {
        ...defaultConfiguration,
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
                general: typeof configuration.global?.theme === 'string'
                    ? configuration.global.theme
                    : typeof configuration.global?.theme === 'object' && configuration.global.theme.general
                        ? configuration.global.theme.general
                        : typeof defaultConfiguration.global.theme === 'object'
                            ? defaultConfiguration.global.theme.general
                            : 'plurid',
                interaction: typeof configuration.global?.theme === 'string'
                    ? configuration.global?.theme
                    : typeof configuration.global?.theme === 'object' && configuration.global.theme.interaction
                        ? configuration.global.theme.interaction
                        : typeof defaultConfiguration.global.theme === 'object'
                            ? defaultConfiguration.global.theme.interaction
                            : 'plurid',
            },
        },
        elements: {
            ...defaultConfiguration.elements,
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
                toggledDrawers: configuration.elements
                    && configuration.elements.toolbar
                    && configuration.elements.toolbar.toggledDrawers
                        ? configuration.elements.toolbar.toggledDrawers
                        : defaultConfiguration.elements.toolbar.toggledDrawers,
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
            ...defaultConfiguration.space,
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
