// #region imports
    // #region internal
    import type {
        CameraState,
        ViewSize,
        Vec2,
        Vec3,
        PlaneGeometry,
    } from './types';

    import {
        cameraMatrix,
        viewCenter,
        transformPoint,
    } from './matrix';

    import {
        planeCorners,
    } from './project';
    // #endregion internal
// #endregion imports



// #region module
/**
 * OCCLUSION (2026-10-31): which planes stand between the camera and a target plane. A plane
 * OCCLUDES the target when, on the screen, the part of it that is NEARER the camera than the target
 * covers more than `threshold` of the target's drawn area. A real depth test over the overlap, not a
 * comparison of centres: a plane tilted through the target occludes by the part of it in front.
 *
 * In camera space (the roots' coordinates before the CSS perspective divide, `z` toward the viewer)
 * the eye is at `E = (C.x, C.y, d)`, `d` the perspective, and the ray through a screen point `s` is
 * `r(s) = (s.x − C.x, s.y − C.y, −d)`, affine in `s`. A plane `(n, q)` is hit at
 * `t = N / (n · r)`, `N = n · (q − E)`; the occluder is nearer than the target where
 * `t_o < t_t`, that is where `σ · (N_o (n_t · r) − N_t (n_o · r)) < 0`, `σ = sign(N_o N_t)`: an
 * affine function of `s`, so the region is a half-plane of the screen bounded by the projected line
 * where the two planes meet. Both quads are clipped at the eye's near plane, projected, intersected
 * (two convex polygons), and the intersection is clipped by that half-plane: its area over the
 * target's is the share it covers.
 */

/** A plane must cover more than this share of the target's drawn area to occlude it. */
export const OCCLUSION_THRESHOLD = 0.08;

/** Points nearer the eye than this (px, camera space) are clipped away. */
const NEAR = 1;
const EPSILON = 1e-9;

export interface OccludingPlane {
    planeID: string;
    /** The share of the target's drawn area this plane covers in front of it, 0 to 1. */
    covered: number;
}

export interface OcclusionCandidate extends PlaneGeometry {
    planeID: string;
}


const subtract = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const cross = (a: Vec3, b: Vec3): Vec3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});
const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;

/** Twice the signed area (shoelace); positive for a counter-clockwise polygon in y-down screen space is not assumed. */
const signedArea = (
    polygon: Vec2[],
): number => {
    let sum = 0;
    for (let index = 0; index < polygon.length; index += 1) {
        const a = polygon[index];
        const b = polygon[(index + 1) % polygon.length];
        sum += a.x * b.y - b.x * a.y;
    }
    return sum / 2;
};

export const polygonArea = (
    polygon: Vec2[],
): number => Math.abs(signedArea(polygon));

/** Keep the part of a polygon where `a·x + b·y + c ≤ 0` (Sutherland–Hodgman against one line). */
export const clipByHalfPlane = (
    polygon: Vec2[],
    a: number,
    b: number,
    c: number,
): Vec2[] => {
    const result: Vec2[] = [];
    const value = (point: Vec2) => a * point.x + b * point.y + c;
    for (let index = 0; index < polygon.length; index += 1) {
        const current = polygon[index];
        const next = polygon[(index + 1) % polygon.length];
        const vc = value(current);
        const vn = value(next);
        if (vc <= 0) {
            result.push(current);
        }
        if ((vc < 0 && vn > 0) || (vc > 0 && vn < 0)) {
            const share = vc / (vc - vn);
            result.push({
                x: current.x + (next.x - current.x) * share,
                y: current.y + (next.y - current.y) * share,
            });
        }
    }
    return result;
};

/** The intersection of a polygon with a CONVEX one (Sutherland–Hodgman). */
export const clipByConvex = (
    subject: Vec2[],
    convex: Vec2[],
): Vec2[] => {
    if (subject.length < 3 || convex.length < 3) {
        return [];
    }
    // inside is to the left of each edge for a counter-clockwise clip polygon (in a y-up frame:
    // the sign test below only needs the orientation to be consistent)
    const orientation = signedArea(convex) >= 0 ? 1 : -1;
    let output = subject;
    for (let index = 0; index < convex.length && output.length > 0; index += 1) {
        const p = convex[index];
        const q = convex[(index + 1) % convex.length];
        // the line through p and q: inside where cross((q − p), (s − p)) · orientation ≥ 0,
        // written as a·x + b·y + c ≤ 0
        const a = (q.y - p.y) * orientation;
        const b = -(q.x - p.x) * orientation;
        const c = -(a * p.x + b * p.y);
        output = clipByHalfPlane(output, a, b, c);
    }
    return output;
};


interface CameraSpacePlane {
    /** the polygon on the screen, clipped at the near plane */
    polygon: Vec2[];
    normal: Vec3;
    /** `n · (q − E)` */
    reach: number;
}

