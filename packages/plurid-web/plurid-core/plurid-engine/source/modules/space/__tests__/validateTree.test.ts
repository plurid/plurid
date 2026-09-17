// #region imports
    // #region external
    import {
        validateTree,
    } from '../tree/fields';
    // #endregion external
// #endregion imports



// #region module
/** a tree the bus can be trusted with: what `view.setTree` refuses, and why */
const node = (planeID: string, extra: Record<string, unknown> = {}) => ({
    planeID,
    sourceID: planeID,
    route: '/' + planeID,
    routeDivisions: {},
    width: 100,
    height: 80,
    show: true,
    location: { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 },
    ...extra,
});

describe('validateTree', () => {
    it('accepts a well-formed tree, children included', () => {
        expect(validateTree([node('a', { children: [node('b')] })])).toEqual({ ok: true });
        expect(validateTree([])).toEqual({ ok: true });
    });

    it('names the first bad node and what is wrong with it', () => {
        expect(validateTree('nope').ok).toBe(false);
        expect(validateTree([null]).reason).toBe('tree[0] is not a plane');
        expect(validateTree([node('')]).reason).toBe('tree[0] has no planeID');
        expect(validateTree([node('a', { route: '' })]).reason).toContain('has no route');
        expect(validateTree([node('a', { location: { translateX: NaN, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 } })]).reason).toContain('location.translateX');
        expect(validateTree([node('a', { width: 'wide' })]).reason).toContain('width');
        expect(validateTree([node('a', { children: {} })]).reason).toContain('children is not an array');
        expect(validateTree([node('a', { children: [node('b', { location: undefined })] })]).reason).toBe('tree[0].children[0] (b) has no location');
    });
});
// #endregion module
