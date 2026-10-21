import {
    configurationChanges,
    onlyCallbacks,
    sameContent,
} from '../changes';



describe('what a rebuilt prop changes (2026-10-21)', () => {
    it('compares content: a rebuilt callback is the same setting, an element or instance only itself, a cycle closes', () => {
        expect(sameContent(['/a', { route: '/b' }], ['/a', { route: '/b' }])).toBe(true);
        expect(sameContent(['/a'], ['/b'])).toBe(false);
        expect(sameContent({ on: () => 1 }, { on: () => 2 })).toBe(true);
        expect(sameContent({ $$typeof: 1 }, { $$typeof: 1 })).toBe(false);
        expect(sameContent(new Date(0), new Date(0))).toBe(false);
        const a: any = { x: 1 };
        a.self = a;
        const b: any = { x: 1 };
        b.self = b;
        expect(sameContent(a, b)).toBe(true);
    });

    it('takes changed leaves, rebuilt callbacks, and whole the parts the merge reads whole', () => {
        const previous = {
            space: { layout: { type: 'COLUMNS', columns: 2 }, bridge: { preset: 'reading', planeAngle: 60 } },
            elements: { plane: { width: 800 } },
            global: { look: { name: 'x' } },
        };
        expect(configurationChanges(previous, structuredClone(previous))).toBeUndefined();
        expect(configurationChanges(previous, { ...previous, elements: { plane: { width: 900 } } }))
            .toEqual({ elements: { plane: { width: 900 } } });
        // a preset applies under the fields given beside it: the angle goes with it
        expect(configurationChanges(previous, { ...previous, space: { ...previous.space, bridge: { preset: 'objects', planeAngle: 60 } } }))
            .toEqual({ space: { bridge: { preset: 'objects', planeAngle: 60 } } });
        // a key left out stays as it is
        expect(configurationChanges(previous, { space: previous.space })).toBeUndefined();

        const on = () => {};
        const callbacks = configurationChanges(
            { space: { shortcuts: { onUnhandledKey: () => {} } } },
            { space: { shortcuts: { onUnhandledKey: on } } },
        );
        expect(callbacks).toEqual({ space: { shortcuts: { onUnhandledKey: on } } });
        expect(onlyCallbacks(callbacks!)).toBe(true);
        expect(onlyCallbacks({ elements: { plane: { width: 900 } } })).toBe(false);
        expect(onlyCallbacks({ space: { docking: { url: {} } } })).toBe(false);
    });
});
