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
        bridgePresets,
        PLURID_DOCKING_URL_PARAM,
        PluridConfigurationSpaceDocking,
        DockingURLBinding,
    } from '@plurid/plurid-data';

    import {
        objects,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        resolveLayoutType,
    } from '~modules/space/layout/type';

    import {
        warnDevelopment,
    } from '~modules/utilities';
    // #endregion external
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


/**
 * The four page defaults win over a value equal to the space default (`pagePresentationDefaults`);
 * `docking.url` has no space default (unset = off there), so an explicit `false` under the page
 * presentation is honoured.
 */
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
    if (configuration.space.docking?.url === undefined) {
        configuration.space.docking = {
            ...configuration.space.docking,
            url: pagePresentationDefaults.space!.docking!.url,
        };
    }
};


/** A `docking.url.base` as the binding carries it: a leading slash, no trailing one, `''` for none. */
/** `docking.url.base` normalised: one leading slash, no trailing one, no doubled ones; `''` for none. */
export const normalizeDockingURLBase = (
    base: string | undefined,
): string => ('/' + (base || '').trim())
    .replace(/\/{2,}/g, '/')
    .replace(/\/+$/, '');


/**
 * Resolve `space.docking.url`: unset / `false` → no binding; `true` → both directions, the pathname,
 * history entries; an object → its flags (`write` / `restore` default on; both off → no binding), a
 * `param` selects the query mode, `base` the pathname prefix (the query mode ignores it), `orphan`
 * what a path naming no page does. Inside a host router (`context.router`) the pathname is the
 * router's: the query mode with `page` (or the given `param`) and `replace` history, whatever was
 * asked — a router entry must never be shadowed by ours.
 */
export const resolveDockingURL = (
    url: PluridConfigurationSpaceDocking['url'] | undefined,
    context: { router: boolean } = { router: false },
): DockingURLBinding | null => {
    if (!url) {
        return null;
    }
    const options = url === true ? {} : url;
    const write = options.write !== false;
    const restore = options.restore !== false;
    if (!write && !restore) {
        return null;
    }
    const query = context.router || typeof options.param === 'string';
    return {
        write,
        restore,
        history: context.router ? 'replace' : (options.history ?? (query ? 'replace' : 'push')),
        mode: query ? 'query' : 'path',
        param: options.param || PLURID_DOCKING_URL_PARAM,
        base: query ? '' : normalizeDockingURLBase(options.base),
        orphan: options.orphan === 'keep' ? 'keep' : 'root',
    };
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
    const targetConfiguration = normalizeConfiguration(
        objects.merge(base, objects.clone(target || {})) as PluridConfiguration,
        base,
        base,
    );
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
            // the look is taken whole (a name, a base, or a preset with overrides): never a deep merge
            // of a string with an object
            'global.look': () => (configuration.global?.look !== undefined
                ? configuration.global.look
                : (target?.global?.look ?? defaultConfiguration.global.look)),
            // A PARTIAL THAT NAMES NO THEME KEEPS THE ONE IN FORCE, as the look does: this read the
            // partial alone, so `configuration { space: { perspective } }` reset a host's theme to
            // plurid. A name is both parts; an object names the parts it has; `null` is the default.
            'global.theme': () => {
                const given = configuration.global?.theme;
                const current = given === null
                    ? defaultConfiguration.global.theme
                    : targetConfiguration.global?.theme;
                const part = (type: 'general' | 'interaction') => {
                    const named = typeof given === 'string'
                        ? given
                        : (given && typeof given === 'object' ? given[type] : undefined);
                    return named
                        ? resolveTheme(given, type)
                        : resolveTheme(current, type);
                };
                return {
                    general: part('general') as any,
                    interaction: part('interaction') as any,
                };
            },
        },
    );

    return normalizeConfiguration(
        resolveBridgePreset(mergedConfiguration, configuration),
        targetConfiguration,
        base,
    );
}


