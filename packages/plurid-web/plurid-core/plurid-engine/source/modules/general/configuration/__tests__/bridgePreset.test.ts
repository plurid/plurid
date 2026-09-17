// #region imports
    // #region external
    import {
        merge,
        definePluridConfiguration,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE BRIDGE PRESET names a set of the bridge fields and applies UNDER any given explicitly.
 * The defaults are the `reading` preset; `objects` is the geometry every release before 2026-09
 * had.
 */
describe('the bridge preset', () => {
    it('defaults to reading: 90.1, alternating, from the edge', () => {
        const configuration = merge();
        expect(configuration.space.bridge).toEqual({
            length: 100,
            planeAngle: 90.1,
            fan: 'alternate',
            direction: 'backward',
            keepBehind: false,
            anchor: 'edge',
            preset: 'reading',
        });
    });

    it('objects is the old geometry whole: 90, fixed, from the link', () => {
        const configuration = merge({ space: { bridge: { preset: 'objects' } } });
        expect(configuration.space.bridge).toMatchObject({ planeAngle: 90, fan: 'fixed', anchor: 'link', keepBehind: false, preset: 'objects', length: 100 });
    });

    it('an explicit field wins over the preset it names', () => {
        const configuration = merge({ space: { bridge: { preset: 'objects', planeAngle: 60, length: 160 } } });
        expect(configuration.space.bridge).toMatchObject({ planeAngle: 60, length: 160, fan: 'fixed', anchor: 'link' });
    });

    it('a preset named on the target holds through a partial that names none', () => {
        const target = merge({ space: { bridge: { preset: 'objects' } } });
        const configuration = merge({ space: { center: true } }, target);
        expect(configuration.space.bridge!.planeAngle).toBe(90);
        expect(configuration.space.bridge!.preset).toBe('objects');
    });

    it('reaches the flat shorthand', () => {
        const configuration = definePluridConfiguration({ bridge: { preset: 'objects' } } as any);
        expect(configuration.space.bridge!.fan).toBe('fixed');
    });
});
// #endregion module
