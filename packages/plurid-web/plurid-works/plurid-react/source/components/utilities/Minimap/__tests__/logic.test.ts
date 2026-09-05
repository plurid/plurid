// #region imports
    // #region libraries
    import {
        TreePlane,
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        interaction,
    } from '~services/engine';

    import {
        projectMinimap,
        computeMinimapLayout,
        depthCue,
        DOT,
        HIT,
        CHILD_HIT,
    } from '../logic';
    // #endregion external
// #endregion imports



// #region module
const FRAME = { width: 172, height: 120, padding: 14 };
const VIEW = { width: 1456, height: 935 };

const plane = (
    planeID: string,
    x: number,
    y: number,
    z = 0,
    rotateY = 0,
    extra: Partial<TreePlane> = {},
): TreePlane => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {} as any,
    width: 247,
    height: 416,
    location: { translateX: x, translateY: y, translateZ: z, rotateX: 0, rotateY },
    show: true,
    ...extra,
});

/** The harness grid: five roots on 2×3 in X/Y, all at Z = 0. */
const grid = (): TreePlane[] => [
    plane('geometry', 0, 0),
    plane('transform', 0, 963),
    plane('material', 494, 0),
    plane('topology', 494, 963),
    plane('tessellation', 988, 0),
];

const identityCamera = () => interaction.camera.identityCamera(VIEW, 2000);

const input = (tree: TreePlane[], camera = identityCamera()) => ({
    tree,
    camera,
    viewSize: VIEW,
    configuration: defaultConfiguration,
    ...FRAME,
});

const byID = <T extends { planeID: string }>(dots: T[]) => new Map<string, T>(dots.map((dot) => [dot.planeID, dot]));


