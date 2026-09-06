// #region imports
    // #region external
    import {
        identityCamera,
    } from '../state';
    import {
        applyCameraDelta,
    } from '../delta';
    import {
        dockPose,
        isDocked,
        findDockedPlane,
        dockGeometry,
        dockCandidate,
        revealPose,
        REVEAL,
    } from '../dock';
    // #endregion external
// #endregion imports



// #region module
const view = { width: 1280, height: 800 };
const page = (translateX = 0, translateY = 0, rotateY = 0) => ({
    location: { translateX, translateY, translateZ: 0, rotateX: 0, rotateY },
    width: view.width,
    height: view.height,
});

describe('docking', () => {
    it('the identity camera is the dock pose of a view-sized root at the origin', () => {
        const camera = identityCamera(view);
        expect(isDocked(camera, page(), view)).toBe(true);
        const docked = dockPose(camera, page());
        expect(docked.scale).toBe(1);
        expect(docked.yaw).toBe(0);
        expect(docked.pitch).toBe(0);
        expect(isDocked(docked, page(), view)).toBe(true);
    });

    it('one pixel of zoom, one degree of yaw, or a shifted page undocks', () => {
        const camera = identityCamera(view);
        expect(isDocked({ ...camera, scale: 0.9995 }, page(), view)).toBe(true);  // within 1e-3
        expect(isDocked({ ...camera, scale: 0.99 }, page(), view)).toBe(false);
        expect(isDocked({ ...camera, yaw: 1 }, page(), view)).toBe(false);
        expect(isDocked(camera, page(2, 0), view)).toBe(false);
        expect(isDocked(camera, page(0, 0.4), view)).toBe(true);                  // within half a pixel
    });

    it('docking survives a lossless re-pivot (the picture, not the parameters, is the state)', () => {
        const camera = identityCamera(view);
        // a pivot change (the cursor orbit pivot) re-parameterizes pivot / offset without moving the picture
        const repivoted = applyCameraDelta(camera, { pivot: { x: 100, y: 120, z: 0 } }, view);
        expect(repivoted.pivot).not.toEqual(camera.pivot);
        expect(isDocked(repivoted, page(), view)).toBe(true);
        // a zoom in then out about a corner lands back on the page
        const zoomed = applyCameraDelta(repivoted, { zoom: { factor: 2, anchor: { x: 100, y: 120 } } }, view);
        expect(isDocked(zoomed, page(), view)).toBe(false);
        const back = applyCameraDelta(zoomed, { zoom: { factor: 0.5, anchor: { x: 100, y: 120 } } }, view);
        expect(isDocked(back, page(), view)).toBe(true);
    });

    it('a second page below, or a turned child, docks with its own pose', () => {
        const camera = identityCamera(view);
        const below = page(0, view.height + 50);
        expect(isDocked(camera, below, view)).toBe(false);
        expect(isDocked(dockPose(camera, below), below, view)).toBe(true);
        const child = page(200, 300, 90);
        const docked = dockPose(camera, child);
        expect(docked.yaw).toBe(-90);
        expect(isDocked(docked, child, view)).toBe(true);
    });

    it('findDockedPlane walks children, skips hidden planes; dockCandidate picks the nearest', () => {
        const camera = identityCamera(view);
        const fallback = { width: view.width, height: view.height };
        const tree = [
            { planeID: 'root', ...page(), children: [{ planeID: 'child', ...page(200, 300, 90) }] },
            { planeID: 'hidden', ...page(), show: false },
            { planeID: 'second', ...page(0, view.height + 50) },
        ];
        expect(findDockedPlane(camera, tree, view, fallback)).toBe('root');
        expect(findDockedPlane(dockPose(camera, page(200, 300, 90)), tree, view, fallback)).toBe('child');
        expect(findDockedPlane(dockPose(camera, page(0, view.height + 50)), tree, view, fallback)).toBe('second');
        expect(findDockedPlane({ ...camera, scale: 0.5 }, tree, view, fallback)).toBe('');
        expect(dockCandidate(camera, tree, view, fallback)).toBe('root');
        expect(dockCandidate({ ...camera, offset: { x: 0, y: -(view.height + 50), z: 0 } }, tree, view, fallback)).toBe('second');
        expect(dockCandidate(camera, [], view, fallback)).toBe('');
    });

    it('the reveal pose pulls back and tilts', () => {
        const docked = dockPose(identityCamera(view), page());
        const revealed = revealPose(docked);
        expect(revealed.scale).toBe(REVEAL.scale);
        expect(revealed.pitch).toBe(REVEAL.pitch);
        expect(revealed.yaw).toBe(REVEAL.yaw);
        expect(isDocked(revealed, page(), view)).toBe(false);
    });

    it('a page smaller than the view docks too: its dock pose passes its own test (centered, scale 1)', () => {
        const camera = identityCamera(view);
        const small = { location: { translateX: 300, translateY: 200, translateZ: 0, rotateX: 0, rotateY: 0 }, width: 600, height: 400 };
        expect(isDocked(camera, small, view)).toBe(false);
        const docked = dockPose(camera, small);
        expect(docked.scale).toBe(1);
        expect(isDocked(docked, small, view)).toBe(true);
        expect(isDocked({ ...docked, pivot: { ...docked.pivot, x: docked.pivot.x + 2 } }, small, view)).toBe(false);
        // a tilted page docks face-on whatever the orbit's pitch limit
        const tilted = { ...small, location: { ...small.location, rotateX: 90 } };
        expect(isDocked(dockPose(camera, tilted), tilted, view)).toBe(true);
    });

    it('two parallel pages behind a site (two links in one header): docked on one, the other is not docked', () => {
        // both hang behind the site turned 90°, 300 units apart along the site's x — which is the
        // camera's depth axis once docked on either
        const about = { planeID: 'about', location: { translateX: 260, translateY: 0, translateZ: -100, rotateX: 0, rotateY: 90 }, width: view.width, height: view.height };
        const contact = { planeID: 'contact', location: { translateX: 560, translateY: 0, translateZ: -100, rotateX: 0, rotateY: 90 }, width: view.width, height: view.height };
        const camera = identityCamera(view);
        const onContact = dockPose(camera, contact);
        expect(isDocked(onContact, contact, view)).toBe(true);
        expect(isDocked(onContact, about, view)).toBe(false);
        expect(findDockedPlane(onContact, [about, contact], view, { width: view.width, height: view.height })).toBe('contact');
        expect(findDockedPlane(dockPose(camera, about), [about, contact], view, { width: view.width, height: view.height })).toBe('about');
    });

    it('the candidate is the plane under the view center; nothing when every plane is hidden or the tree is empty', () => {
        const camera = identityCamera(view);
        const configured = { width: view.width, height: view.height };
        const hidden = [{ planeID: 'p1', ...page(), show: false }, { planeID: 'p2', ...page(), show: false }];
        expect(dockCandidate(camera, hidden, view, configured)).toBe('');
        expect(dockCandidate(camera, [], view, configured)).toBe('');
        // a hidden root hides its whole subtree: its shown child is no candidate either
        const child = { planeID: 'c1', ...page(), location: { ...page().location, translateX: 400 } };
        expect(dockCandidate(camera, [{ planeID: 'p1', ...page(), show: false, children: [child] }], view, configured)).toBe('');
        expect(dockCandidate(camera, [{ planeID: 'p1', ...page(), children: [child] }], view, configured)).toBe('p1');
    });

    it('a measured size is an observation of the configured one: a stale measurement never undocks a page', () => {
        const camera = identityCamera(view);
        const configured = { width: view.width, height: view.height };
        // measured at the view size of the previous frame (a smaller window)
        const stale = { planeID: 'p1', ...page(), width: 771, height: 764, sizeMode: 'measured' as const };
        expect(findDockedPlane(camera, [stale], view, configured)).toBe('p1');
        expect(dockGeometry(stale, configured)).toEqual({ location: stale.location, width: view.width, height: view.height });
        // a DECLARED size is the plane's own
        const declared = { ...stale, sizeMode: 'declared' as const };
        expect(dockGeometry(declared, configured)).toEqual({ location: stale.location, width: 771, height: 764 });
        expect(findDockedPlane(camera, [declared], view, configured)).toBe('');
        // a content-driven dimension (configured 0) takes the measurement
        expect(dockGeometry(stale, { width: view.width, height: 0 }).height).toBe(764);
    });

});
// #endregion module
