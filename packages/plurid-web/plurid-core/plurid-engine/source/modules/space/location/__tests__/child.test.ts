// #region imports
    // #region libraries
    import {
        TreePlane,
        TreePlaneLocation,
        PLANE_BAR_HEIGHT,
        BRIDGE_STRIP_HEIGHT,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        childLocation,
        linkWorldPoint,
        childLeashPoint,
        resolveSpawnAnchor,
        anchoredCoordinates,
        SIBLING_GAP,
        resolveBridgeOffset,
        resolveBridgeSide,
        resolvePlaneAngle,
        recomputeSubtree,
        DEFAULT_BRIDGE_LENGTH,
        DEFAULT_PLANE_ANGLE,
        FALLBACK_CHILD_WIDTH,
    } from '../child';
    // #endregion external
// #endregion imports



// #region module
/**
 * WHERE A SPAWNED PLANE GOES. This module places every child the space opens — the bridge from the
 * link, the child's facing, the mirrored side that keeps a generation behind its parent's face — and
 * the leash a dragged child keeps. It had NO test (2026-09-13): the whole geometry was verified only
 * by browser scenarios and by eye, so an off-by-a-strip or a flipped sign could only be seen, never
 * caught.
 */
const DEG = Math.PI / 180;

const at = (
    overrides: Partial<TreePlaneLocation> = {},
): TreePlaneLocation => ({
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
    ...overrides,
});

const near = (
    actual: number,
    expected: number,
) => expect(actual).toBeCloseTo(expected, 9);


describe('the link\'s point on the parent', () => {
    it('an unturned parent: the link is its own offset from the origin, and never pitched', () => {
        const point = linkWorldPoint(at({ translateX: 100, translateY: 50, translateZ: -20 }), { x: 40, y: 300 });
        near(point.x, 140);
        near(point.y, 350);
        near(point.z, -20);
    });

    it('a TURNED parent carries the link along its own axis: +x goes toward −z at +90°', () => {
        const point = linkWorldPoint(at({ rotateY: 90 }), { x: 200, y: 10 });
        near(point.x, 0);
        near(point.y, 10);
        near(point.z, -200);
    });

    it('the link\'s y is world down whatever the turn (a parent is never pitched by a link)', () => {
        for (const rotateY of [-135, -90, 0, 45, 90, 180]) {
            const point = linkWorldPoint(at({ rotateY, translateY: 7 }), { x: 0, y: 120 });
            near(point.y, 127);
        }
    });
});


