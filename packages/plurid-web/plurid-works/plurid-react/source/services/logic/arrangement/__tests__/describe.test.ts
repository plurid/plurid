// #region imports
    // #region libraries
    import {
        TreePlane,
        PlaneLink,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        describeArrangementChange,
    } from '../describe';
    // #endregion external
// #endregion imports



// #region module
const plane = (
    planeID: string,
    extra: Partial<TreePlane> = {},
): TreePlane => ({
    sourceID: planeID,
    planeID,
    route: 'plurid://origin/' + planeID,
    routeDivisions: {} as any,
    width: 400,
    height: 300,
    location: { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 },
    show: true,
    ...extra,
});

const arrangement = (tree: TreePlane[], links: PlaneLink[] = []) => ({ tree, links });
const link = (id: string): PlaneLink => ({ id, sourcePlaneID: 'a', targetPlaneID: 'b' });

describe('what a history entry is called', () => {
    it('names one plane by its path and the change by what it did', () => {
        const shown = arrangement([plane('a'), plane('b')]);
        const hidden = arrangement([plane('a'), plane('b', { show: false })]);
        expect(describeArrangementChange(shown, hidden)).toBe('closed /b');
        expect(describeArrangementChange(hidden, shown)).toBe('opened /b');

        const gone = arrangement([plane('a')]);
        expect(describeArrangementChange(shown, gone)).toBe('removed /b');
        expect(describeArrangementChange(gone, shown)).toBe('added /b');

        const moved = arrangement([plane('a'), plane('b', { manuallyPositioned: true, location: { translateX: 120, translateY: 40, translateZ: 0, rotateX: 0, rotateY: 0 } })]);
        expect(describeArrangementChange(shown, moved)).toBe('moved /b');

        const resized = arrangement([plane('a'), plane('b', { sizeMode: 'manual', width: 600, height: 400 })]);
        expect(describeArrangementChange(shown, resized)).toBe('resized /b');
    });

    it('counts several planes, names a mixed change by what it touched, and reads the links on their own', () => {
        const shown = arrangement([plane('a'), plane('b'), plane('c')]);
        const twoClosed = arrangement([plane('a'), plane('b', { show: false }), plane('c', { show: false })]);
        expect(describeArrangementChange(shown, twoClosed)).toBe('closed 2 planes');

        const mixed = arrangement([plane('a', { manuallyPositioned: true, location: { translateX: 9, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 } }), plane('b', { show: false }), plane('c')]);
        expect(describeArrangementChange(shown, mixed)).toBe('arranged 2 planes (closed)');

        expect(describeArrangementChange(shown, arrangement(shown.tree, [link('l1')]))).toBe('linked two planes');
        expect(describeArrangementChange(arrangement(shown.tree, [link('l1')]), shown)).toBe('unlinked two planes');
        expect(describeArrangementChange(shown, arrangement(shown.tree, [link('l1'), link('l2')]))).toBe('added 2 links');
    });

    it('an arrangement that changed nothing it names is just a change', () => {
        const shown = arrangement([plane('a')]);
        // a relayout moves an UNPINNED plane: not an authored change, so it has no name
        const relaid = arrangement([plane('a', { location: { translateX: 700, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 } })]);
        expect(describeArrangementChange(shown, relaid)).toBe('a change');
    });
});
// #endregion module
