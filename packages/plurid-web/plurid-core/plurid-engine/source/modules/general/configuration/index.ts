// #region imports
    // #region libraries
    import {
        PluridPartialConfiguration,
        FlatPluridConfiguration,
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
    const targetConfiguration: PluridConfiguration = {
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
            'global.theme': () => {
                return {
                    general: resolveTheme(configuration.global?.theme, 'general') as any,
                    interaction: resolveTheme(configuration.global?.theme, 'interaction') as any,
                };
            },
        },
    );

    return mergedConfiguration;
}


/**
 * Build a full `PluridConfiguration` from a FLAT shorthand, so consumers can configure the common
 * options without authoring the 5-level nested object. Flat fields are expanded to their nested
 * locations, then `extend` (a normal nested partial) is layered on top, then the whole thing is
 * merged over the defaults via `merge` (which also resolves `theme`). Anything omitted keeps its
 * default. Returns a complete, ready-to-use configuration.
 *
 * @example
 * definePluridConfiguration({ theme: 'plurid', center: true, planeWidth: 0.32, bridgeLength: 160 })
 */
export const definePluridConfiguration = (
    flat: FlatPluridConfiguration = {},
): PluridConfiguration => {
    const partial: PluridPartialConfiguration = {};

    // #region global
    const global: PluridPartialConfiguration['global'] = {};
    if (flat.theme !== undefined) { global.theme = flat.theme; }
    if (flat.micro !== undefined) { global.micro = flat.micro; }
    if (flat.transparentUI !== undefined) { global.transparentUI = flat.transparentUI; }
    if (flat.language !== undefined) { global.language = flat.language; }
    if (Object.keys(global).length > 0) { partial.global = global; }
    // #endregion global

    // #region space
    const space: PluridPartialConfiguration['space'] = {};
    if (flat.layout !== undefined) { space.layout = flat.layout; }
    if (flat.perspective !== undefined) { space.perspective = flat.perspective; }
    if (flat.center !== undefined) { space.center = flat.center; }
    if (flat.firstPerson !== undefined) { space.firstPerson = flat.firstPerson; }
    if (flat.transformLocks !== undefined) { space.transformLocks = flat.transformLocks; }
    if (flat.bridgeLength !== undefined || flat.bridgePlaneAngle !== undefined) {
        space.bridge = {};
        if (flat.bridgeLength !== undefined) { space.bridge.length = flat.bridgeLength; }
        if (flat.bridgePlaneAngle !== undefined) { space.bridge.planeAngle = flat.bridgePlaneAngle; }
    }
    if (Object.keys(space).length > 0) { partial.space = space; }
    // #endregion space

    // #region elements
    const elements: PluridPartialConfiguration['elements'] = {};
    const plane: NonNullable<PluridPartialConfiguration['elements']>['plane'] = {};
    if (flat.planeWidth !== undefined) { plane.width = flat.planeWidth; }
    if (flat.planeOpacity !== undefined) { plane.opacity = flat.planeOpacity; }
    if (flat.planeControls !== undefined) { plane.controls = { show: flat.planeControls }; }
    if (Object.keys(plane).length > 0) { elements.plane = plane; }
    if (flat.toolbar !== undefined) { elements.toolbar = { show: flat.toolbar }; }
    if (flat.viewcube !== undefined) { elements.viewcube = { show: flat.viewcube }; }
    if (Object.keys(elements).length > 0) { partial.elements = elements; }
    // #endregion elements

    // `extend` is the escape hatch for anything not covered above; merge it ON TOP of the
    // flat-expanded partial (so it wins) BEFORE the single `merge` over defaults — one `merge` call
    // means `theme` is resolved exactly once.
    const resolved = flat.extend
        ? objects.merge(partial, flat.extend) as PluridPartialConfiguration
        : partial;

    return merge(resolved);
}
// #endregion module
