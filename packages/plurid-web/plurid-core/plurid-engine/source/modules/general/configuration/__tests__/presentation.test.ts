// #region imports
    // #region external
    import {
        definePluridConfiguration,
        merge,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
describe('the page presentation defaults', () => {
    it('presentation: page layers no fade-in, no gradient and view-sized planes under the caller', () => {
        const page = definePluridConfiguration({ presentation: 'page' });
        expect(page.space.presentation).toBe('page');
        expect(page.space.fadeInTime).toBe(0);
        expect(page.space.opaque).toBe(false);
        expect(page.elements.plane.height).toBe(1);
        expect(page.elements.plane.width).toBe(1);
        const tuned = definePluridConfiguration({ presentation: 'page', fadeInTime: 300, opaque: true, planeHeight: 0.5 });
        expect(tuned.space.fadeInTime).toBe(300);
        expect(tuned.space.opaque).toBe(true);
        expect(tuned.elements.plane.height).toBe(0.5);
    });

    it('the space presentation keeps every default', () => {
        const space = definePluridConfiguration({});
        expect(space.space.presentation).toBe('space');
        expect(space.space.fadeInTime).toBe(1500);
        expect(space.space.opaque).toBe(true);
        expect(space.elements.plane.height).toBeUndefined();
        const nested = merge({ space: { presentation: 'page' } });
        expect(nested.space.fadeInTime).toBe(0);
    });
});
// #endregion module