describe('where the child lands', () => {
    it('the default: a bridge 100 px at 90.1° off the parent, the child turned the same way', () => {
        const location = childLocation(at(), { x: 0, y: 0 });

        // 90.1° sends the bridge toward −z, behind the parent's face, a tenth of a degree past
        // perpendicular: cos 90.1° = −0.001745, sin 90.1° = 0.9999985
        expect(location.translateX).toBeCloseTo(-0.1745, 3);
        expect(location.translateZ).toBeCloseTo(-99.99985, 3);
        expect(location.rotateY).toBe(DEFAULT_PLANE_ANGLE);
        expect(location.rotateX).toBe(0);
    });

    it('the child hangs from the LINK, so moving the link moves the child with it', () => {
        const first = childLocation(at(), { x: 0, y: 0 });
        const lower = childLocation(at(), { x: 0, y: 240 });
        near(lower.translateY - first.translateY, 240);

        const along = childLocation(at(), { x: 180, y: 0 });
        near(along.translateX - first.translateX, 180);
    });

    it('a MIRRORED child (bridgeSide `end`) sits on the other side of the link, a bridge AND its own width back', () => {
        const start = childLocation(at(), { x: 0, y: 0 }, 100, 90, 'start', 400);
        const end = childLocation(at(), { x: 0, y: 0 }, 100, 90, 'end', 400);

        // start: 100 px along the bridge; end: back by the bridge plus the child's width
        near(start.translateZ, -100);
        near(end.translateZ, 500);
        // and both face the same way: the mirror moves the plane, it does not turn it
        expect(end.rotateY).toBe(start.rotateY);
    });

    it('an unmeasured mirrored child is placed by the FALLBACK width, so it is not on top of the link', () => {
        const unmeasured = childLocation(at(), { x: 0, y: 0 }, 100, 90, 'end', 0);
        near(unmeasured.translateZ, 100 + FALLBACK_CHILD_WIDTH);
    });

    it('the bridge offset lowers the plane by exactly what it is given', () => {
        const flush = childLocation(at(), { x: 0, y: 0 }, 100, 90, 'start', 0, 0);
        const page = childLocation(at(), { x: 0, y: 0 }, 100, 90, 'start', 0, resolveBridgeOffset('page'));
        const space = childLocation(at(), { x: 0, y: 0 }, 100, 90, 'start', 0, resolveBridgeOffset('space'));

        near(page.translateY - flush.translateY, PLANE_BAR_HEIGHT - BRIDGE_STRIP_HEIGHT / 2);
        near(space.translateY - flush.translateY, -BRIDGE_STRIP_HEIGHT / 2);
    });

    it('a turned parent turns the whole arrangement: the child\'s facing is the parent\'s plus the angle', () => {
        const location = childLocation(at({ rotateY: 45 }), { x: 0, y: 0 }, 100, 90);
        expect(location.rotateY).toBe(135);
        // the bridge left at 45 + 90 = 135°
        near(location.translateX, 100 * Math.cos(135 * DEG));
        near(location.translateZ, -100 * Math.sin(135 * DEG));
    });
});


describe('the leash point', () => {
    const child = (
        overrides: Partial<TreePlane> = {},
    ): Pick<TreePlane, 'location' | 'width' | 'bridgeSide' | 'bridgeOffset'> => ({
        location: at({ translateX: 300, translateY: 120, translateZ: -40, rotateY: 90 }),
        width: 400,
        ...overrides,
    } as TreePlane);

    it('the ordinary child: the leash meets its left edge, at the link\'s line', () => {
        const point = childLeashPoint(child());
        near(point.x, 300);
        near(point.y, 120);
        near(point.z, -40);
    });

    it('a MIRRORED child: the leash meets its RIGHT edge — its own width along its axis', () => {
        const point = childLeashPoint(child({ bridgeSide: 'end' } as Partial<TreePlane>));
        // the child is turned 90°, so its local +x is world −z
        near(point.x, 300);
        near(point.z, -440);
    });

    it('the bridge offset lifts the leash back onto the link\'s line', () => {
        const offset = resolveBridgeOffset('space');
        const point = childLeashPoint(child({ bridgeOffset: offset } as Partial<TreePlane>));
        // the plane sits `offset` below the line, so the leash point is `offset` above the plane's top
        near(point.y, 120 - offset);
    });
});


describe('which side, and which angle', () => {
    it('backward: a positive angle already hangs behind the parent, a negative one must be mirrored', () => {
        expect(resolveBridgeSide(90, 'backward')).toBe('start');
        expect(resolveBridgeSide(-90, 'backward')).toBe('end');
    });

    it('forward is the exact opposite', () => {
        expect(resolveBridgeSide(90, 'forward')).toBe('end');
        expect(resolveBridgeSide(-90, 'forward')).toBe('start');
    });

    it('the FIXED fan turns every generation the same way; ALTERNATE flips each one', () => {
        for (const depth of [1, 2, 3, 4]) {
            expect(resolvePlaneAngle(depth, 90, 'fixed')).toBe(90);
        }
        expect(resolvePlaneAngle(1, 90, 'alternate')).toBe(90);
        expect(resolvePlaneAngle(2, 90, 'alternate')).toBe(-90);
        expect(resolvePlaneAngle(3, 90, 'alternate')).toBe(90);
    });

    it('forward starts negative, in both fans', () => {
        expect(resolvePlaneAngle(1, 90, 'fixed', 'forward')).toBe(-90);
        expect(resolvePlaneAngle(1, 90, 'alternate', 'forward')).toBe(-90);
        expect(resolvePlaneAngle(2, 90, 'alternate', 'forward')).toBe(90);
    });
});


