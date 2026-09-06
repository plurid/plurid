import { definePluridConfiguration } from '@plurid/plurid-react';
import type { HarnessFlags } from './flags';
import { layoutByKey } from './layouts';

/**
 * The typed flags → the application configuration, through the flat-config shorthand
 * (`definePluridConfiguration`), which this doubles as a usage example of. Only what a flag sets
 * is written; everything else stays at the engine's defaults.
 */
export const buildConfiguration = (
    flags: HarnessFlags,
) => {
    const stress = !!flags.planes;
    const flat: Record<string, any> = {
        theme: 'plurid',
        center: true,
        layout: layoutByKey(flags.layout, stress),
        planeWidth: stress ? 0.16 : 0.32,
        // The link-spawn bridge length (default 100): the gap between parent and child AND the
        // rendered bridge, so they stay aligned.
        bridgeLength: 160,
        minimap: true,
    };

    // The page presentation: the site set as a site — every page the width of the view, the first
    // one at the origin (no centering): the identity camera IS its dock pose.
    if (flags.presentation === 'page') {
        flat.presentation = 'page';
        flat.planeWidth = 1;
        flat.center = false;
    }
    if (flags.dockMotion || flags.dockChrome) {
        flat.docking = {
            ...(flags.dockMotion ? { motion: flags.dockMotion } : {}),
            ...(flags.dockChrome ? { chrome: flags.dockChrome } : {}),
        };
    }

    if (flags.url) {
        flat.docking = {
            ...(flat.docking ?? {}),
            url: flags.url === '1',
        };
    }
    if (flags.vpURL) {
        flat.viewpointURLWrite = true;
        flat.viewpointURLRestore = true;
    }

    if (flags.undoOff) {
        flat.undo = false;
    }
    if (flags.persistMs !== undefined) {
        flat.timings = { persistDebounce: flags.persistMs };
    }

    const gestures: Record<string, any> = {};
    if (flags.gamepad) gestures.gamepad = { enabled: true };
    if (flags.rotateSens !== undefined) gestures.rotateSensitivity = flags.rotateSens;
    if (flags.dragThreshold !== undefined) gestures.dragThreshold = flags.dragThreshold;
    if (flags.btnLeft || flags.btnRight || flags.btnWheel) {
        gestures.buttonMap = {
            ...(flags.btnLeft ? { left: flags.btnLeft } : {}),
            ...(flags.btnRight ? { right: flags.btnRight } : {}),
            ...(flags.btnWheel ? { wheel: flags.btnWheel } : {}),
        };
    }
    if (flags.touchOne) gestures.touchOne = flags.touchOne;
    if (flags.trackpad) gestures.trackpadScroll = flags.trackpad;
    if (flags.momentumOff) gestures.disableMomentum = true;
    if (flags.wheel) gestures.wheel = flags.wheel;
    if (flags.doubleClickOff) gestures.doubleClickFrame = false;
    if (Object.keys(gestures).length > 0) {
        flat.gestures = gestures;
    }

    // onUnhandledKey is ALWAYS wired to a window collector so a test can assert it fires.
    const shortcuts: Record<string, any> = {
        onUnhandledKey: (event: KeyboardEvent) => {
            const log: string[] = ((window as any).__rtUnhandled = (window as any).__rtUnhandled || []);
            log.push(event.code);
        },
    };
    if (flags.scDisable) {
        shortcuts.disabled = flags.scDisable === 'all' ? true : flags.scDisable.split(',');
    }
    if (flags.scRemap) {
        shortcuts.keymap = Object.fromEntries(flags.scRemap.split(',').map((pair) => pair.split(':')));
    }
    flat.shortcuts = shortcuts;

    if (flags.look) {
        flat.look = flags.look as any;
    }
    if (flags.chrome) {
        flat.chrome = flags.chrome;
    }

    if (flags.hideLinks || flags.debug) {
        flat.extend = {
            ...(flags.hideLinks ? { elements: { planeLinks: { show: false }, alignmentGuides: { show: false } } } : {}),
            ...(flags.debug ? { development: { spaceDebugger: true, planeDebugger: true } } : {}),
        };
    }
    if (flags.spaceW !== undefined || flags.spaceH !== undefined) {
        flat.spaceDimensions = {
            ...(flags.spaceW !== undefined ? { width: flags.spaceW } : {}),
            ...(flags.spaceH !== undefined ? { height: flags.spaceH } : {}),
        };
    }
    if (flags.perspective !== undefined) {
        flat.perspective = flags.perspective;
    }

    const navigation: Record<string, any> = {};
    if (flags.pitchLimit !== undefined) navigation.pitchLimit = flags.pitchLimit;
    if (flags.pivot) navigation.orbitPivot = flags.pivot;
    if (flags.reducedMotion) {
        navigation.motion = { duration: 0 };
    } else if (flags.motionMs !== undefined) {
        navigation.motion = { duration: flags.motionMs };
    }
    if (flags.home) navigation.home = flags.home;
    if (flags.presets) navigation.presets = { front: '0,0,0,0,0,1', side: '0,90,0,0,0,1', top: '80,0,0,0,0,1' };
    if (Object.keys(navigation).length > 0) {
        flat.navigation = navigation;
    }

    if (flags.vp === '2') flat.viewpointURLVersion = 2;
    if (flags.resizable) flat.planeResizable = true;
    if (flags.snapGrid) flat.snap = { enabled: true, threshold: 12, grid: flags.snapGrid };
    if (flags.culling) {
        flat.culling = {
            enabled: true,
            ...(flags.cullDistance ? { distance: flags.cullDistance } : {}),
            ...(flags.freezeDistance ? { freezeDistance: flags.freezeDistance } : {}),
        };
    }
    if (flags.depthFade) flat.planeDepthFade = { enabled: true };

    return definePluridConfiguration(flat as any);
};
