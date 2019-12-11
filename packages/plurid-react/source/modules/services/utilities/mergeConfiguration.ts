import {
    PluridConfiguration,
    RecursivePartial,
    defaultConfiguration,
} from '@plurid/plurid-data';



const mergeConfiguration = (
    configuration?: RecursivePartial<PluridConfiguration>,
): PluridConfiguration => {
    if (!configuration) {
        return { ...defaultConfiguration };
    }

    const mergedConfiguration: PluridConfiguration = {
        ...defaultConfiguration,
        micro: typeof configuration.micro === 'boolean'
            ? configuration.micro
            : defaultConfiguration.micro,
        theme: {
            general: typeof configuration.theme === 'string'
                ? configuration.theme
                : typeof configuration.theme === 'object' && configuration.theme.general
                    ? configuration.theme.general
                    : typeof defaultConfiguration.theme === 'object'
                        ? defaultConfiguration.theme.general
                        : 'plurid',
            interaction: typeof configuration.theme === 'string'
                ? configuration.theme
                : typeof configuration.theme === 'object' && configuration.theme.interaction
                    ? configuration.theme.interaction
                    : typeof defaultConfiguration.theme === 'object'
                        ? defaultConfiguration.theme.interaction
                        : 'plurid',
        },
        elements: {
            ...defaultConfiguration.elements,
            toolbar: {
                show: configuration.elements
                    && configuration.elements.toolbar
                    && typeof configuration.elements.toolbar.show === 'boolean'
                        ? configuration.elements.toolbar.show
                        : defaultConfiguration.elements.toolbar.show,
                opaque: configuration.elements
                    && configuration.elements.toolbar
                    && typeof configuration.elements.toolbar.opaque === 'boolean'
                        ? configuration.elements.toolbar.opaque
                        : defaultConfiguration.elements.toolbar.opaque,
                conceal: configuration.elements
                    && configuration.elements.toolbar
                    && typeof configuration.elements.toolbar.conceal === 'boolean'
                        ? configuration.elements.toolbar.conceal
                        : defaultConfiguration.elements.toolbar.conceal,
                transformIcons: configuration.elements
                    && configuration.elements.toolbar
                    && typeof configuration.elements.toolbar.transformIcons === 'boolean'
                        ? configuration.elements.toolbar.transformIcons
                        : defaultConfiguration.elements.toolbar.transformIcons,
                transformButtons: configuration.elements
                    && configuration.elements.toolbar
                    && typeof configuration.elements.toolbar.transformButtons === 'boolean'
                        ? configuration.elements.toolbar.transformButtons
                        : defaultConfiguration.elements.toolbar.transformButtons,
            },
            viewcube: {
                show: configuration.elements
                    && configuration.elements.viewcube
                    && typeof configuration.elements.viewcube.show === 'boolean'
                        ? configuration.elements.viewcube.show
                        : defaultConfiguration.elements.viewcube.show,
                opaque: configuration.elements
                    && configuration.elements.viewcube
                    && typeof configuration.elements.viewcube.opaque === 'boolean'
                        ? configuration.elements.viewcube.opaque
                        : defaultConfiguration.elements.viewcube.opaque,
                conceal: configuration.elements
                    && configuration.elements.viewcube
                    && typeof configuration.elements.viewcube.conceal === 'boolean'
                        ? configuration.elements.viewcube.conceal
                        : defaultConfiguration.elements.viewcube.conceal,
                buttons: configuration.elements
                    && configuration.elements.viewcube
                    && typeof configuration.elements.viewcube.buttons === 'boolean'
                        ? configuration.elements.viewcube.buttons
                        : defaultConfiguration.elements.viewcube.buttons,
            },
            plane: {
                width: configuration.elements
                    && configuration.elements.plane
                    && typeof configuration.elements.plane.width === 'number'
                        ? configuration.elements.plane.width
                        : defaultConfiguration.elements.plane.width,
                opacity: configuration.elements
                    && configuration.elements.plane
                    && typeof configuration.elements.plane.opacity === 'number'
                        ? configuration.elements.plane.opacity
                        : defaultConfiguration.elements.plane.opacity,
                controls: {
                    show: configuration.elements
                        && configuration.elements.plane
                        && configuration.elements.plane.controls
                        && typeof configuration.elements.plane.controls.show === 'boolean'
                            ? configuration.elements.plane.controls.show
                            : defaultConfiguration.elements.plane.controls.show,
                    pathbar: {
                        domainURL: configuration.elements
                            && configuration.elements.plane
                            && configuration.elements.plane.controls
                            && configuration.elements.plane.controls.pathbar
                            && typeof configuration.elements.plane.controls.pathbar.domainURL === 'boolean'
                                ? configuration.elements.plane.controls.pathbar.domainURL
                                : defaultConfiguration.elements.plane.controls.pathbar.domainURL,
                    },
                },
            },
        },
        space: {
            ...defaultConfiguration.space,
            // layout: configuration
            //     && configuration.space
            //     && typeof configuration.space.layout === 'object'
            //         ? configuration.space.layout
            //         : defaultConfiguration.space.layout,
            camera: configuration.space
                && configuration.space.camera
                    ? configuration.space.camera
                    : defaultConfiguration.space.camera,
            perspective: configuration.space
                && configuration.space.perspective
                    ? configuration.space.perspective
                    : defaultConfiguration.space.perspective,
            opaque: configuration.space
                && typeof configuration.space.opaque === 'boolean'
                    ? configuration.space.opaque
                    : defaultConfiguration.space.opaque,
            center: configuration.space
                && typeof configuration.space.center === 'boolean'
                    ? configuration.space.center
                    : defaultConfiguration.space.center,
            transformOrigin: {
                show: configuration.space
                    && configuration.space.transformOrigin
                    && typeof configuration.space.transformOrigin.show === 'boolean'
                        ? configuration.space.transformOrigin.show
                        : defaultConfiguration.space.transformOrigin.show,
                size: configuration.space
                    && configuration.space.transformOrigin
                    && typeof configuration.space.transformOrigin.size === 'string'
                        ? configuration.space.transformOrigin.size
                        : defaultConfiguration.space.transformOrigin.size,
            },
            transformLocks: {
                rotationX: configuration.space
                    && configuration.space.transformLocks
                    && typeof configuration.space.transformLocks.rotationX === 'boolean'
                        ? configuration.space.transformLocks.rotationX
                        : defaultConfiguration.space.transformLocks.rotationX,
                rotationY: configuration.space
                    && configuration.space.transformLocks
                    && typeof configuration.space.transformLocks.rotationY === 'boolean'
                        ? configuration.space.transformLocks.rotationY
                        : defaultConfiguration.space.transformLocks.rotationY,
                translationX: configuration.space
                    && configuration.space.transformLocks
                    && typeof configuration.space.transformLocks.translationX === 'boolean'
                        ? configuration.space.transformLocks.translationX
                        : defaultConfiguration.space.transformLocks.translationX,
                translationY: configuration.space
                    && configuration.space.transformLocks
                    && typeof configuration.space.transformLocks.translationY === 'boolean'
                        ? configuration.space.transformLocks.translationY
                        : defaultConfiguration.space.transformLocks.translationY,
                translationZ: configuration.space
                    && configuration.space.transformLocks
                    && typeof configuration.space.transformLocks.translationZ === 'boolean'
                        ? configuration.space.transformLocks.translationZ
                        : defaultConfiguration.space.transformLocks.translationZ,
                scale: configuration.space
                    && configuration.space.transformLocks
                    && typeof configuration.space.transformLocks.scale === 'boolean'
                        ? configuration.space.transformLocks.scale
                        : defaultConfiguration.space.transformLocks.scale,
            },
            transformMode: configuration.space
                && configuration.space.transformMode
                && typeof configuration.space.transformMode === 'string'
                    ? configuration.space.transformMode
                    : defaultConfiguration.space.transformMode,
            transformTouch: configuration.space
                && configuration.space.transformTouch
                && typeof configuration.space.transformTouch === 'string'
                    ? configuration.space.transformTouch
                    : defaultConfiguration.space.transformTouch,
            firstPerson: configuration.space
                && configuration.space.firstPerson
                && typeof configuration.space.firstPerson === 'boolean'
                    ? configuration.space.firstPerson
                    : defaultConfiguration.space.firstPerson,
        },
    };

    return mergedConfiguration;
}


export default mergeConfiguration;