describe('the minimap projection (a fixed front view)', () => {
    it('lays the harness grid out on two rows with five distinct dots', () => {
        const { dots, links, ring } = projectMinimap(input(grid()));
        expect(dots).toHaveLength(5);
        expect(links).toHaveLength(0);
        const rows = new Set(dots.map((dot) => Math.round(dot.y)));
        expect(rows.size).toBe(2);
        const positions = new Set(dots.map((dot) => Math.round(dot.x) + ':' + Math.round(dot.y)));
        expect(positions.size).toBe(5);
        for (const dot of dots) {
            expect(dot.x).toBeGreaterThanOrEqual(FRAME.padding);
            expect(dot.x).toBeLessThanOrEqual(FRAME.width - FRAME.padding);
            expect(dot.hit).toBe(HIT);
            expect(dot.child).toBe(false);
            expect(dot.size).toBeCloseTo(DOT, 6);
        }
        expect(ring.clamped).toBe(false);
    });

    it('a child with depth changes nothing about the roots and appears smaller, dimmer, joined to its parent', () => {
        const before = byID(projectMinimap(input(grid())).dots);
        const tree = grid();
        tree[0] = { ...tree[0], children: [plane('detail', 112, 361, -160, 90, { parentPlaneID: 'geometry', width: 466 })] };
        const { dots, links } = projectMinimap(input(tree));

        expect(dots).toHaveLength(6);
        for (const dot of dots.filter((candidate) => !candidate.child)) {
            const previous = before.get(dot.planeID)!;
            expect(dot.x).toBeCloseTo(previous.x, 6);
            expect(dot.y).toBeCloseTo(previous.y, 6);
        }
        const child = dots.find((dot) => dot.planeID === 'detail')!;
        const parent = dots.find((dot) => dot.planeID === 'geometry')!;
        expect(child.child).toBe(true);
        expect(child.parentID).toBe('geometry');
        expect(child.hit).toBe(CHILD_HIT);
        expect(child.size).toBeLessThan(parent.size);
        expect(child.opacity).toBeLessThan(parent.opacity);
        expect(child.z).toBeLessThan(-100);
        // distinct from every root
        for (const dot of dots) {
            if (dot.planeID !== 'detail') {
                expect(Math.hypot(dot.x - child.x, dot.y - child.y)).toBeGreaterThan(1);
            }
        }
        expect(links).toEqual([{ planeID: 'detail', from: { x: parent.x, y: parent.y }, to: { x: child.x, y: child.y } }]);
        // farther = below its parent in the stack
        expect(child.zIndex).toBeLessThan(parent.zIndex);
    });

    it('the camera moves only the ring (the eye) and the pivot mark; an eye off the map is clamped and flagged', () => {
        const tree = grid();
        const rest = projectMinimap(input(tree));
        // face-on at rest: the eye sits straight in front of the pivot, so the ring is ON the pivot mark
        expect(rest.ring.x).toBeCloseTo(rest.ring.pivot.x, 6);
        expect(rest.ring.y).toBeCloseTo(rest.ring.pivot.y, 6);
        expect(rest.ring.clamped).toBe(false);

        // an orbit of 30° swings the eye sideways: the ring moves right of the pivot, the tick points back at it
        const orbited = projectMinimap(input(tree, { ...identityCamera(), yaw: 30 }));
        expect(orbited.dots.map((dot) => [dot.x, dot.y])).toEqual(rest.dots.map((dot) => [dot.x, dot.y]));
        expect(orbited.ring.pivot.x).toBeCloseTo(rest.ring.pivot.x, 6);
        expect(Math.abs(orbited.ring.x - rest.ring.x)).toBeGreaterThan(5);
        expect(Math.hypot(orbited.ring.tickX, orbited.ring.tickY)).toBeCloseTo(8, 6);
        expect(Math.sign(orbited.ring.tickX)).toBe(Math.sign(orbited.ring.pivot.x - orbited.ring.x));

        // framing the 90° child (yaw -90) puts the eye ~2000 units out along world X: off the map, clamped to its edge
        const away = projectMinimap(input(tree, { ...identityCamera(), yaw: -90, pivot: { x: 112, y: 524, z: -393 } }));
        expect(away.dots.map((dot) => [dot.x, dot.y])).toEqual(rest.dots.map((dot) => [dot.x, dot.y]));
        expect(away.ring.clamped).toBe(true);
        expect(away.ring.x).toBe(FRAME.width - FRAME.padding / 2);
        expect(away.ring.tickX).toBeLessThan(0);
        expect(away.ring.pivot.clamped).toBe(false);

        const outside = projectMinimap(input(tree, { ...identityCamera(), pivot: { x: 20000, y: -20000, z: 0 } }));
        expect(outside.ring.clamped).toBe(true);
        expect(outside.ring.pivot.clamped).toBe(true);
        expect(outside.ring.x).toBe(FRAME.width - FRAME.padding / 2);
        expect(outside.ring.y).toBe(FRAME.padding / 2);
    });

    it('skips hidden planes and hidden subtrees; an empty tree has no dots and a centred ring', () => {
        const tree = grid();
        tree[1] = { ...tree[1], show: false, children: [plane('orphan', 0, 963, -160, 90, { parentPlaneID: 'transform' })] };
        const { dots } = computeMinimapLayout({ tree, viewSize: VIEW, configuration: defaultConfiguration, ...FRAME });
        expect(dots.map((dot) => dot.planeID)).toEqual(['geometry', 'material', 'topology', 'tessellation']);

        const empty = projectMinimap(input([]));
        expect(empty.dots).toEqual([]);
        expect(empty.ring).toEqual({ x: FRAME.width / 2, y: FRAME.height / 2, clamped: false, tickX: 0, tickY: 0, pivot: { x: FRAME.width / 2, y: FRAME.height / 2, clamped: false } });
    });

    it('nearer dots stack on top; the depth cue is monotonic and bounded', () => {
        const tree = [plane('far', 0, 0, -800), plane('near', 300, 0, 400), plane('flat', 600, 0, 0)];
        const { dots } = projectMinimap(input(tree));
        const by = byID(dots);
        expect(by.get('near')!.zIndex).toBeGreaterThan(by.get('flat')!.zIndex);
        expect(by.get('flat')!.zIndex).toBeGreaterThan(by.get('far')!.zIndex);
        expect(depthCue(-4000).size).toBeCloseTo(DOT * 0.6, 6);
        expect(depthCue(4000).size).toBeCloseTo(DOT * 1.4, 6);
        expect(depthCue(-4000).opacity).toBe(0.45);
        expect(depthCue(0)).toEqual({ size: DOT, opacity: 1 });
    });
});
// #endregion module
