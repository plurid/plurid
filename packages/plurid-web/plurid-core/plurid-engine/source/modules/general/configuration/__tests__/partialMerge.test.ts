// #region imports
    // #region libraries
    import {
        LAYOUT_TYPES,
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        merge,
        normalizeConfiguration,
        resolveDockingURL,
        definePluridConfiguration,
    } from '../index';

    import {
        cullPlanes,
        resolveDetachOptions,
    } from '../../../space/view/culling';
    // #endregion external
// #endregion imports



// #region module
/**
 * A PARTIAL UPDATE IS PARTIAL (audit 2026-09-29 #8): `configuration { space: { perspective } }` over
 * the live configuration reset the host's theme, re-applied the bridge preset over the host's own
 * bridge fields, and a scalar could never replace an object (`docking.url: false`).
 */
describe('merge(partial, live)', () => {
    let warn: jest.SpyInstance;
    beforeEach(() => {
        warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
        warn.mockRestore();
    });

    it('keeps the theme in force when the partial names none', () => {
        const live = merge({ global: { theme: 'night' } });
        expect(live.global.theme).toEqual({ general: 'night', interaction: 'night' });
        const next = merge({ space: { perspective: 3000 } }, live);
        expect(next.global.theme).toEqual({ general: 'night', interaction: 'night' });
        expect(next.space.perspective).toBe(3000);
        // a partial theme object names only its own parts
        const general = merge({ global: { theme: { general: 'dusk' } } }, live);
        expect(general.global.theme).toEqual({ general: 'dusk', interaction: 'night' });
        // a name is both parts
        expect(merge({ global: { theme: 'plurid' } }, live).global.theme).toEqual({ general: 'plurid', interaction: 'plurid' });
        // a target whose theme is a name keeps it through a partial that names none
        expect(merge({ space: { center: true } }, { ...live, global: { ...live.global, theme: 'dawn' } }).global.theme)
            .toEqual({ general: 'dawn', interaction: 'dawn' });
    });

    it('applies a bridge preset only when the partial names one', () => {
        const live = merge({ space: { bridge: { preset: 'objects', planeAngle: 60, anchor: 'edge' } } });
        expect(live.space.bridge).toMatchObject({ preset: 'objects', planeAngle: 60, anchor: 'edge', fan: 'fixed' });
        const unrelated = merge({ space: { perspective: 3000 } }, live);
        expect(unrelated.space.bridge).toMatchObject({ preset: 'objects', planeAngle: 60, anchor: 'edge', fan: 'fixed' });
        // naming a preset applies it under the fields the partial gives (a null one is not given)
        const switched = merge({ space: { bridge: { preset: 'reading', length: 140, planeAngle: null } } } as any, live);
        expect(switched.space.bridge).toMatchObject({ preset: 'reading', planeAngle: 90.1, fan: 'alternate', anchor: 'edge', length: 140 });
    });

    it('a scalar replaces an object: docking.url and culling.detach can be switched off', () => {
        const live = merge({ space: { docking: { url: { param: 'p' } }, culling: { enabled: true, detach: { mode: 'retain', delay: 300 } } } });
        expect(resolveDockingURL(live.space.docking!.url)).not.toBeNull();
        const off = merge({ space: { docking: { url: false }, culling: { detach: 'unmount' } } }, live);
        expect(off.space.docking!.url).toBe(false);
        expect(resolveDockingURL(off.space.docking!.url)).toBeNull();
        expect(off.space.culling!.detach).toBe('unmount');
        expect(resolveDetachOptions(off.space.culling)).toMatchObject({ mode: 'unmount', delay: 1000 });
        // and an object replaces the scalar again
        const on = merge({ space: { docking: { url: { base: '/docs' } } } }, off);
        expect(on.space.docking!.url).toEqual({ base: '/docs' });
    });

    it('keeps the host\'s callbacks: the configuration in force was cloned into empty functions', () => {
        let unhandled = 0;
        const onUnhandledKey = () => {
            unhandled += 1;
        };
        const live = merge({ space: { shortcuts: { onUnhandledKey } } });
        const next = merge({ space: { perspective: 3000 } }, live);
        expect(next.space.shortcuts!.onUnhandledKey).toBe(onUnhandledKey);
        next.space.shortcuts!.onUnhandledKey!({} as KeyboardEvent);
        expect(unhandled).toBe(1);
    });

    it('a scalar where the configuration holds an object is ignored: the object in force stays', () => {
        const live = merge({ space: { navigation: { pitchLimit: 60 } } });
        const next = merge({ space: { navigation: 5, layout: 'rows', snap: [1] }, elements: { toolbar: false } } as any, live);
        expect(next.space.navigation!.pitchLimit).toBe(60);
        expect(next.space.layout).toEqual(live.space.layout);
        expect(next.space.snap).toEqual(live.space.snap);
        expect(next.elements.toolbar).toEqual(live.elements.toolbar);
        expect(merge({ space: 'x' } as any).space).toEqual(defaultConfiguration.space);
        expect(merge({ elements: { toolbar: { drawers: 'all' } } } as any).elements.toolbar.drawers).toEqual([]);
    });
});


