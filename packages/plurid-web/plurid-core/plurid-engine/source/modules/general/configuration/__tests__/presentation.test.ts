// #region imports
    import {
        defaultConfiguration,
    } from '@plurid/plurid-data';
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
        // the fourth page default: the address bar is the page
        expect(page.space.docking?.url).toBe(true);
        const tuned = definePluridConfiguration({ presentation: 'page', fadeInTime: 300, opaque: true, planeHeight: 0.5 });
        expect(tuned.space.fadeInTime).toBe(300);
        expect(tuned.space.opaque).toBe(true);
        expect(tuned.elements.plane.height).toBe(0.5);
        // an explicit opt-out is honoured; a partial docking keeps the default
        expect(definePluridConfiguration({ presentation: 'page', docking: { url: false } }).space.docking?.url).toBe(false);
        expect(definePluridConfiguration({ presentation: 'page', docking: { motion: 'instant' } }).space.docking?.url).toBe(true);
        expect(definePluridConfiguration({}).space.docking?.url).toBeUndefined();
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

    it('a runtime switch to the page presentation (a full target at the space defaults) gets the page defaults; explicit values still win', () => {
        const live = merge(undefined, undefined);
        expect(live.space.fadeInTime).toBe(defaultConfiguration.space.fadeInTime);
        const switched = merge({ space: { presentation: 'page' } }, live);
        expect(switched.space.presentation).toBe('page');
        expect(switched.space.fadeInTime).toBe(0);
        expect(switched.space.opaque).toBe(false);
        expect(switched.elements.plane.height).toBe(1);
        const explicit = merge({ space: { presentation: 'page', fadeInTime: 300 } }, live);
        expect(explicit.space.fadeInTime).toBe(300);
        expect(explicit.space.opaque).toBe(false);
    });

});
// #endregion module