/**
 * A NAMED BRIDGE PRESET applies UNDER the fields given explicitly: `{ preset: 'objects' }` is the
 * old geometry whole, `{ preset: 'objects', planeAngle: 60 }` the old geometry at 60°. The
 * defaults equal the `reading` preset, so a configuration that names none is unchanged.
 *
 * Only a partial that NAMES a preset applies one. The target's preset used to be re-applied on
 * every merge, over the target's own explicit fields: an unrelated update turned a host's
 * `{ preset: 'objects', planeAngle: 60, anchor: 'edge' }` back into 90° from the link. The merged
 * bridge already holds the target's fields; a preset named on the target stays its label.
 */
const resolveBridgePreset = (
    merged: PluridConfiguration,
    configuration?: PluridPartialConfiguration,
): PluridConfiguration => {
    const explicit = configuration?.space?.bridge;
    const preset = explicit?.preset;
    if (!preset || !bridgePresets[preset]) {
        return merged;
    }

    // the fields the partial GIVES: a `null` or `undefined` one is not given (the preset's stands)
    const given = Object.fromEntries(
        Object.entries(explicit).filter(([, value]) => value !== null && value !== undefined),
    );

    return {
        ...merged,
        space: {
            ...merged.space,
            bridge: {
                ...merged.space.bridge,
                ...bridgePresets[preset],
                ...given,
                preset,
            },
        },
    };
};


const isPlainObject = (
    value: unknown,
): value is Record<string, unknown> => !!value
    && typeof value === 'object'
    && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

/** A value a finite number reads as: a number, or a numeric string (`'0.5'`); `undefined` otherwise (`'2000px'`, NaN, ±Infinity). */
const finiteReading = (
    value: unknown,
): number | undefined => {
    const number = typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : value;
    return typeof number === 'number' && Number.isFinite(number) ? number : undefined;
};

/** The knobs whose default is an object but which a name may hold (`global.theme: 'night'`). */
const NAMED_OBJECT_KNOBS = new Set<string>([
    'global.theme',
]);

/**
 * ONE READING OF A MERGED CONFIGURATION, so every consumer reads the same value. `null` (JSON's
 * "unset") used to override a default and then be read as 0 by arithmetic (`culling.distance:
 * null` hid every plane), as unset by `??` and `||`, as NaN elsewhere. Now, walking `node` beside
 * the `previous` configuration (the one in force) and the `defaults`:
 * - `null` is the default (a knob with no default is dropped);
 * - a knob whose default is a number holds a finite number: a numeric string is read as one, any
 *   other value (`'2000px'`, NaN, ±Infinity) keeps the previous value, else the default;
 * - any other non-finite number keeps the previous finite value, else is dropped (its consumer's
 *   own default applies);
 * - a knob whose default is an object or an array holds one (`space: 'x'` keeps the previous);
 * - `space.layout.type` is a layout the engine lays out (`resolveLayoutType`: `'columns'` is
 *   COLUMNS; META, never implemented, and an unknown type are COLUMNS).
 * Whatever was not taken as written gets a development warning. The same objects come back where
 * nothing changed.
 */
