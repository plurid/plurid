// #region imports
    // #region libraries
    import {
        LOOK_NAMES,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import {
        warnOnce,
    } from './warn';
    // #endregion internal
// #endregion imports



// #region module
/** The keys of the nested configuration (`PluridPartialConfiguration`). */
const NESTED_KEYS = new Set(['global', 'elements', 'space', 'network', 'development']);

/**
 * The keys of the FLAT configuration (`FlatPluridConfiguration`): the shape
 * `definePluridConfiguration` takes. Passed straight as `configuration` they are not keys at all,
 * and the configuration was dropped without a word (`{ chrome: 'none' }` kept every piece of chrome).
 */
const FLAT_KEYS = new Set([
    'look', 'theme', 'transparentUI', 'language', 'chrome',
    'layout', 'spaceDimensions', 'perspective', 'center', 'presentation', 'docking', 'firstPerson',
    'collaboration', 'undo', 'clipboard', 'viewpointURLWrite', 'viewpointURLRestore', 'viewpointURLParam',
    'viewpointURLDebounce', 'viewpointURLVersion', 'navigation', 'snap', 'culling', 'timings', 'gestures',
    'shortcuts', 'bridge', 'bridgeLength', 'bridgePlaneAngle', 'transformLocks', 'opaque', 'camera',
    'transformOrigin', 'transformMode', 'fadeInTime', 'planeWidth', 'planeHeight', 'planeMaxHeight',
    'planeOpacity', 'planeDepthFade', 'planeBackface', 'planeResizable', 'toolbar', 'viewcube',
    'minimap', 'extend',
]);

const CHROME_MODES = ['full', 'minimal', 'none'];
const PRESENTATIONS = ['space', 'page'];

export interface ApplicationInput {
    view?: unknown;
    configuration?: unknown;
    useLocalStorage?: boolean;
    storageAdapter?: unknown;
    onPersistContent?: unknown;
    onRestoreContent?: unknown;
}

/**
 * THE VIEW, AS AN ARRAY. A missing `view` threw "view is not iterable" and a string threw
 * "stateSpaceView.filter is not a function", both from deep inside the engine.
 */
export const normalizeView = (
    view: unknown,
    warnings: boolean,
): (string | { plane: string })[] => {
    if (Array.isArray(view)) {
        return view;
    }
    if (typeof view === 'string') {
        warnOnce('view-string', `\`view\` is a string ('${view}'): it takes an array of routes, read here as ['${view}'].`, warnings);
        return [view];
    }
    if (view !== undefined && view !== null) {
        warnOnce('view-shape', '`view` is not an array of routes: the space starts empty.', warnings);
    }
    return [];
};


/**
 * WHAT A HOST PASSES, CHECKED ONCE IN DEVELOPMENT. A value the engine cannot use falls back to a
 * default without a word (`look: 'papr'` is graphite, `presentation: 'pages'` is a space), and a
 * flat key in the nested configuration is not a key at all; a storage adapter without
 * `useLocalStorage` is never called. Each is named once, with what to write instead.
 */
export const validateApplicationInput = (
    input: ApplicationInput,
    warnings: boolean,
) => {
    if (!warnings) {
        return;
    }

    const configuration = input.configuration;
    if (configuration && typeof configuration === 'object' && !Array.isArray(configuration)) {
        for (const key of Object.keys(configuration)) {
            if (NESTED_KEYS.has(key)) {
                continue;
            }
            warnOnce(
                'configuration-key:' + key,
                FLAT_KEYS.has(key)
                    ? `\`configuration.${key}\` is a key of the FLAT configuration and is ignored here: pass \`configuration={definePluridConfiguration({ ${key}: … })}\`, or nest it (global, elements, space, network, development).`
                    : `\`configuration.${key}\` is not a key of the configuration and is ignored: the keys are global, elements, space, network, development (or the flat ones, through definePluridConfiguration).`,
            );
        }

        const nested = configuration as {
            global?: { look?: unknown };
            elements?: { chrome?: unknown };
            space?: { presentation?: unknown };
        };
        const look = nested.global?.look;
        const lookName = typeof look === 'string'
            ? look
            : (look && typeof look === 'object' ? (look as { preset?: unknown }).preset : undefined);
        if (typeof lookName === 'string' && !(LOOK_NAMES as string[]).includes(lookName)) {
            warnOnce(
                'configuration-look:' + lookName,
                `the look '${lookName}' is not one of the looks (${LOOK_NAMES.join(', ')}): graphite is used.`,
            );
        }
        const chrome = nested.elements?.chrome;
        if (chrome !== undefined && !CHROME_MODES.includes(chrome as string)) {
            warnOnce(
                'configuration-chrome:' + String(chrome),
                `\`elements.chrome\` is '${String(chrome)}': it takes ${CHROME_MODES.join(', ')}.`,
            );
        }
        const presentation = nested.space?.presentation;
        if (presentation !== undefined && !PRESENTATIONS.includes(presentation as string)) {
            warnOnce(
                'configuration-presentation:' + String(presentation),
                `\`space.presentation\` is '${String(presentation)}': it takes 'space' or 'page' (the space is used).`,
            );
        }
    }

    if (!input.useLocalStorage) {
        const unused = [
            input.storageAdapter ? 'storageAdapter' : '',
            input.onPersistContent ? 'onPersistContent' : '',
            input.onRestoreContent ? 'onRestoreContent' : '',
        ].filter(Boolean);
        if (unused.length > 0) {
            warnOnce(
                'persistence-without-storage',
                `${unused.join(', ')} ${unused.length > 1 ? 'are' : 'is'} set but \`useLocalStorage\` is not: nothing is saved or restored until it is.`,
            );
        }
    }
};
// #endregion module