describe('recomputing a subtree', () => {
    const withChild = (
        childOverrides: Partial<TreePlane> = {},
    ): TreePlane => ({
        planeID: '/parent',
        sourceID: '/parent',
        route: '/parent',
        show: true,
        width: 400,
        height: 300,
        location: at(),
        routeDivisions: {} as TreePlane['routeDivisions'],
        children: [{
            planeID: '/child',
            sourceID: '/child',
            route: '/child',
            show: true,
            width: 400,
            height: 300,
            location: at({ translateX: 9999, translateY: 9999 }),
            routeDivisions: {} as TreePlane['routeDivisions'],
            linkCoordinates: { x: 40, y: 60 },
            bridgeLength: 100,
            planeAngle: 90,
            ...childOverrides,
        }],
    } as TreePlane);

    it('re-places a link-spawned child from its parent\'s CURRENT location', () => {
        const recomputed = recomputeSubtree(withChild());
        const child = recomputed.children![0];

        // it moved off the nonsense location, onto the geometry its link describes
        expect(child.location.translateX).not.toBe(9999);
        near(child.location.translateY, 60);
        near(child.location.translateZ, -100);
    });

    it('a PINNED child stays where it was dropped — and its own children still follow it', () => {
        const pinned = withChild({ manuallyPositioned: true });
        const recomputed = recomputeSubtree(pinned);
        expect(recomputed.children![0].location.translateX).toBe(9999);
    });

    it('a child with no link coordinates (a host-authored subtree) is left alone', () => {
        const authored = withChild({ linkCoordinates: undefined });
        const recomputed = recomputeSubtree(authored);
        expect(recomputed.children![0].location.translateX).toBe(9999);
    });

    it('nothing to move returns the SAME reference (structural sharing survives)', () => {
        const once = recomputeSubtree(withChild());
        expect(recomputeSubtree(once)).toBe(once);

        const leaf = { planeID: '/leaf', location: at() } as TreePlane;
        expect(recomputeSubtree(leaf)).toBe(leaf);
    });
});


/**
 * 90.1 AND NEVER 90 (the user's rule, 2026-09-16): the default angle is a tenth of a degree off
 * perpendicular, so every spawned quad is a quad. The numbers here are the geometry the reading
 * preset is built on, to a thousandth.
 */
describe('the default angle is 90.1', () => {
    it('is not 90', () => {
        expect(DEFAULT_PLANE_ANGLE).toBe(90.1);
    });

    it('places a child one bridge behind the link, a tenth of a degree off perpendicular', () => {
        const child = childLocation(at(), { x: 460, y: 0 });
        // cos 90.1° = −0.001745…, sin 90.1° = 0.9999985
        expect(child.translateX).toBeCloseTo(460 - 0.1745, 3);
        expect(child.translateZ).toBeCloseTo(-99.99985, 3);
        expect(child.rotateY).toBeCloseTo(90.1, 9);
    });

    it('alternates back to the grandparent\'s facing, beside and behind the fin', () => {
        const fin = childLocation(at(), { x: 460, y: 0 }, DEFAULT_BRIDGE_LENGTH, resolvePlaneAngle(1, 90.1, 'alternate'));
        const grandchild = childLocation(fin, { x: 460, y: 0 }, DEFAULT_BRIDGE_LENGTH, resolvePlaneAngle(2, 90.1, 'alternate'));
        expect(grandchild.rotateY).toBeCloseTo(0, 9);
        // the fin's far end sits ~560 behind the root; the grandchild one bridge to its right
        // the fin's far end: 460·sin 90.1° behind its own start, and 0.8px to the left of it
        expect(grandchild.translateZ).toBeCloseTo(-559.999, 2);
        expect(grandchild.translateX).toBeCloseTo(559.023, 2);
    });
});


