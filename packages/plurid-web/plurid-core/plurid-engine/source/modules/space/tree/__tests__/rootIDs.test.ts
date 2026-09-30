// #region imports
    // #region libraries
    import {
        TreePlane,
        defaultConfiguration,
        defaultTreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        Registrar,
    } from '../../../planes/registrar';
    import Tree from '../object';
    import {
        carryRootPlaneIDs,
        collectPlaneIDs,
        pairRootsByIdentity,
        rootIdentity,
        uniqueRootPlaneIDs,
        validateTree,
    } from '../fields';
    // #endregion external
// #endregion imports



// #region module
/**
 * NO TWO ROOTS ARE ONE PLANE (audit 2026-09-29 #5). A root's id is positional (`route@index`, the
 * index restarting with every compute), and the relayout carried the previous id onto each paired
 * root and the fresh one onto the rest — so an add, a remove and an add gave two roots one id:
 * React keys collided, and close / select / dock reached only the first.
 */
const component = () => null;
const view = { width: 1440, height: 840 };
const planes = new Registrar<any>([
    { route: '/a', component },
    { route: '/b', component },
], 'host').getAll();

/**
 * A relayout as plurid-react's `useTreeUpdate` carries it today (2026-09-29): the previous id onto
 * each paired root, the computed one onto the rest, the extras of a listed identity kept.
 */
const relayout = (
    tree: TreePlane[],
    viewItems: string[],
): TreePlane[] => {
    const computed = new Tree<any>({
        planes,
        view: viewItems,
        configuration: defaultConfiguration,
        layout: true,
        viewSize: view,
        previousTree: tree,
    }, 'host').compute();
    const pairing = pairRootsByIdentity(tree);
    const listed = new Set<string>();
    const next = computed.map((root) => {
        listed.add(rootIdentity(root));
        const previous = pairing.take(root);
        return previous
            ? { ...root, planeID: previous.planeID, show: previous.show, children: previous.children }
            : root;
    });
    for (const [key, extras] of pairing.remaining) {
        if (listed.has(key)) {
            next.push(...extras);
        }
    }
    return next;
};

const ids = (
    tree: TreePlane[],
) => tree.map((root) => root.planeID.replace(/^.*\//, ''));

const node = (
    planeID: string,
    route = '/' + planeID,
    children?: TreePlane[],
): TreePlane => ({
    ...defaultTreePlane,
    sourceID: route,
    planeID,
    route,
    show: true,
    children,
});


describe('root plane ids', () => {
    it('add, remove, add: every root keeps its id and no two share one', () => {
        let tree = relayout([], ['/a', '/b']);
        expect(ids(tree)).toEqual(['a@0', 'b@1']);
        tree = relayout(tree, ['/a', '/b', '/a']);
        expect(ids(tree)).toEqual(['a@0', 'b@1', 'a@2']);
        tree = relayout(tree, ['/a', '/a']);
        expect(ids(tree)).toEqual(['a@0', 'a@2']);
        tree = relayout(tree, ['/a', '/a', '/a']);
        // the third /a would have been a@2 again: it takes the next id no plane holds
        expect(ids(tree)).toEqual(['a@0', 'a@2', 'a@2-2']);
        expect(validateTree(tree)).toEqual({ ok: true });
    });

    it('the engine carries a paired root\'s id and never hands out one the previous tree holds', () => {
        const previous = [node('a@7', '/a', [node('a@1')]), node('b@3', '/b')];
        const fresh = [node('a@0', '/a'), node('a@1', '/a'), node('b@2', '/b')];
        const carried = carryRootPlaneIDs(fresh, previous);
        // /a pairs with a@7, /b with b@3; the second /a is new, and a@1 is a child's id
        expect(carried.map((root) => root.planeID)).toEqual(['a@7', 'a@1-2', 'b@3']);
        // nothing to carry: the same array
        expect(carryRootPlaneIDs(fresh, undefined)).toBe(fresh);
        expect(carryRootPlaneIDs(fresh, [])).toBe(fresh);
    });

    it('a previous tree that already held one id twice is not repeated', () => {
        const previous = [node('a@2', '/a'), node('a@2', '/a')];
        const carried = carryRootPlaneIDs([node('a@0', '/a'), node('a@1', '/a')], previous);
        expect(carried.map((root) => root.planeID)).toEqual(['a@2', 'a@1']);
        expect(uniqueRootPlaneIDs(previous).map((root) => root.planeID)).toEqual(['a@2', 'a@2-2']);
    });

    it('uniqueRootPlaneIDs keeps the first holder, avoids every child id and the ids in use', () => {
        const roots = [node('x', '/x', [node('y')]), node('y'), node('x'), node('z')];
        const unique = uniqueRootPlaneIDs(roots, ['z']);
        expect(unique.map((root) => root.planeID)).toEqual(['x', 'y-2', 'x-2', 'z-2']);
        expect(unique[0]).toBe(roots[0]);
        expect(collectPlaneIDs(unique).size).toBe(5);
        const clean = [node('p'), node('q')];
        expect(uniqueRootPlaneIDs(clean)).toBe(clean);
    });

    it('a renamed root takes its children with it', () => {
        const child = { ...node('d@1', '/d'), parentPlaneID: 'r' };
        const other = { ...node('d@2', '/d'), parentPlaneID: 'elsewhere' };
        const [, renamed] = uniqueRootPlaneIDs([node('r', '/r'), node('r', '/r', [child, other])]);
        expect(renamed.planeID).toBe('r-2');
        expect(renamed.children!.map((entry) => entry.parentPlaneID)).toEqual(['r-2', 'elsewhere']);
        expect(validateTree([node('r', '/r'), renamed])).toEqual({ ok: true });
    });

    it('validateTree refuses two planes of one id, children included', () => {
        expect(validateTree([node('a'), node('a')]).reason).toBe('tree[1] (a) has the planeID of another plane');
        expect(validateTree([node('a', '/a', [node('a')])]).reason).toBe('tree[0].children[0] (a) has the planeID of another plane');
        expect(validateTree([node('a', '/a', [node('b')]), node('c')])).toEqual({ ok: true });
    });
});
// #endregion module
