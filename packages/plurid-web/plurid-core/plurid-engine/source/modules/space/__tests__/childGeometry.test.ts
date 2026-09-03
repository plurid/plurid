// #region imports
    // #region libraries
    import {
        TreePlane,
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        childLocation,
        resolvePlaneAngle,
        recomputeSubtree,
        planeDepth,
    } from '../location/child';

    import {
        updateTreeWithNewPlane,
        updateLinkCoordinates,
        reconcileTree,
    } from '../tree/logic';

    import {
        findPlaneByLinkID,
        pruneLinks,
        collectPlaneIDs,
    } from '../tree/fields';
    // #endregion external
// #endregion imports



// #region module
const plane = (
    planeID: string,
    location: Partial<TreePlane['location']> = {},
    extra: Partial<TreePlane> = {},
): TreePlane => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {} as any,
    width: 400,
    height: 300,
    location: {
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
        ...location,
    },
    show: true,
    ...extra,
});


describe('childLocation()', () => {
    it('places the child at the end of a bridge from the link point, turned by the plane angle', () => {
        const parent = { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 };
        const child = childLocation(parent, { x: 300, y: 120 }, 100, 90);
        // link point (300, 120, 0); the bridge runs at 90° → -Z
        expect(child.translateX).toBeCloseTo(300, 9);
        expect(child.translateY).toBeCloseTo(120, 9);
        expect(child.translateZ).toBeCloseTo(-100, 9);
        expect(child.rotateY).toBe(90);
        expect(child.rotateX).toBe(0);
    });

    it('rotates the link point and the bridge with the parent', () => {
        const parent = { translateX: 10, translateY: 20, translateZ: 30, rotateX: 0, rotateY: 90 };
        const child = childLocation(parent, { x: 100, y: 0 }, 50, -90);
        // parent faces -Z: its local x runs along -Z → link point (10, 20, 30 - 100)
        // bridge angle 0° → +X
        expect(child.translateX).toBeCloseTo(60, 9);
        expect(child.translateZ).toBeCloseTo(-70, 9);
        expect(child.rotateY).toBe(0);
    });

    it('the bridge drawn along the child\'s local -X meets the link point', () => {
        const parent = { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 37 };
        const coords = { x: 220, y: 40 };
        const child = childLocation(parent, coords, 160, 90);
        const rad = child.rotateY * Math.PI / 180;
        const bridgeEndX = child.translateX - 160 * Math.cos(rad);
        const bridgeEndZ = child.translateZ + 160 * Math.sin(rad);
        const parentRad = parent.rotateY * Math.PI / 180;
        expect(bridgeEndX).toBeCloseTo(parent.translateX + coords.x * Math.cos(parentRad), 9);
        expect(bridgeEndZ).toBeCloseTo(parent.translateZ - coords.x * Math.sin(parentRad), 9);
    });
});


describe('resolvePlaneAngle()', () => {
    it('alternates the sign by generation, fixed keeps it', () => {
        expect(resolvePlaneAngle(1, 0, 90, 'alternate')).toBe(90);
        expect(resolvePlaneAngle(2, 0, 90, 'alternate')).toBe(-90);
        expect(resolvePlaneAngle(3, 0, 60, 'alternate')).toBe(60);
        expect(resolvePlaneAngle(2, 0, 60, 'fixed')).toBe(60);
    });
});


describe('recomputeSubtree()', () => {
    it('moves grandchildren with the root and keeps coordinate-less children', () => {
        const grandchild = plane('c', { translateX: 999 }, { linkCoordinates: { x: 50, y: 10 }, bridgeLength: 100, planeAngle: -90 });
        const child = plane('b', { translateX: 999 }, { linkCoordinates: { x: 200, y: 0 }, bridgeLength: 100, planeAngle: 90, children: [grandchild] });
        const authored = plane('d', { translateX: 5 });
        const root = plane('a', { translateX: 1000 }, { children: [child, authored] });

        const updated = recomputeSubtree(root);
        expect(updated).not.toBe(root);
        const b = updated.children![0];
        expect(b.location.translateX).toBeCloseTo(1200, 9);
        expect(b.location.translateZ).toBeCloseTo(-100, 9);
        expect(b.location.rotateY).toBe(90);
        const c = b.children![0];
        // grandchild turns back to the root's facing
        expect(c.location.rotateY).toBe(0);
        expect(updated.children![1]).toBe(authored);
    });

    it('returns the same reference when nothing moves', () => {
        const child = plane('b', childLocation({ translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 }, { x: 200, y: 0 }, 100, 90), { linkCoordinates: { x: 200, y: 0 }, bridgeLength: 100, planeAngle: 90 });
        const root = plane('a', {}, { children: [child] });
        expect(recomputeSubtree(root)).toBe(root);
    });
});


