// #region imports
    // #region libraries
    import {
        LAYOUT_TYPES,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        definePluridConfiguration,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
describe('definePluridConfiguration', () => {
    it('returns the defaults for empty input', () => {
        const configuration = definePluridConfiguration();

        expect(configuration.space.center).toBe(false);
        expect(configuration.space.perspective).toBe(2000);
        expect(configuration.elements.plane.width).toBe(1);
        expect(configuration.global.theme).toEqual({
            general: 'plurid',
            interaction: 'plurid',
        });
    });

    it('expands flat shortcuts to their nested locations + resolves the theme', () => {
        const configuration = definePluridConfiguration({
            theme: 'plurid',
            center: true,
            firstPerson: true,
            planeWidth: 0.32,
            bridgeLength: 160,
            toolbar: false,
            layout: {
                type: LAYOUT_TYPES.ROWS,
                rows: 3,
            },
        });

        // flat → nested
        expect(configuration.space.center).toBe(true);
        expect(configuration.space.firstPerson).toBe(true);
        expect(configuration.elements.plane.width).toBe(0.32);
        expect(configuration.space.bridge?.length).toBe(160);
        expect(configuration.elements.toolbar.show).toBe(false);
        expect(configuration.space.layout.type).toBe(LAYOUT_TYPES.ROWS);

        // a string theme is resolved to the full { general, interaction } object
        expect(configuration.global.theme).toEqual({
            general: 'plurid',
            interaction: 'plurid',
        });

        // untouched fields keep their defaults
        expect(configuration.space.perspective).toBe(2000);
        expect(configuration.elements.plane.opacity).toBe(1);
        expect(configuration.elements.viewcube.show).toBe(true);
    });

    it('preserves sibling defaults when only one nested sub-field is set', () => {
        const configuration = definePluridConfiguration({
            planeControls: false,
        });

        expect(configuration.elements.plane.controls.show).toBe(false);
        // siblings under the same parent are NOT wiped
        expect(configuration.elements.plane.controls.title).toBe(true);
        expect(configuration.elements.plane.width).toBe(1);
    });

    it('`extend` is layered last — it overrides flat fields and reaches uncovered ones', () => {
        const configuration = definePluridConfiguration({
            planeWidth: 0.5,
            extend: {
                elements: {
                    plane: {
                        width: 0.9,
                    },
                },
                development: {
                    planeDebugger: true,
                },
            },
        });

        expect(configuration.elements.plane.width).toBe(0.9); // extend wins over flat 0.5
        expect(configuration.development.planeDebugger).toBe(true); // field with no flat shortcut
    });


    // #region developer-control surface (Tiers 2–3)
    it('defaults the Tier 2 opt-outs to "keep" so existing apps are unchanged', () => {
        const configuration = definePluridConfiguration({ theme: 'plurid' });

        expect(configuration.space.undo).toBe(true);
        expect(configuration.space.timings).toEqual({
            persistDebounce: 300,
            viewpointChangeDebounce: 250,
        });
    });

    it('maps the Tier 2 opt-out fields (undo, timings)', () => {
        const configuration = definePluridConfiguration({
            undo: false,
            timings: { persistDebounce: 80, viewpointChangeDebounce: 40 },
        });

        expect(configuration.space.undo).toBe(false);
        expect(configuration.space.timings).toEqual({ persistDebounce: 80, viewpointChangeDebounce: 40 });
    });

    it('maps the Tier 3 gestures + shortcuts objects through wholesale', () => {
        const onUnhandledKey = () => { /* host handler */ };
        const configuration = definePluridConfiguration({
            gestures: {
                rotateSensitivity: 0.44,
                dragThreshold: 0,
                disableMomentum: true,
                flySpeed: 12,
            },
            shortcuts: {
                disabled: ['modeRotation'],
                keymap: { modeScale: 'KeyP' },
                onUnhandledKey,
            },
        });

        expect(configuration.space.gestures).toEqual({
            rotateSensitivity: 0.44,
            dragThreshold: 0,
            disableMomentum: true,
            flySpeed: 12,
        });
        expect(configuration.space.shortcuts?.disabled).toEqual(['modeRotation']);
        expect(configuration.space.shortcuts?.keymap).toEqual({ modeScale: 'KeyP' });
        // The function value must survive the defaults-merge BY REFERENCE (not be recursed-into / dropped).
        expect(configuration.space.shortcuts?.onUnhandledKey).toBe(onUnhandledKey);
    });

    it('completes the flat preset for the previously nested-only fields (Tier 3b)', () => {
        const configuration = definePluridConfiguration({
            opaque: false,
            camera: '/geometry',
            transformMode: 'ROTATION',
            transformMultimode: true,
            transformTouch: 'PAN',
            cullingDistance: 9999,
            fadeInTime: 42,
            transformOrigin: { show: true },
        });

        expect(configuration.space.opaque).toBe(false);
        expect(configuration.space.camera).toBe('/geometry');
        expect(configuration.space.transformMode).toBe('ROTATION');
        expect(configuration.space.transformMultimode).toBe(true);
        expect(configuration.space.transformTouch).toBe('PAN');
        expect(configuration.space.cullingDistance).toBe(9999);
        expect(configuration.space.fadeInTime).toBe(42);
        // Merged over the default origin — `show` overridden, `size` default retained.
        expect(configuration.space.transformOrigin.show).toBe(true);
        expect(configuration.space.transformOrigin.size).toBeDefined();
    });

    it('reaches the element show-flags via `extend` (planeLinks / alignmentGuides)', () => {
        const configuration = definePluridConfiguration({
            extend: {
                elements: {
                    planeLinks: { show: false },
                    alignmentGuides: { show: false },
                },
            },
        });

        expect(configuration.elements.planeLinks?.show).toBe(false);
        expect(configuration.elements.alignmentGuides?.show).toBe(false);
    });
    // #endregion developer-control surface
});
// #endregion module
