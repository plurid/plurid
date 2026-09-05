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
        resolveBridgeSide,
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


describe('resolveBridgeSide()', () => {
    it('mirrors the generation that would otherwise land in front of its parent', () => {
        // backward: a positive angle already goes behind, a negative one must be mirrored
        expect(resolveBridgeSide(90)).toBe('start');
        expect(resolveBridgeSide(-90)).toBe('end');
        expect(resolveBridgeSide(60, 'backward')).toBe('start');
        // forward: the exact opposite
        expect(resolveBridgeSide(-90, 'forward')).toBe('start');
        expect(resolveBridgeSide(90, 'forward')).toBe('end');
    });
});

describe('childLocation() mirrored', () => {
    it('a right-edge bridge puts the child behind the fin, facing the way its grandparent does (the harness numbers)', () => {
        const fin = { translateX: 112, translateY: 361, translateZ: -160, rotateX: 0, rotateY: 90 };
        const mesh = childLocation(fin, { x: 61, y: 317 }, 160, -90, 'end', 320);
        expect(mesh.rotateY).toBe(0);
        expect(mesh.translateZ).toBeCloseTo(-221, 9);
        expect(mesh.translateY).toBeCloseTo(678, 9);
        // its RIGHT edge is one bridge from the link, on the fin's back side (x < 112)
        expect(mesh.translateX).toBeCloseTo(112 - 160 - 320, 9);
        // the ordinary side would have hung it in front of the fin's face
        expect(childLocation(fin, { x: 61, y: 317 }, 160, -90).translateX).toBeCloseTo(272, 9);
        // an unmeasured child is placed with the fallback width
        expect(childLocation(fin, { x: 61, y: 317 }, 160, -90, 'end', 0).translateX).toBeCloseTo(112 - 160 - 400, 9);
    });
});

describe('resolvePlaneAngle()', () => {
    it('starts behind the parent (positive), alternates the sign by generation, fixed keeps it', () => {
        expect(resolvePlaneAngle(1, 0, 90, 'alternate')).toBe(90);
        expect(resolvePlaneAngle(2, 0, 90, 'alternate')).toBe(-90);
        expect(resolvePlaneAngle(3, 0, 60, 'alternate')).toBe(60);
        expect(resolvePlaneAngle(2, 0, 60, 'fixed')).toBe(60);
    });

    it('forward grows toward the viewer (the negative angle first)', () => {
        expect(resolvePlaneAngle(1, 0, 90, 'alternate', 'forward')).toBe(-90);
        expect(resolvePlaneAngle(2, 0, 90, 'alternate', 'forward')).toBe(90);
        expect(resolvePlaneAngle(3, 0, 60, 'alternate', 'forward')).toBe(-60);
        expect(resolvePlaneAngle(2, 0, 60, 'fixed', 'forward')).toBe(-60);
    });
});


