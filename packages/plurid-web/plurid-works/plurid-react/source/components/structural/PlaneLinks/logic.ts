// #region module
export interface EdgePoint {
    x: number;
    y: number;
    z: number;
}

export interface EdgeGeometry {
    transform: string;
    length: number;
}


/**
 * The CSS-3D "beam" transform connecting point `a` to point `b`, in the SAME coordinate frame the
 * planes live in (`StyledPluridRoots`, which carries the camera matrix) — so a beam built from two
 * planes' world positions stays attached to them under orbit/pan/zoom with NO per-frame JavaScript.
 *
 * The beam is a thin box whose natural orientation is along the local +X axis, anchored at its left
 * edge. We translate its start to `a`, then rotate it to point at `b`. Working in CSS coordinates
 * (X right, Y down, Z toward the viewer), applying `rotateY(beta) rotateZ(alpha)` to the local +X
 * unit vector gives:
 *     rotateZ(alpha):              (1,0,0) -> (cosα,  sinα, 0)
 *     rotateY(beta) of that ->     (cosβ·cosα,  sinα,  -sinβ·cosα)
 * Setting that equal to the unit direction (dx,dy,dz)/L (with dxz = hypot(dx,dz)) solves to
 *     alpha = atan2(dy, dxz)   // pitch in the XY plane (rotateZ)
 *     beta  = atan2(-dz, dx)   // yaw in the XZ plane   (rotateY)
 * The `-thickness/2` y-offset centres the thin beam on the line through the two anchors.
 */
export const computeEdgeTransform = (
    a: EdgePoint,
    b: EdgePoint,
    thickness: number,
): EdgeGeometry => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;

    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const dxz = Math.sqrt(dx * dx + dz * dz);

    const alpha = Math.atan2(dy, dxz);
    const beta = Math.atan2(-dz, dx);

    const transform = `translate3d(${a.x}px, ${a.y - thickness / 2}px, ${a.z}px) `
        + `rotateY(${beta}rad) rotateZ(${alpha}rad)`;

    return {
        transform,
        length,
    };
}
// #endregion module
