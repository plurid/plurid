// #region imports
    // #region libraries
    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries

    // #region external
    import {
        arrangementSignature,
    } from '../signature';
    // #endregion external
// #endregion imports



// #region module
const plane = (
    planeID: string,
    extra: Partial<TreePlane> = {},
): TreePlane => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {} as any,
    width: 320,
    height: 200,
    location: { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 },
    show: true,
    ...extra,
});


describe('arrangementSignature and sizes', () => {
    it('a hand-set size is part of the arrangement; a declared or measured size is not', () => {
        const manual = arrangementSignature([plane('a', { sizeMode: 'manual' })], []);
        const manualResized = arrangementSignature([plane('a', { sizeMode: 'manual', width: 640 })], []);
        expect(manual).not.toBe(manualResized);
        expect(manual).toContain('320x200');

        const declared = arrangementSignature([plane('a', { sizeMode: 'declared' })], []);
        const declaredOther = arrangementSignature([plane('a', { sizeMode: 'declared', width: 640, height: 480 })], []);
        expect(declared).toBe(declaredOther);
        expect(declared).not.toContain('320x200');

        const measured = arrangementSignature([plane('a')], []);
        expect(measured).toBe(arrangementSignature([plane('a', { width: 999 })], []));
    });
});
// #endregion module
