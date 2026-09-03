// #region imports
    // #region libraries
    import {
        interaction,
    } from '@plurid/plurid-engine';

    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        reducer,
        actions,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

const view = { width: 1000, height: 600 };

const initial = () => reducer(
    reducer(undefined, { type: '@@init' }),
    actions.setViewSize(view),
);

const plane = (
    planeID: string,
    location: Partial<TreePlane['location']> = {},
    size: { width?: number; height?: number } = {},
    children?: TreePlane[],
): TreePlane => ({
    sourceID: planeID,
    planeID,
    route: '/' + planeID,
    routeDivisions: {} as any,
    width: size.width ?? 0,
    height: size.height ?? 0,
    location: {
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
        ...location,
    },
    show: true,
    children,
});


describe('space slice camera commit path', () => {
    it('mirrors every camera commit into the legacy scalars and the rendered matrix', () => {
        const state = reducer(initial(), actions.rotateXWith(10));
        expect(state.rotationX).toBeCloseTo(10, 9);
        expect(state.camera.pitch).toBeCloseTo(10, 9);

        const expected = cameraEngine.cameraMatrix3d(
            cameraEngine.fromLegacy(
                { rotationX: 10, rotationY: 0, translationX: 0, translationY: 0, translationZ: 0, scale: 1 },
                view,
            ),
            view,
        );
        expect(state.transform).toBe(expected);
    });

    it('setTransform() recomputes the matrix (it used to leave it stale)', () => {
        const state = reducer(initial(), actions.setTransform({ rotationY: 30 }));
        expect(state.rotationY).toBeCloseTo(30, 9);
        expect(state.transform).not.toBe(cameraEngine.IDENTITY_MATRIX3D);
        expect(state.transform).toBe(cameraEngine.cameraMatrix3d(state.camera, view));
    });

    it('legacy translate actions are exact screen-space pans at any orientation', () => {
        // at rotation 0 the legacy scalar semantics hold exactly
        const flat = reducer(initial(), actions.translateXWith(100));
        expect(flat.translationX).toBeCloseTo(100, 6);
        expect(flat.translationY).toBeCloseTo(0, 6);

        // pitched: the pivot-depth content must move by exactly the requested screen delta
        const pitched = reducer(initial(), actions.rotateXWith(60));
        const point = cameraEngine.unprojectAtCameraZ(pitched.camera, view, { x: 400, y: 300 }, 0);
        const before = cameraEngine.project(pitched.camera, view, point);
        const panned = reducer(pitched, actions.translateYWith(100));
        const after = cameraEngine.project(panned.camera, view, point);
        expect(after.y - before.y).toBeCloseTo(100, 6);
        expect(after.x - before.x).toBeCloseTo(0, 6);
    });

    it('zoomAtPoint() keeps the anchored content fixed while rotated', () => {
        const rotated = reducer(initial(), actions.rotateYWith(30));
        const anchor = { x: 800, y: 100 };
        const world = cameraEngine.unprojectAtCameraZ(rotated.camera, view, anchor, 0);
        const zoomed = reducer(rotated, actions.zoomAtPoint({ deltaScale: 0.5, originX: anchor.x, originY: anchor.y }));
        expect(zoomed.scale).toBeCloseTo(1.5, 9);
        const projected = cameraEngine.project(zoomed.camera, view, world);
        expect(projected.x).toBeCloseTo(anchor.x, 5);
        expect(projected.y).toBeCloseTo(anchor.y, 5);

        const byFactor = reducer(rotated, actions.zoomAtPoint({ factor: 2, originX: anchor.x, originY: anchor.y }));
        expect(byFactor.scale).toBeCloseTo(2, 9);
    });

    it('stepped zoom keeps the legacy step and the limits', () => {
        const up = reducer(initial(), actions.scaleUp());
        expect(up.scale).toBeCloseTo(1.05, 9);
        let state = initial();
        for (let i = 0; i < 100; i += 1) {
            state = reducer(state, actions.scaleUp());
        }
        expect(state.scale).toBe(4);
    });

    it('clamps the pitch and wraps the yaw', () => {
        const state = reducer(reducer(initial(), actions.rotateXWith(200)), actions.rotateYWith(400));
        expect(state.rotationX).toBe(89);
        expect(state.rotationY).toBeCloseTo(40, 9);
    });

    it('spaceResetTransform() returns to the identity', () => {
        const moved = reducer(reducer(initial(), actions.rotateYWith(40)), actions.translateXWith(200));
        const reset = reducer(moved, actions.spaceResetTransform());
        expect(reset.transform).toBe(cameraEngine.IDENTITY_MATRIX3D);
        expect(reset.rotationY).toBe(0);
        expect(reset.translationX).toBeCloseTo(0, 9);
    });

    it('setViewSize() re-renders the same camera about the new center', () => {
        const state = reducer(initial(), actions.rotateYWith(20));
        const resized = reducer(state, actions.setViewSize({ width: 500, height: 400 }));
        expect(resized.transform).toBe(cameraEngine.cameraMatrix3d(resized.camera, { width: 500, height: 400 }));
        expect(reducer(resized, actions.setViewSize({ width: 500, height: 400 }))).toBe(resized);
    });

    it('setPlaneSize() is equality-gated and structurally shared', () => {
        const child = plane('b', { translateX: 500 }, { width: 100, height: 50 });
        const root = plane('a', {}, { width: 200, height: 100 }, [child]);
        const other = plane('c', { translateX: 900 }, { width: 200, height: 100 });
        let state = reducer(initial(), actions.restoreArrangement({ tree: [root, other], links: [] }));

        const same = reducer(state, actions.setPlaneSize({ planeID: 'b', width: 100, height: 50 }));
        expect(same.tree).toBe(state.tree);

        state = reducer(state, actions.setPlaneSize({ planeID: 'b', width: 300, height: 80 }));
        expect(state.tree[0].children![0].width).toBe(300);
        expect(state.tree[1]).toBe(other);
    });

    it('spaceFitToView() frames measured roots and children (not a zero-size box)', () => {
        const child = plane('b', { translateX: 800, translateZ: -200, rotateY: 90 }, { width: 400, height: 300 });
        const root = plane('a', {}, { width: 400, height: 300 }, [child]);
        const other = plane('c', { translateX: 600 }, { width: 400, height: 300 });
        const arranged = reducer(
            reducer(initial(), actions.restoreArrangement({ tree: [root, other], links: [] })),
            actions.rotateYWith(35),
        );

        const fitted = reducer(arranged, actions.spaceFitToView());
        expect(fitted.rotationX).toBe(0);
        expect(fitted.rotationY).toBe(0);
        expect(fitted.scale).toBeLessThan(4);

        const corners = [
            ...cameraEngine.planeCorners({ location: root.location, width: 400, height: 300 }),
            ...cameraEngine.planeCorners({ location: child.location, width: 400, height: 300 }),
            ...cameraEngine.planeCorners({ location: other.location, width: 400, height: 300 }),
        ];
        for (const corner of corners) {
            const projected = cameraEngine.project(fitted.camera, view, corner);
            expect(Math.abs(projected.x - 500)).toBeLessThanOrEqual(500 * 0.85 + 1e-6);
            expect(Math.abs(projected.y - 300)).toBeLessThanOrEqual(300 * 0.85 + 1e-6);
        }
    });

    it('applyCameraDelta() pans about the pivot-depth plane and setCamera() merges partials', () => {
        const state = reducer(initial(), actions.applyCameraDelta({ pan: { x: 10, y: 20 } }));
        expect(state.camera.offset.x).toBeCloseTo(10, 9);
        expect(state.camera.offset.y).toBeCloseTo(20, 9);
        const set = reducer(state, actions.setCamera({ yaw: 45 }));
        expect(set.camera.yaw).toBe(45);
        expect(set.camera.offset.x).toBeCloseTo(10, 9);
    });
});
// #endregion module
