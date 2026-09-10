// #region imports
    // #region external
    import {
        Registrar,
    } from '../../../../planes/registrar';
    import {
        camera as cameraEngine,
    } from '../../../../interaction';
    import compute from '../..';
    import {
        dockedBootCamera,
    } from '..';
    import Tree from '../../../../space/tree/object';
    // #endregion external
// #endregion imports



// #region module
const component = () => null;
const registrar = () => new Registrar<any>([
    { route: '/page-1', component },
    { route: '/page-2', component },
]);
const page = { space: { presentation: 'page' as const } };

describe('the address bar is the page at store time', () => {
    it('a deep link to a root page boots docked on it: the camera is that root\'s dock pose', () => {
        const state = compute(['/page-1', '/page-2'], page, registrar(), undefined, undefined, undefined, undefined, 'origin', {
            dockPath: () => '/page-2',
        });
        const second = state.space.tree[1];
        expect(cameraEngine.findDockedPlane(state.space.camera, state.space.tree as any, state.space.viewSize, { width: state.space.viewSize.width, height: state.space.viewSize.height }, undefined, state.space.cameraLimits)).toBe(second.planeID);
        // laid out at store time: the second root is not at the origin
        expect(second.location.translateX).not.toBe(state.space.tree[0].location.translateX);
        // the mirrors follow the camera
        expect(state.space.transform).toBe(cameraEngine.cameraMatrix3d(state.space.camera, state.space.viewSize));
    });

    it('the first root, or a path no root answers to, keeps the identity camera; the reader sees the merged configuration', () => {
        const first = compute(['/page-1', '/page-2'], page, registrar(), undefined, undefined, undefined, undefined, 'origin', { dockPath: () => '/page-1' });
        expect(cameraEngine.findDockedPlane(first.space.camera, first.space.tree as any, first.space.viewSize, first.space.viewSize, undefined, first.space.cameraLimits)).toBe(first.space.tree[0].planeID);
        const orphan = compute(['/page-1', '/page-2'], page, registrar(), undefined, undefined, undefined, undefined, 'origin', { dockPath: () => '/page-3' });
        const none = compute(['/page-1', '/page-2'], page, registrar(), undefined, undefined, undefined, undefined, 'origin', { dockPath: () => null });
        expect(orphan.space.camera).toEqual(none.space.camera);
        const second = compute(['/page-1', '/page-2'], page, registrar(), undefined, undefined, undefined, undefined, 'origin', { dockPath: () => '/page-2' });
        expect(orphan.space.camera).not.toEqual(second.space.camera);
        let seen: boolean | undefined;
        compute(['/page-1'], page, registrar(), undefined, undefined, undefined, undefined, 'origin', {
            dockPath: (configuration) => { seen = configuration.space.docking?.url === true; return null; },
        });
        expect(seen).toBe(true);
    });

    it('a persisted tree and view size are what the deep link docks on', () => {
        const booted = compute(['/page-1', '/page-2'], page, registrar(), undefined, undefined, undefined, undefined, 'origin', { dockPath: () => '/page-1' });
        const viewSize = { width: 1280, height: 800 };
        const tree = new Tree<any>({ planes: registrar().getAll(), configuration: booted.configuration, view: ['/page-1', '/page-2'], layout: true, viewSize }).compute();
        expect(tree[1].location.translateX).not.toBe(booted.space.tree[1].location.translateX);
        const persisted = { ...booted, space: { ...booted.space, tree, viewSize } };
        const state = compute(['/page-1', '/page-2'], page, registrar(), undefined, persisted, undefined, undefined, 'origin', { dockPath: () => '/page-2' });
        expect(state.space.viewSize).toEqual(viewSize);
        expect(state.space.tree[1].location).toEqual(tree[1].location);
        expect(cameraEngine.findDockedPlane(state.space.camera, state.space.tree as any, viewSize, viewSize, undefined, state.space.cameraLimits)).toBe(tree[1].planeID);
    });

    it('a running store keeps its camera; dockedBootCamera answers undefined for nothing', () => {
        const booted = compute(['/page-1', '/page-2'], page, registrar(), undefined, undefined, undefined, undefined, 'origin', { dockPath: () => '/page-2' });
        const again = compute(['/page-1', '/page-2'], page, registrar(), booted, undefined, undefined, undefined, 'origin', { dockPath: () => '/page-1' });
        expect(again.space.camera).toEqual(booted.space.camera);
        expect(dockedBootCamera(booted.space.camera, booted.space.tree, booted.configuration, booted.space.viewSize, booted.space.cameraLimits, null)).toBeUndefined();
        expect(dockedBootCamera(booted.space.camera, booted.space.tree, booted.configuration, booted.space.viewSize, booted.space.cameraLimits, '/nowhere')).toBeUndefined();
    });
});
// #endregion module
