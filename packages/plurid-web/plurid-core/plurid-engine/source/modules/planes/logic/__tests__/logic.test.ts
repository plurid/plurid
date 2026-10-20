// #region imports
    // #region external
    import {
        getPluridPlaneIDByData,
    } from '../index';
    import {
        extractOccurence,
    } from '../../../routing/Parser/logic';
    // #endregion external
// #endregion imports



// #region module
describe('the small readers', () => {
    it('reads an empty occurrence as the first, not NaN (2026-10-20)', () => {
        // `[]` matched `\\[(\\d*)\\]` with an empty number, and parseInt('') is NaN
        expect(extractOccurence('[]')).toBe(0);
        expect(extractOccurence('[3]')).toBe(3);
        expect(extractOccurence(undefined)).toBe(0);
    });

    it('finds the plane of an element that is the plane itself (2026-10-20)', () => {
        // The search started at the element's parent: the plane element's own id was skipped.
        const plane = document.createElement('div');
        plane.dataset.pluridPlane = 'p1';
        const inner = document.createElement('span');
        plane.appendChild(inner);
        document.body.appendChild(plane);
        expect(getPluridPlaneIDByData(plane)).toBe('p1');
        expect(getPluridPlaneIDByData(inner)).toBe('p1');
        expect(getPluridPlaneIDByData(document.body)).toBe('');
        plane.remove();
    });
});
// #endregion module