const cameraSpacePlane = (
    matrix: number[],
    center: Vec3,
    perspective: number,
    plane: PlaneGeometry,
): CameraSpacePlane | undefined => {
    const corners = planeCorners(plane).map((corner) => transformPoint(matrix, corner));
    const normal = cross(subtract(corners[1], corners[0]), subtract(corners[3], corners[0]));
    if (Math.abs(normal.x) + Math.abs(normal.y) + Math.abs(normal.z) < EPSILON) {
        return undefined;
    }
    const eye = { x: center.x, y: center.y, z: perspective };
    const reach = dot(normal, subtract(corners[0], eye));

    // clip the quad at the near plane (z ≤ d − NEAR), then project with the perspective divide
    const limit = perspective - NEAR;
    const clipped: Vec3[] = [];
    for (let index = 0; index < corners.length; index += 1) {
        const current = corners[index];
        const next = corners[(index + 1) % corners.length];
        const inside = current.z <= limit;
        const nextInside = next.z <= limit;
        if (inside) {
            clipped.push(current);
        }
        if (inside !== nextInside) {
            const share = (limit - current.z) / (next.z - current.z);
            clipped.push({
                x: current.x + (next.x - current.x) * share,
                y: current.y + (next.y - current.y) * share,
                z: limit,
            });
        }
    }
    if (clipped.length < 3) {
        return undefined;
    }
    const polygon = clipped.map((point) => {
        const k = perspective / (perspective - point.z);
        return {
            x: center.x + (point.x - center.x) * k,
            y: center.y + (point.y - center.y) * k,
        };
    });
    return { polygon, normal, reach };
};


/**
 * The share of `target`'s drawn area that `plane` covers IN FRONT of it, 0 to 1 (0 for a plane
 * behind it, beside it, edge-on, or wholly behind the eye).
 */
export const occludedShare = (
    camera: CameraState,
    view: ViewSize,
    target: PlaneGeometry,
    plane: PlaneGeometry,
): number => {
    const matrix = cameraMatrix(camera, view);
    const center = viewCenter(view);
    const perspective = camera.perspective;
    const front = cameraSpacePlane(matrix, center, perspective, target);
    const other = cameraSpacePlane(matrix, center, perspective, plane);
    return front && other ? shareOf(front, other, center, perspective) : 0;
};

const shareOf = (
    target: CameraSpacePlane,
    other: CameraSpacePlane,
    center: Vec3,
    perspective: number,
): number => {
    const targetArea = polygonArea(target.polygon);
    if (targetArea < EPSILON) {
        return 0;
    }
    const overlap = clipByConvex(other.polygon, target.polygon);
    if (overlap.length < 3) {
        return 0;
    }
    // g(s) = N_o (n_t · r(s)) − N_t (n_o · r(s)), r(s) = (s.x − C.x, s.y − C.y, −d)
    const { normal: no, reach: No } = other;
    const { normal: nt, reach: Nt } = target;
    const sigma = Math.sign(No * Nt);
    if (sigma === 0) {
        return 0;
    }
    const a = (No * nt.x - Nt * no.x) * sigma;
    const b = (No * nt.y - Nt * no.y) * sigma;
    const offsetT = -nt.x * center.x - nt.y * center.y - nt.z * perspective;
    const offsetO = -no.x * center.x - no.y * center.y - no.z * perspective;
    const c = (No * offsetT - Nt * offsetO) * sigma;
    // nearer where σ·g < 0: keep σ·g ≤ 0, minus a hair, so a coplanar neighbour covers nothing
    const scale = Math.abs(a) + Math.abs(b) + Math.abs(c);
    if (scale < EPSILON) {
        return 0;
    }
    const inFront = clipByHalfPlane(overlap, a, b, c + scale * 1e-9);
    if (inFront.length < 3) {
        return 0;
    }
    return Math.min(1, polygonArea(inFront) / targetArea);
};


/**
 * THE PLANES THAT OCCLUDE `target` from `camera`, the most covering first: every candidate (the
 * target itself skipped) whose part in front of the target covers more than `threshold` of the
 * target's drawn area.
 */
export const occludingPlanes = (
    camera: CameraState,
    view: ViewSize,
    target: PlaneGeometry,
    candidates: OcclusionCandidate[],
    threshold: number = OCCLUSION_THRESHOLD,
    targetID?: string,
): OccludingPlane[] => {
    const matrix = cameraMatrix(camera, view);
    const center = viewCenter(view);
    const perspective = camera.perspective;
    const front = cameraSpacePlane(matrix, center, perspective, target);
    if (!front) {
        return [];
    }
    const found: OccludingPlane[] = [];
    for (const candidate of candidates) {
        if (candidate.planeID === targetID) {
            continue;
        }
        const other = cameraSpacePlane(matrix, center, perspective, candidate);
        if (!other) {
            continue;
        }
        const covered = shareOf(front, other, center, perspective);
        if (covered > threshold) {
            found.push({ planeID: candidate.planeID, covered });
        }
    }
    return found.sort((x, y) => (y.covered - x.covered) || x.planeID.localeCompare(y.planeID));
};
// #endregion module