describe('updateTreeWithNewPlane() / updateLinkCoordinates()', () => {
    const registry = new Map<string, any>([
        ['/detail', { route: { absolute: '/detail', value: '/detail', fragments: { elements: [], texts: [] }, parameters: {}, query: {} }, component: () => null }],
    ]);
    const configuration = {
        ...defaultConfiguration,
        space: { ...defaultConfiguration.space, bridge: { length: 120, planeAngle: 90, fan: 'alternate' as const } },
    };

    it('spawns with the fanned angle, the stored geometry and the link id', () => {
        const root = plane('a', { translateX: 100 });
        const { updatedTree, updatedTreePlane } = updateTreeWithNewPlane('/detail', 'a', { x: 300, y: 40 }, [root], registry, configuration, 'origin', { linkID: 'a#/detail#0' });
        expect(updatedTreePlane).toBeDefined();
        expect(updatedTreePlane!.spawnedByLinkID).toBe('a#/detail#0');
        expect(updatedTreePlane!.planeAngle).toBe(90);
        expect(updatedTreePlane!.bridgeLength).toBe(120);
        expect(updatedTreePlane!.location.rotateY).toBe(90);
        expect(updatedTreePlane!.location.translateX).toBeCloseTo(400, 9);
        expect(updatedTreePlane!.location.translateZ).toBeCloseTo(-120, 9);
        expect(findPlaneByLinkID(updatedTree, 'a', 'a#/detail#0')).toBe(updatedTree[0].children![0]);

        // a grandchild fans back
        const childID = updatedTreePlane!.planeID;
        const second = updateTreeWithNewPlane('/detail', childID, { x: 10, y: 10 }, updatedTree, registry, configuration, 'origin', { linkID: childID + '#/detail#0' });
        expect(second.updatedTreePlane!.planeAngle).toBe(-90);
        expect(second.updatedTreePlane!.location.rotateY).toBe(0);
        expect(planeDepth(second.updatedTree, second.updatedTreePlane!.planeID)).toBe(2);
    });

    it('updateLinkCoordinates() is equality-gated and re-places the subtree from the live parent', () => {
        const root = plane('a');
        const spawned = updateTreeWithNewPlane('/detail', 'a', { x: 300, y: 40 }, [root], registry, configuration, 'origin', { linkID: 'l' });
        const tree = spawned.updatedTree;
        const childID = spawned.updatedTreePlane!.planeID;

        expect(updateLinkCoordinates(tree, childID, { x: 300, y: 40 })).toBe(tree);

        const moved = updateLinkCoordinates(tree, childID, { x: 100, y: 40 });
        expect(moved).not.toBe(tree);
        expect(moved[0].children![0].location.translateX).toBeCloseTo(100, 9);
        expect(moved[0].children![0].linkCoordinates).toEqual({ x: 100, y: 40 });
    });
});


describe('reconcileTree() positional fallback', () => {
    it('never pairs a new plane with an unrelated pinned node at the same index', () => {
        const pinned = plane('a', { translateX: 777 }, { manuallyPositioned: true });
        const previous = [pinned];
        const next = [plane('b', { translateX: 0 })];
        const reconciled = reconcileTree(previous, next);
        expect(reconciled[0].location.translateX).toBe(0);
        expect(reconciled[0].manuallyPositioned).toBeUndefined();
    });
});


describe('pruneLinks()', () => {
    it('drops links whose planes are gone and keeps the reference otherwise', () => {
        const tree = [plane('a', {}, { children: [plane('b')] })];
        const ids = collectPlaneIDs(tree);
        const links = [
            { id: 'ab', sourcePlaneID: 'a', targetPlaneID: 'b' },
            { id: 'ax', sourcePlaneID: 'a', targetPlaneID: 'x' },
        ];
        const pruned = pruneLinks(links, ids);
        expect(pruned).toEqual([links[0]]);
        expect(pruneLinks([links[0]], ids)).toEqual([links[0]]);
        const kept = [links[0]];
        expect(pruneLinks(kept, ids)).toBe(kept);
    });
});
// #endregion module
