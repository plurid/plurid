// #region imports
    import {
        defaultConfiguration,
        TreePlane,
    } from '@plurid/plurid-data';

    import {
        Registrar,
    } from '../../../planes/registrar';
    import {
        computeSpaceTree,
    } from '../logic';
    // #endregion imports



// #region module
/**
 * THE LAYOUT PLACES WHAT IS SHOWN.
 *
 * Closing a plane hides it and leaves it in the tree, which is what lets it be
 * reopened where it was left. But the layout was handed every view item and
 * placed all of them - not one of the five layout modules mentions `show` - and
 * the truth was stamped back only afterwards by the host's reconcile. So a
 * put-away plane took a slot in the row and the planes a reader could actually
 * see were spread around a hole, which is what a host reported as a space full
 * of gaps and a newly opened plane landing off in a corner.
 */
const component = () => null;

const planes = () => new Registrar<any>([
    { route: '/a', component },
    { route: '/b', component },
    { route: '/c', component },
]).getAll();

const build = (
    view: string[],
    previousTree?: TreePlane[],
) => {
    let count = 0;
    return computeSpaceTree(
        planes(),
        view,
        defaultConfiguration,
        true,
        'origin',
        () => { count += 1; return count; },
        { width: 1440, height: 840 },
        previousTree,
    );
};

const xOf = (tree: TreePlane[], route: string) => tree
    .find((plane) => plane.route.endsWith(route))!
    .location.translateX;

const yOf = (tree: TreePlane[], route: string) => tree
    .find((plane) => plane.route.endsWith(route))!
    .location.translateY;


describe('a root that is not shown is not in the layout', () => {
    /**
     * The hidden one FIRST, deliberately. The default layout is a grid, so a
     * hidden plane in the middle of three can fall into a row of its own and
     * leave the other two where they would have been anyway - the fault is
     * real but invisible in that arrangement. A hidden plane at the head
     * pushes every visible one along by a slot, which is the shape a reader
     * actually hits: the library opened first, then put away.
     */
    it('places the shown roots as if the hidden one were not there', () => {
        const everything = build(['/b', '/c']);

        const withHidden = build(['/a', '/b', '/c'], [
            { ...build(['/a'])[0], show: false },
        ] as TreePlane[]);

        expect(xOf(withHidden, '/b')).toBe(xOf(everything, '/b'));
        expect(yOf(withHidden, '/b')).toBe(yOf(everything, '/b'));
        expect(xOf(withHidden, '/c')).toBe(xOf(everything, '/c'));
        expect(yOf(withHidden, '/c')).toBe(yOf(everything, '/c'));
    });

    it('leaves the hidden root where it already was, so it comes back there', () => {
        const parked = {
            ...build(['/b'])[0],
            show: false,
            location: {
                rotateX: 0,
                rotateY: 0,
                translateX: 7777,
                translateY: 8888,
                translateZ: 0,
            },
        } as TreePlane;

        const tree = build(['/a', '/b', '/c'], [parked]);
        const hidden = tree.find((plane) => plane.route.endsWith('/b'))!;

        expect(hidden.location.translateX).toBe(7777);
        expect(hidden.location.translateY).toBe(8888);
    });

    /**
     * And it is still hidden on the way out. The fresh plane the view resolves
     * to knows nothing about having been put away - that used to be stamped
     * back on afterwards, by the host, long after the layout had already given
     * it a slot.
     */
    it('keeps the hidden root hidden, and in the order the view asked for', () => {
        const tree = build(['/a', '/b', '/c'], [
            { ...build(['/b'])[0], show: false },
        ] as TreePlane[]);

        expect(tree.map((plane) => plane.route.slice(-2))).toEqual(['/a', '/b', '/c']);
        expect(tree[1].show).toBe(false);
    });

    /** and it does not touch a space where nothing is put away */
    it('lays out normally when nothing is hidden', () => {
        const tree = build(['/a', '/b', '/c'], build(['/a', '/b', '/c']));

        expect(tree.length).toBe(3);
        expect(new Set(tree.map((plane) => plane.location.translateX)).size).toBeGreaterThan(1);
    });
});


// #endregion module