/**
 * `null` IS "UNSET", AND A NUMBER IS A NUMBER (audit 2026-09-29 #9): `culling.distance: null`
 * overrode the default and was read as 0 by the culling arithmetic — every plane but the active,
 * selected and docked ones stopped painting.
 */
describe('the merged configuration is normalised once', () => {
    let warn: jest.SpyInstance;
    beforeEach(() => {
        warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
        warn.mockRestore();
    });

    it('a null leaf is the default', () => {
        const configuration = merge({ space: { culling: { enabled: true, distance: null, freezeDistance: null }, perspective: null, docking: { url: null } } } as any);
        expect(configuration.space.culling).toMatchObject({ enabled: true, distance: 6000, freezeDistance: 3500 });
        expect(configuration.space.perspective).toBe(2000);
        expect('url' in configuration.space.docking!).toBe(false);
        // over a live value too: null resets it
        const live = merge({ space: { perspective: 3000 } });
        expect(merge({ space: { perspective: null } } as any, live).space.perspective).toBe(2000);
        expect(merge({ space: { layout: null } } as any).space.layout).toEqual(defaultConfiguration.space.layout);
        // and the culling pass reads the default
        const plane = { id: 'a', location: { translateX: 0, translateY: 0, translateZ: -2000, rotateX: 0, rotateY: 0 }, width: 100, height: 100 };
        const camera = { yaw: 0, pitch: 0, roll: 0, scale: 1, pivot: { x: 600, y: 400, z: 0 }, offset: { x: 0, y: 0, z: 0 }, perspective: 2000 };
        expect(cullPlanes([plane], camera, { width: 1200, height: 800 }, configuration.space.culling as any).hidden).toEqual([]);
    });

    it('a numeric knob holds a finite number: a numeric string is read, anything else keeps the value in force', () => {
        expect(merge({ space: { perspective: '2000px' } } as any).space.perspective).toBe(2000);
        expect(merge({ elements: { plane: { width: '0.5' } } } as any).elements.plane.width).toBe(0.5);
        const live = merge({ space: { perspective: 3000 } });
        expect(merge({ space: { perspective: NaN } }, live).space.perspective).toBe(3000);
        expect(merge({ space: { perspective: Infinity } }, live).space.perspective).toBe(3000);
        expect(merge({ space: { navigation: { zoomMax: 'x' } } } as any).space.navigation!.zoomMax).toBe(4);
        // a knob with no default drops a non-finite number (its consumer's default applies)
        expect('grid' in merge({ space: { snap: { grid: NaN } } }).space.snap!).toBe(false);
        const rolled = merge({ space: { navigation: { rollLimit: 10 } } });
        expect(merge({ space: { navigation: { rollLimit: Infinity } } }, rolled).space.navigation!.rollLimit).toBe(10);
        expect(warn.mock.calls.some(([message]) => message.includes('space.perspective'))).toBe(true);
    });

    it('the layout type is one the engine lays out', () => {
        expect(merge({ space: { layout: { type: 'columns', columns: 3 } } } as any).space.layout).toEqual({ type: LAYOUT_TYPES.COLUMNS, columns: 3 });
        expect(merge({ space: { layout: { type: LAYOUT_TYPES.META, layouts: [] } } }).space.layout.type).toBe(LAYOUT_TYPES.COLUMNS);
        expect(merge({ space: { layout: { type: 'face to face', middle: 1 } } } as any).space.layout.type).toBe(LAYOUT_TYPES.FACE_TO_FACE);
        expect(definePluridConfiguration({ layout: { type: 'rows' } as any }).space.layout.type).toBe(LAYOUT_TYPES.ROWS);
    });

    it('returns the configuration as it is when there is nothing to change', () => {
        const clean = merge();
        expect(normalizeConfiguration(clean, clean)).toBe(clean);
        expect(normalizeConfiguration(null as any, clean)).toBe(null);
    });
});
// #endregion module
