// #region imports
    // #region external
    import {
        Registrar,
    } from '../../../planes/registrar';
    import compute from '..';
    // #endregion external
// #endregion imports



// #region module
const component = () => null;
const registrar = () => new Registrar<any>([{ route: '/a', component }]);

describe('only the parts of the configuration that changed (2026-10-21)', () => {
    it('override the current state, and the rest of the configuration leaves it as it is', () => {
        const configuration = { space: { layout: { type: 'COLUMNS', columns: 2 } }, elements: { plane: { width: 800 } } } as any;
        const booted = compute(['/a'], configuration, registrar(), undefined, undefined, undefined, undefined);
        const current = {
            ...booted,
            configuration: { ...booted.configuration, space: { ...booted.configuration.space, layout: { type: 'COLUMNS', columns: 3 } } },
        } as any;
        const next = { ...configuration, elements: { plane: { width: 900 } } };
        const changed = compute(['/a'], next, registrar(), current, undefined, undefined, undefined, 'origin', {
            configurationChanges: { elements: { plane: { width: 900 } } } as any,
        });
        expect(changed.configuration.space.layout).toMatchObject({ columns: 3 });
        expect(changed.configuration.elements.plane.width).toBe(900);
        // `configurationAuthoritative` still lays the whole of it
        const whole = compute(['/a'], next, registrar(), current, undefined, undefined, undefined, 'origin', {
            configurationAuthoritative: true,
        });
        expect(whole.configuration.space.layout).toMatchObject({ columns: 2 });
    });

    it('a presentation switch lays the whole configuration: the host\'s unchanged values are kept over the new defaults (2026-10-22)', () => {
        // The switch changes the defaults under the page fields, and a field the host left unchanged was
        // not among the changes: `docking.url: true`, unchanged, was dropped with the page defaults.
        const page = { space: { presentation: 'page', docking: { url: true } } } as any;
        const space = { space: { presentation: 'space', docking: { url: true } } } as any;
        const booted = compute(['/a'], page, registrar(), undefined, undefined, undefined, undefined);
        const switched = compute(['/a'], space, registrar(), booted as any, undefined, undefined, undefined, 'origin', {
            configurationChanges: { space: { presentation: 'space' } } as any,
        });
        expect(switched.configuration.space.presentation).toBe('space');
        expect(switched.configuration.space.docking?.url).toBe(true);
        const back = compute(['/a'], { space: { presentation: 'page', opaque: true } } as any, registrar(), switched as any, undefined, undefined, undefined, 'origin', {
            configurationChanges: { space: { presentation: 'page', opaque: true } } as any,
        });
        expect(back.configuration.space.opaque).toBe(true);
    });
});
// #endregion module
