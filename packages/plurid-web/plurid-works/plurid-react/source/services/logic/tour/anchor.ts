// #region imports
    // #region libraries
    import type {
        TreePlane,
        PluridPlaneAnchor,
        PluridAnchorPose,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import type {
        AppState,
    } from '~services/state/store';

    import {
        interaction,
        space as spaceEngine,
    } from '~services/engine';

    import {
        resolveAnchor,
        frameTargetForPlane,
        dockGeometry,
        planeGeometry,
        resolvePlaneFallbackSize,
        sameCamera,
    } from '~services/logic/camera';
    // #endregion external


    // #region internal
    import {
        planeIdentity,
    } from './path';
    // #endregion internal
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

/** Six decimals: a millionth of a degree or a px is below anything a picture shows, and the JSON stays legible. */
const round = (
    value: number,
): number => {
    const rounded = Math.round(value * 1e6) / 1e6;
    return rounded === 0 ? 0 : rounded;
};

const roundPose = (
    pose: PluridAnchorPose,
): PluridAnchorPose => ({
    yaw: round(pose.yaw),
    pitch: round(pose.pitch),
    roll: round(pose.roll ?? 0),
    scale: round(pose.scale),
    pivot: { x: round(pose.pivot.x), y: round(pose.pivot.y), z: round(pose.pivot.z) },
    offset: {
        x: round(pose.offset?.x ?? 0),
        y: round(pose.offset?.y ?? 0),
        z: round(pose.offset?.z ?? 0),
    },
});

/** Every shown plane, in tree order: a closed plane hides what hangs from it. */
const shownPlanes = (
    tree: TreePlane[],
): TreePlane[] => {
    const planes: TreePlane[] = [];
    const walk = (nodes: TreePlane[] | undefined) => {
        for (const node of nodes || []) {
            if (node.show === false) {
                continue;
            }
            planes.push(node);
            walk(node.children);
        }
    };
    walk(tree);
    return planes;
};


/**
 * THE PLANE THE CAMERA LOOKS AT: the page it is docked on; else the plane nearest the eye under the
 * view centre; else the first selected plane; else the plane whose centre is drawn nearest the view
 * centre. Not the active plane: that one follows the pointer, and a recorded stop is where the
 * reader looks, not where the mouse rests.
 */
export const lookedAtPlane = (
    state: AppState,
): TreePlane | undefined => {
    const space = state.space;
    const configuration = state.configuration;
    const view = space.viewSize;
    const configured = spaceEngine.layout.configuredPlaneSize(configuration, view);
    const byID = (planeID: string) => (planeID ? spaceEngine.tree.logic.getTreePlaneByID(space.tree, planeID) : undefined);

    const docked = cameraEngine.findDockedPlane(
        space.camera,
        space.tree,
        view,
        configured,
        configuration.space.docking?.epsilon,
        space.cameraLimits,
        configuration.space.docking?.scale,
    );
    if (docked) {
        return byID(docked);
    }

    const shown = shownPlanes(space.tree);
    const fallback = resolvePlaneFallbackSize(configuration, view);
    const centre = { x: view.width / 2, y: view.height / 2 };
    let nearest: TreePlane | undefined;
    let nearestDepth = -Infinity;
    for (const plane of shown) {
        const pick = cameraEngine.pickPlanePoint(space.camera, view, planeGeometry(plane, fallback), centre);
        // camera-space depth grows toward the eye: the largest is the plane in front
        if (pick && pick.inside && pick.cameraZ > nearestDepth) {
            nearest = plane;
            nearestDepth = pick.cameraZ;
        }
    }
    if (nearest) {
        return nearest;
    }

    const shownIDs = new Set(shown.map((plane) => plane.planeID));
    const selected = space.selectedPlaneIDs.find((planeID) => shownIDs.has(planeID));
    if (selected) {
        return byID(selected);
    }

    return byID(cameraEngine.dockCandidate(space.camera, space.tree, view, configured));
};


/**
 * WHERE THE CAMERA IS, AS AN ANCHOR (2026-10-30): the plane it looks at (or `planeID`), named by its
 * path, and the camera as a pose on it. A camera docked on the plane is `dock`, one standing where
 * the frame control puts it is `frame` (both recomputed from the plane's size when the anchor
 * resolves, so they follow a resize too), and any other camera is its pose in the plane's frame,
 * six decimals deep. `undefined` when there is no plane to name.
 */
export const anchorOf = (
    state: AppState,
    options: { planeID?: string } = {},
): PluridPlaneAnchor | undefined => {
    const space = state.space;
    const configuration = state.configuration;
    const plane = options.planeID
        ? spaceEngine.tree.logic.getTreePlaneByID(space.tree, options.planeID)
        : lookedAtPlane(state);
    if (!plane) {
        return undefined;
    }
    const identity = planeIdentity(space.tree, plane.planeID);
    if (!identity) {
        return undefined;
    }
    const view = space.viewSize;
    const name = {
        path: identity.path,
        ...(identity.occurrence > 0 ? { occurrence: identity.occurrence } : {}),
    };

    if (cameraEngine.isDocked(
        space.camera,
        dockGeometry(plane, configuration, view),
        view,
        configuration.space.docking?.epsilon,
        undefined,
        space.cameraLimits,
        configuration.space.docking?.scale,
    )) {
        return { ...name, pose: 'dock' };
    }
    if (sameCamera(space.camera, frameTargetForPlane(space, configuration, plane))) {
        return { ...name, pose: 'frame' };
    }
    return {
        ...name,
        pose: roundPose(cameraEngine.poseOnPlane(
            space.camera,
            planeGeometry(plane, resolvePlaneFallbackSize(configuration, view)),
            view,
        )),
    };
};


/** Two anchors that name one stop: one plane, and poses that draw the same picture of it. */
export const sameAnchor = (
    a: PluridPlaneAnchor,
    b: PluridPlaneAnchor,
): boolean => {
    if (a.path !== b.path || (a.occurrence ?? 0) !== (b.occurrence ?? 0)) {
        return false;
    }
    const poseA = a.pose ?? 'frame';
    const poseB = b.pose ?? 'frame';
    if (typeof poseA === 'string' || typeof poseB === 'string') {
        return poseA === poseB;
    }
    return cameraEngine.samePose(poseA, poseB);
};


export {
    resolveAnchor,
};
// #endregion module