describe('where a spawned child hangs', () => {
    it('leaves the link\'s own point by default, on a strip', () => {
        expect(resolveSpawnAnchor(460, { x: 120, y: 80 })).toEqual({
            linkCoordinates: { x: 120, y: 80 },
            bridgeLength: DEFAULT_BRIDGE_LENGTH,
            bridgeKind: 'strip',
        });
    });

    it('leaves the parent\'s right edge at the link\'s height with the edge anchor', () => {
        expect(resolveSpawnAnchor(460, { x: 120, y: 80 }, { anchor: 'edge' }).linkCoordinates).toEqual({ x: 460, y: 80 });
        // an unmeasured parent has no edge to anchor to yet: the link point stands in
        expect(resolveSpawnAnchor(0, { x: 120, y: 80 }, { anchor: 'edge' }).linkCoordinates).toEqual({ x: 120, y: 80 });
    });

    it('staggers siblings along the child\'s own width axis, the later ones on leashes', () => {
        const first = resolveSpawnAnchor(460, { x: 460, y: 0 }, { anchor: 'edge', ordinal: 0, childWidth: 460 });
        const second = resolveSpawnAnchor(460, { x: 460, y: 0 }, { anchor: 'edge', ordinal: 1, childWidth: 460 });
        const third = resolveSpawnAnchor(460, { x: 460, y: 0 }, { anchor: 'edge', ordinal: 2, childWidth: 460 });
        expect(first.bridgeLength).toBe(100);
        expect(second.bridgeLength).toBe(100 + 460 + SIBLING_GAP);
        expect(third.bridgeLength).toBe(100 + 2 * (460 + SIBLING_GAP));
        expect([first.bridgeKind, second.bridgeKind, third.bridgeKind]).toEqual(['strip', 'leash', 'leash']);
        // and the three fins do not overlap: each starts where the one before ends, plus the gap
        expect(second.bridgeLength - first.bridgeLength).toBeGreaterThanOrEqual(460);
    });

    it('grows a sibling\'s bridge by the fallback width before the child is measured', () => {
        expect(resolveSpawnAnchor(460, { x: 460, y: 0 }, { ordinal: 1, childWidth: 0 }).bridgeLength).toBe(100 + FALLBACK_CHILD_WIDTH + SIBLING_GAP);
    });

    it('keeps an edge-anchored child on the edge when its parent is resized or its link re-measured', () => {
        expect(anchoredCoordinates({ width: 520 }, { linkCoordinates: { x: 460, y: 80 }, bridgeAnchor: 'edge' })).toEqual({ x: 520, y: 80 });
        expect(anchoredCoordinates({ width: 520 }, { linkCoordinates: { x: 120, y: 80 }, bridgeAnchor: 'link' })).toEqual({ x: 120, y: 80 });
        expect(anchoredCoordinates({ width: 0 }, { linkCoordinates: { x: 120, y: 80 }, bridgeAnchor: 'edge' })).toEqual({ x: 120, y: 80 });
    });

    it('a relayout keeps the edge anchor: a wider parent carries its child out with its edge', () => {
        const child: TreePlane = {
            sourceID: 'c', planeID: 'c', route: '/c', routeDivisions: {} as any,
            width: 460, height: 300, show: true,
            linkCoordinates: { x: 460, y: 0 }, bridgeAnchor: 'edge', bridgeLength: 100, planeAngle: 90.1,
            location: childLocation(at(), { x: 460, y: 0 }, 100, 90.1),
        };
        const parent: TreePlane = {
            sourceID: 'p', planeID: 'p', route: '/p', routeDivisions: {} as any,
            width: 600, height: 300, show: true, location: at(), children: [child],
        };
        const relaid = recomputeSubtree(parent);
        expect(relaid.children![0].location.translateX).toBeCloseTo(600 - 0.1745, 3);
    });
});
// #endregion module
