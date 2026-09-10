import {
    TreePlane,
    PlaneLink,
    defaultTreePlane,
} from '@plurid/plurid-data';

import {
    diffArrangement,
    applyArrangementDiff,
    rebaseSnapshot,
} from '../rebase';



const plane = (planeID: string, extra: Partial<TreePlane> = {}): TreePlane => ({
    ...defaultTreePlane,
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    show: true,
    width: 100,
    height: 80,
    ...extra,
});
const link = (id: string, source: string, target: string): PlaneLink => ({ id, sourcePlaneID: source, targetPlaneID: target });

describe('rebased undo: the arrangement diff', () => {
    it('names the planes whose authored entry differs, the vanished ones, the links added and removed', () => {
        const from = { tree: [plane('a'), plane('b'), plane('c')], links: [link('l1', 'a', 'b')] };
        const to = { tree: [plane('a', { show: false }), plane('b', { manuallyPositioned: true, location: { ...defaultTreePlane.location, translateX: 300 } })], links: [link('l2', 'a', 'b')] };
        const diff = diffArrangement(from, to);
        expect(diff.empty).toBe(false);
        expect([...diff.planes.keys()].sort()).toEqual(['a', 'b', 'c']);
        expect(diff.planes.get('a')).toMatchObject({ show: false });
        expect(diff.planes.get('b')).toMatchObject({ location: { x: 300, y: 0, z: 0 } });
        expect(diff.planes.get('c')).toBeNull();
        expect(diff.links.added.map((entry) => entry.id)).toEqual(['l2']);
        expect(diff.links.removed).toEqual(['l1:a>b:']);
        // a relayout (auto positions) is not a change
        const moved = { tree: [plane('a', { location: { ...defaultTreePlane.location, translateX: 999 } }), plane('b'), plane('c')], links: [link('l1', 'a', 'b')] };
        expect(diffArrangement(from, moved).empty).toBe(true);
    });

    it('applies the local diff over the peer\'s arrangement: the touched planes follow the diff, the rest is the peer\'s, a removed plane stays removed', () => {
        const before = { tree: [plane('a'), plane('b'), plane('c')], links: [] as PlaneLink[] };
        const snapshot = { tree: [plane('a', { show: false }), plane('b'), plane('c')], links: [] as PlaneLink[] };
        // the peer moved b, removed c, added d
        const remote = { tree: [plane('a'), plane('b', { manuallyPositioned: true, location: { ...defaultTreePlane.location, translateX: 500 } }), plane('d')], links: [link('l9', 'a', 'd')] };
        const rebased = rebaseSnapshot(snapshot, before, remote)!;
        expect(rebased).not.toBeNull();
        expect(rebased.tree.map((node) => node.planeID)).toEqual(['a', 'b', 'd']);
        expect(rebased.tree[0].show).toBe(false);
        expect(rebased.tree[1].location.translateX).toBe(500);
        expect(rebased.links).toBe(remote.links);
        // a snapshot with nothing local left is dropped
        expect(rebaseSnapshot(before, before, remote)).toBeNull();
        // a diff on a plane the peer removed is left out: nothing to apply, the peer's arrangement stands
        const onlyC = { tree: [plane('a'), plane('b'), plane('c', { show: false })], links: [] as PlaneLink[] };
        expect(rebaseSnapshot(onlyC, before, remote)).toBeNull();
    });

    it('links: a local link removed is removed from the peer\'s; a local link added is added when its planes exist; the base is kept by reference on a no-op', () => {
        const base = { tree: [plane('a'), plane('b')], links: [link('l1', 'a', 'b'), link('l2', 'b', 'a')] };
        const removed = applyArrangementDiff(base, { planes: new Map(), links: { added: [], removed: ['l1:a>b:'] }, empty: false });
        expect(removed.links.map((entry) => entry.id)).toEqual(['l2']);
        expect(removed.tree).toBe(base.tree);
        const added = applyArrangementDiff(base, { planes: new Map(), links: { added: [link('l3', 'a', 'b'), link('l4', 'a', 'zzz')], removed: [] }, empty: false });
        expect(added.links.map((entry) => entry.id)).toEqual(['l1', 'l2', 'l3']);
        expect(applyArrangementDiff(base, { planes: new Map(), links: { added: [], removed: [] }, empty: true })).toBe(base);
    });

    it('a local drag rebased over the peer\'s drag of the same plane: the local intent wins on that plane', () => {
        const before = { tree: [plane('a')], links: [] as PlaneLink[] };
        const snapshot = { tree: [plane('a', { manuallyPositioned: true, location: { ...defaultTreePlane.location, translateX: 100 } })], links: [] as PlaneLink[] };
        const remote = { tree: [plane('a', { manuallyPositioned: true, location: { ...defaultTreePlane.location, translateX: 700 } })], links: [] as PlaneLink[] };
        const rebased = rebaseSnapshot(snapshot, before, remote)!;
        expect(rebased.tree[0].location.translateX).toBe(100);
        expect(rebased.tree[0].manuallyPositioned).toBe(true);
    });
});