export const normalizeConfiguration = (
    configuration: PluridConfiguration,
    previous: PluridConfiguration | undefined,
    defaults: PluridConfiguration = defaultConfiguration,
): PluridConfiguration => {
    const warnings = configuration?.development?.warnings !== false;
    const report = (path: string, value: unknown, taken: string) => warnDevelopment(
        'configuration:' + path,
        'the configuration\'s `' + path + '` is ' + describeValue(value) + ': ' + taken,
        warnings,
    );

    const walk = (
        node: Record<string, unknown>,
        previousNode: unknown,
        defaultNode: unknown,
        path: string,
    ): Record<string, unknown> => {
        let result = node;
        const set = (key: string, value: unknown) => {
            if (result === node) {
                result = { ...node };
            }
            if (value === undefined) {
                delete result[key];
            } else {
                result[key] = value;
            }
        };

        for (const key of Object.keys(node)) {
            const keyPath = path ? path + '.' + key : key;
            const value = node[key];
            const previousValue = isPlainObject(previousNode) ? previousNode[key] : undefined;
            const defaultValue = isPlainObject(defaultNode) ? defaultNode[key] : undefined;

            if (value === null) {
                set(key, isPlainObject(defaultValue) || Array.isArray(defaultValue) ? objects.clone(defaultValue) : defaultValue);
                continue;
            }

            if (typeof defaultValue === 'number') {
                if (typeof value === 'number' && Number.isFinite(value)) {
                    continue;
                }
                const reading = finiteReading(value);
                if (reading !== undefined) {
                    set(key, reading);
                    continue;
                }
                const kept = finiteReading(previousValue) ?? defaultValue;
                report(keyPath, value, 'not a finite number, ' + kept + ' is used');
                set(key, kept);
                continue;
            }

            if (typeof value === 'number' && !Number.isFinite(value)) {
                const kept = typeof previousValue === 'number' && Number.isFinite(previousValue) ? previousValue : undefined;
                report(keyPath, value, kept === undefined ? 'not a finite number, it is ignored' : 'not a finite number, ' + kept + ' is kept');
                set(key, kept);
                continue;
            }

            if (
                (isPlainObject(defaultValue) && !isPlainObject(value) && !NAMED_OBJECT_KNOBS.has(keyPath))
                || (Array.isArray(defaultValue) && !Array.isArray(value))
            ) {
                const kept = objects.clone(
                    (isPlainObject(defaultValue) ? isPlainObject(previousValue) : Array.isArray(previousValue))
                        ? previousValue
                        : defaultValue,
                );
                report(keyPath, value, 'not ' + (isPlainObject(defaultValue) ? 'an object' : 'an array') + ', it is ignored');
                set(key, kept);
                continue;
            }

            if (isPlainObject(value)) {
                const walked = walk(value, previousValue, defaultValue, keyPath);
                if (walked !== value) {
                    set(key, walked);
                }
            }
        }

        return result;
    };

    if (!isPlainObject(configuration)) {
        return configuration;
    }

    let normalized = walk(configuration as unknown as Record<string, unknown>, previous, defaults, '') as unknown as PluridConfiguration;

    // THE LAYOUT IS ONE THE ENGINE LAYS OUT: the configuration says what the space shows (the
    // toolbar names it; META is not offered there any more)
    const layout = normalized.space?.layout;
    if (isPlainObject(layout)) {
        const resolved = resolveLayoutType(layout.type);
        if (resolved.reason) {
            warnDevelopment('layout-type:' + String(layout.type), resolved.reason, warnings);
        }
        if (resolved.type !== layout.type) {
            normalized = {
                ...normalized,
                space: {
                    ...normalized.space,
                    layout: {
                        ...layout,
                        type: resolved.type,
                    } as PluridConfiguration['space']['layout'],
                },
            };
        }
    }

    return normalized;
};


/** A value as a warning quotes it (never throws: a BigInt, a cycle). */
const describeValue = (
    value: unknown,
): string => {
    if (typeof value === 'number') {
        return String(value);
    }
    try {
        return JSON.stringify(value) ?? String(value);
    } catch {
        return typeof value;
    }
};


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
    if (flat.look !== undefined) { global.look = flat.look; }
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
    if (flat.clipboard !== undefined) { space.clipboard = flat.clipboard; }
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
    if (flat.planeMaxHeight !== undefined) { plane.maxHeight = flat.planeMaxHeight; }
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
    if (flat.chrome !== undefined) { elements.chrome = flat.chrome; }
    if (flat.origin !== undefined) { elements.origin = { show: flat.origin }; }
    if (flat.planeBridge !== undefined) { elements.planeBridge = { show: flat.planeBridge }; }
    if (flat.linkDraggable !== undefined) { elements.link = { ...(elements.link as any), draggable: flat.linkDraggable }; }
    if (flat.shortcutsTrigger !== undefined) { elements.shortcuts = { show: flat.shortcutsTrigger }; }
    if (flat.palette !== undefined) { elements.palette = { show: flat.palette }; }
    if (flat.marquee !== undefined) { elements.marquee = { show: flat.marquee }; }
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