describe('recomputeSubtree()', () => {
    it('moves grandchildren with the root and keeps coordinate-less children', () => {
        const grandchild = plane('c', { translateX: 999 }, { linkCoordinates: { x: 50, y: 10 }, bridgeLength: 100, planeAngle: -90, bridgeSide: 'end' });
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
        // grandchild turns back to the root's facing, mirrored behind the fin by its own width (400)
        expect(c.location.rotateY).toBe(0);
        expect(c.location.translateX).toBeCloseTo(1200 - 100 - 400, 9);
        expect(c.location.translateZ).toBeCloseTo(-150, 9);
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
        // BEHIND the root's wall (deeper into the space)
        expect(updatedTreePlane!.location.translateZ).toBeCloseTo(-120, 9);
        expect(findPlaneByLinkID(updatedTree, 'a', 'a#/detail#0')).toBe(updatedTree[0].children![0]);

        // a grandchild fans back — mirrored to the fin's back side, placed by the fallback width
        const childID = updatedTreePlane!.planeID;
        const second = updateTreeWithNewPlane('/detail', childID, { x: 10, y: 10 }, updatedTree, registry, configuration, 'origin', { linkID: childID + '#/detail#0', fallbackWidth: 300 });
        expect(second.updatedTreePlane!.planeAngle).toBe(-90);
        expect(second.updatedTreePlane!.bridgeSide).toBe('end');
        expect(second.updatedTreePlane!.location.rotateY).toBe(0);
        expect(second.updatedTreePlane!.location.translateX).toBeCloseTo(400 - 120 - 300, 9);
        expect(planeDepth(second.updatedTree, second.updatedTreePlane!.planeID)).toBe(2);
    });

    it('a backward chain grows deeper at every generation; forward grows out of the wall toward the viewer', () => {
        const root = plane('a', { translateX: 100 });
        const spawn = { fallbackWidth: 400 };
        const backward = updateTreeWithNewPlane('/detail', 'a', { x: 300, y: 40 }, [root], registry, configuration, 'origin', { linkID: 'a#/detail#0', ...spawn });
        const deeper = updateTreeWithNewPlane('/detail', backward.updatedTreePlane!.planeID, { x: 50, y: 10 }, backward.updatedTree, registry, configuration, 'origin', { linkID: 'b', ...spawn });
        expect(backward.updatedTreePlane!.bridgeSide).toBe('start');
        expect(backward.updatedTreePlane!.location.translateZ).toBeCloseTo(-120, 9);
        // the grandchild: behind the fin (x < the fin's 400), at the link's depth, facing the root's way
        expect(deeper.updatedTreePlane!.bridgeSide).toBe('end');
        expect(deeper.updatedTreePlane!.location.translateX).toBeCloseTo(400 - 120 - 400, 9);
        expect(deeper.updatedTreePlane!.location.translateZ).toBeCloseTo(-170, 9);
        expect(deeper.updatedTreePlane!.location.rotateY).toBe(0);

        const forwardConfiguration = { ...configuration, space: { ...configuration.space, bridge: { ...configuration.space.bridge, direction: 'forward' as const } } };
        const first = updateTreeWithNewPlane('/detail', 'a', { x: 300, y: 40 }, [root], registry, forwardConfiguration, 'origin', { linkID: 'a#/detail#0', ...spawn });
        const second = updateTreeWithNewPlane('/detail', first.updatedTreePlane!.planeID, { x: 50, y: 10 }, first.updatedTree, registry, forwardConfiguration, 'origin', { linkID: 'b', ...spawn });
        const third = updateTreeWithNewPlane('/detail', second.updatedTreePlane!.planeID, { x: 50, y: 10 }, second.updatedTree, registry, forwardConfiguration, 'origin', { linkID: 'c', ...spawn });
        expect(first.updatedTreePlane!.planeAngle).toBe(-90);
        expect(first.updatedTreePlane!.bridgeSide).toBe('start');
        expect(first.updatedTreePlane!.location.rotateY).toBe(-90);
        // the fin (depth 1) starts 120 in front of the wall and extends further toward the viewer
        expect(first.updatedTreePlane!.location.translateZ).toBeCloseTo(120, 9);
        // the parallel grandchild hangs off the fin at its link's distance along it, facing the
        // viewer, mirrored to the fin's FRONT side (the fin faces −x)
        expect(second.updatedTreePlane!.bridgeSide).toBe('end');
        expect(second.updatedTreePlane!.location.translateZ).toBeCloseTo(170, 9);
        expect(second.updatedTreePlane!.location.rotateY).toBe(0);
        expect(second.updatedTreePlane!.location.translateX).toBeCloseTo(400 - 120 - 400, 9);
        // the next fin goes another bridge length toward the viewer
        expect(third.updatedTreePlane!.location.translateZ).toBeCloseTo(290, 9);
        expect(third.updatedTreePlane!.location.rotateY).toBe(-90);
        expect(third.updatedTreePlane!.bridgeSide).toBe('start');
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
