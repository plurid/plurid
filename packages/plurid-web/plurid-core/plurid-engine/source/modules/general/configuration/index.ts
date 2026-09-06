// #region imports
    // #region libraries
    import {
        PluridPartialConfiguration,
        FlatPluridConfiguration,
        PluridConfigurationTheme,
        PluridConfiguration,
        RecursivePartial,

        defaultConfiguration,
        pagePresentationDefaults,
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


/** The three page defaults win over a value equal to the space default (`pagePresentationDefaults`). */
const applyPageDefaults = (
    configuration: PluridConfiguration,
) => {
    if (configuration.space.fadeInTime === defaultConfiguration.space.fadeInTime) {
        configuration.space.fadeInTime = pagePresentationDefaults.space!.fadeInTime as number;
    }
    if (configuration.space.opaque === defaultConfiguration.space.opaque) {
        configuration.space.opaque = pagePresentationDefaults.space!.opaque as boolean;
    }
    if (configuration.elements.plane.height === defaultConfiguration.elements.plane.height) {
        configuration.elements.plane.height = pagePresentationDefaults.elements!.plane!.height as number;
    }
};


export const merge = (
    configuration?: PluridPartialConfiguration,
    target?: PluridConfiguration,
): PluridConfiguration => {
    // The page presentation changes three DEFAULTS (no fade-in, no gradient, view-sized planes);
    // they are layered under the target and the partial, so a host's own values still win.
    const presentation = configuration?.space?.presentation ?? target?.space?.presentation;
    const page = presentation === 'page';
    const base: PluridConfiguration = page
        ? objects.merge(objects.clone(defaultConfiguration), objects.clone(pagePresentationDefaults)) as PluridConfiguration
        : objects.clone(defaultConfiguration);
    const targetConfiguration = objects.merge(base, objects.clone(target || {})) as PluridConfiguration;
    if (page) {
        // A full target (a live reconfiguration carries the whole current configuration) holds the
        // SPACE defaults for the three page fields; a value still at that default is not a choice.
        applyPageDefaults(targetConfiguration);
    }

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
    if (flat.transparentUI !== undefined) { global.transparentUI = flat.transparentUI; }
    if (flat.language !== undefined) { global.language = flat.language; }
    if (Object.keys(global).length > 0) { partial.global = global; }
    // #endregion global

    // #region space
    const space: PluridPartialConfiguration['space'] = {};
    if (flat.layout !== undefined) { space.layout = flat.layout; }
    if (flat.spaceDimensions !== undefined) { space.dimensions = flat.spaceDimensions; }
    if (flat.perspective !== undefined) { space.perspective = flat.perspective; }
    if (flat.center !== undefined) { space.center = flat.center; }
    if (flat.presentation !== undefined) { space.presentation = flat.presentation; }
    if (flat.docking !== undefined) { space.docking = flat.docking; }
    if (flat.firstPerson !== undefined) { space.firstPerson = flat.firstPerson; }
    if (flat.collaboration !== undefined) { space.collaboration = flat.collaboration; }
    if (flat.undo !== undefined) { space.undo = flat.undo; }
    if (flat.viewpointURLWrite !== undefined) { space.viewpointURLWrite = flat.viewpointURLWrite; }
    if (flat.viewpointURLRestore !== undefined) { space.viewpointURLRestore = flat.viewpointURLRestore; }
    if (flat.viewpointURLParam !== undefined) { space.viewpointURLParam = flat.viewpointURLParam; }
    if (flat.viewpointURLDebounce !== undefined) { space.viewpointURLDebounce = flat.viewpointURLDebounce; }
    if (flat.viewpointURLVersion !== undefined) { space.viewpointURLVersion = flat.viewpointURLVersion; }
    if (flat.snap !== undefined) { space.snap = flat.snap; }
    if (flat.culling !== undefined) { space.culling = flat.culling; }
    if (flat.navigation !== undefined) { space.navigation = flat.navigation; }
    if (flat.timings !== undefined) { space.timings = flat.timings; }
    if (flat.gestures !== undefined) { space.gestures = flat.gestures; }
    if (flat.shortcuts !== undefined) { space.shortcuts = flat.shortcuts; }
    if (flat.transformLocks !== undefined) { space.transformLocks = flat.transformLocks; }
    if (flat.opaque !== undefined) { space.opaque = flat.opaque; }
    if (flat.camera !== undefined) { space.camera = flat.camera; }
    if (flat.transformOrigin !== undefined) { space.transformOrigin = flat.transformOrigin; }
    if (flat.transformMode !== undefined) { space.transformMode = flat.transformMode; }
    if (flat.cullingDistance !== undefined) {
        space.culling = { ...(space.culling || {}), distance: flat.cullingDistance };
    }
    if (flat.fadeInTime !== undefined) { space.fadeInTime = flat.fadeInTime; }
    if (flat.bridge !== undefined || flat.bridgeLength !== undefined || flat.bridgePlaneAngle !== undefined) {
        space.bridge = { ...(flat.bridge || {}) };
        if (flat.bridgeLength !== undefined) { space.bridge.length = flat.bridgeLength; }
        if (flat.bridgePlaneAngle !== undefined) { space.bridge.planeAngle = flat.bridgePlaneAngle; }
    }
    if (Object.keys(space).length > 0) { partial.space = space; }
    // #endregion space

    // #region elements
    const elements: PluridPartialConfiguration['elements'] = {};
    const plane: NonNullable<PluridPartialConfiguration['elements']>['plane'] = {};
    if (flat.planeWidth !== undefined) { plane.width = flat.planeWidth; }
    if (flat.planeHeight !== undefined) { plane.height = flat.planeHeight; }
    if (flat.planeOpacity !== undefined) { plane.opacity = flat.planeOpacity; }
    if (flat.planeControls !== undefined) { plane.controls = { show: flat.planeControls }; }
    if (flat.planeResizable !== undefined) { plane.resizable = flat.planeResizable; }
    if (flat.planeDepthFade !== undefined) { plane.depthFade = flat.planeDepthFade; }
    if (flat.planeBackface !== undefined) { plane.backface = flat.planeBackface; }
    if (Object.keys(plane).length > 0) { elements.plane = plane; }
    if (flat.toolbar !== undefined) { elements.toolbar = { show: flat.toolbar }; }
    if (flat.viewcube !== undefined) { elements.viewcube = { show: flat.viewcube }; }
    if (flat.dockRail !== undefined) { elements.dockRail = { show: flat.dockRail }; }
    if (flat.minimap !== undefined) { elements.minimap = { show: flat.minimap }; }
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
