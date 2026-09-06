// #region imports
    // #region libraries
    import {
        FlatPluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries

    // #region external
    import {
        definePluridConfiguration,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
/**
 * EVERY flat key reaches its nested location. The table is typed over `keyof FlatPluridConfiguration`,
 * so a new flat key without a row is a compile error, and the test proves the row.
 */
type Row = { value: unknown; path: string; expect?: unknown };
const ROWS: Record<keyof FlatPluridConfiguration, Row | null> = {
    look: { value: 'paper', path: 'global.look' },
    theme: { value: 'night', path: 'global.theme', expect: { general: 'night', interaction: 'night' } },
    transparentUI: { value: true, path: 'global.transparentUI' },
    language: { value: 'romanian', path: 'global.language' },
    layout: { value: { type: 'ROWS' }, path: 'space.layout.type', expect: 'ROWS' },
    spaceDimensions: { value: { width: 800, height: 600 }, path: 'space.dimensions' },
    perspective: { value: 1234, path: 'space.perspective' },
    center: { value: true, path: 'space.center' },
    presentation: { value: 'page', path: 'space.presentation' },
    docking: { value: { motion: 'instant' }, path: 'space.docking.motion', expect: 'instant' },
    firstPerson: { value: true, path: 'space.firstPerson' },
    collaboration: { value: true, path: 'space.collaboration' },
    undo: { value: false, path: 'space.undo' },
    viewpointURLWrite: { value: true, path: 'space.viewpointURLWrite' },
    viewpointURLRestore: { value: true, path: 'space.viewpointURLRestore' },
    viewpointURLParam: { value: 'vp', path: 'space.viewpointURLParam' },
    viewpointURLDebounce: { value: 99, path: 'space.viewpointURLDebounce' },
    viewpointURLVersion: { value: 2, path: 'space.viewpointURLVersion' },
    snap: { value: { threshold: 7 }, path: 'space.snap.threshold', expect: 7 },
    culling: { value: { enabled: true }, path: 'space.culling.enabled', expect: true },
    navigation: { value: { pitchLimit: 45 }, path: 'space.navigation.pitchLimit', expect: 45 },
    timings: { value: { persistDebounce: 11 }, path: 'space.timings.persistDebounce', expect: 11 },
    gestures: { value: { wheelSmoothing: 0.1 }, path: 'space.gestures.wheelSmoothing', expect: 0.1 },
    shortcuts: { value: { disabled: true }, path: 'space.shortcuts.disabled', expect: true },
    transformLocks: { value: { rotate: false }, path: 'space.transformLocks.rotate', expect: false },
    opaque: { value: false, path: 'space.opaque' },
    camera: { value: '/a', path: 'space.camera' },
    transformOrigin: { value: { show: true }, path: 'space.transformOrigin.show', expect: true },
    transformMode: { value: 'ROTATION', path: 'space.transformMode' },
    cullingDistance: { value: 4321, path: 'space.culling.distance' },
    fadeInTime: { value: 5, path: 'space.fadeInTime' },
    bridge: { value: { fan: 'alternate' }, path: 'space.bridge.fan', expect: 'alternate' },
    bridgeLength: { value: 55, path: 'space.bridge.length' },
    bridgePlaneAngle: { value: 33, path: 'space.bridge.planeAngle' },
    planeWidth: { value: 0.4, path: 'elements.plane.width' },
    planeHeight: { value: 0.6, path: 'elements.plane.height' },
    planeOpacity: { value: 0.5, path: 'elements.plane.opacity' },
    planeControls: { value: false, path: 'elements.plane.controls.show' },
    planeResizable: { value: true, path: 'elements.plane.resizable' },
    planeDepthFade: { value: { enabled: true }, path: 'elements.plane.depthFade.enabled', expect: true },
    planeBackface: { value: 'hidden', path: 'elements.plane.backface' },
    toolbar: { value: false, path: 'elements.toolbar.show' },
    viewcube: { value: false, path: 'elements.viewcube.show' },
    minimap: { value: true, path: 'elements.minimap.show' },
    dockRail: { value: false, path: 'elements.dockRail.show' },
    chrome: { value: 'none', path: 'elements.chrome' },
    origin: { value: false, path: 'elements.origin.show' },
    planeBridge: { value: false, path: 'elements.planeBridge.show' },
    shortcutsTrigger: { value: false, path: 'elements.shortcuts.show' },
    marquee: { value: false, path: 'elements.marquee.show' },
    // `extend` is the nested escape hatch itself, not a flat key with one location
    extend: null,
};

const read = (target: any, path: string) => path.split('.').reduce((node, key) => (node == null ? node : node[key]), target);

describe('the flat preset is complete', () => {
    it('every flat key lands at its nested location', () => {
        for (const [key, row] of Object.entries(ROWS)) {
            if (!row) {
                continue;
            }
            const configuration = definePluridConfiguration({ [key]: row.value } as any);
            expect({ key, value: read(configuration, row.path) }).toEqual({ key, value: row.expect ?? row.value });
        }
    });
});
// #endregion module
