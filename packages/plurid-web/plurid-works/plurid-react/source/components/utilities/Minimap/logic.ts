// #region imports
    // #region libraries
    import {
        TreePlane,
        CameraState,
        ViewSize,
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        interaction,
    } from '~services/engine';

    import {
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';
    // #endregion external
// #endregion imports



// #region module
/**
 * The minimap is a FIXED FRONT VIEW of the space: world X across, world Y down, always — the two
 * axes the layouts place roots on, so the map never re-arranges when a child spawns with depth or
 * when the camera moves. Depth is a cue on each dot (farther = smaller and dimmer), children are
 * smaller dots joined to their parent, and the ring marks the camera's look-at point (the pivot),
 * clamped into the map, with a tick toward the eye. Pure: the component only renders this.
 */
export const DOT = 10;
export const CHILD_DOT = 7;
export const HIT = 26;
export const CHILD_HIT = 20;
export const TICK = 8;


export interface MinimapPoint {
    x: number;
    y: number;
}

export interface MinimapDot {
    planeID: string;
    route: string;
    /** Map px. */
    x: number;
    y: number;
    /** World depth of the plane's center (negative = away from the viewer). */
    z: number;
    /** Dot diameter (px) and opacity, from the depth cue (children start smaller). */
    size: number;
    opacity: number;
    /** Nearer dots stack on top; a child over its parent at equal depth. */
    zIndex: number;
    hit: number;
    child: boolean;
    parentID?: string;
}

export interface MinimapLink {
    planeID: string;
    from: MinimapPoint;
    to: MinimapPoint;
}

export interface MinimapRing {
    /** The viewer: the camera EYE in the map (clamped to its edge when the eye is off the map). */
    x: number;
    y: number;
    /** The eye fell outside the map and was pulled to its edge. */
    clamped: boolean;
    /** A short tick from the ring toward the pivot — where the viewer looks. */
    tickX: number;
    tickY: number;
    /** The look-at point (the camera pivot) in the map, clamped the same way. */
    pivot: MinimapPoint & { clamped: boolean };
}

export interface MinimapLayout {
    dots: MinimapDot[];
    links: MinimapLink[];
    /** World X/Y → map px (the fit of the visible planes' box into the map). */
    project: (point: MinimapPoint) => MinimapPoint;
    scale: number;
}

export interface MinimapFrame {
    width: number;
    height: number;
    padding: number;
}

export interface MinimapLayoutInput extends MinimapFrame {
    tree: TreePlane[];
    viewSize: ViewSize;
    configuration: PluridConfiguration;
}


const clamp = (
    value: number,
    low: number,
    high: number,
): number => Math.min(high, Math.max(low, value));


/** Farther (more negative Z) = smaller and dimmer; nearer = larger, up to 1.4×. */
export const depthCue = (
    z: number,
): { size: number; opacity: number } => ({
    size: DOT * clamp(1 + z / 1600, 0.6, 1.4),
    opacity: clamp(1 + z / 3200, 0.45, 1),
});


/** Whether a plane is shown; a hidden plane hides its subtree (as the roots render it). */
const walkShown = (
    nodes: TreePlane[],
    parent: TreePlane | undefined,
    visit: (plane: TreePlane, parent: TreePlane | undefined) => void,
) => {
    for (const node of nodes) {
        if (node.show === false) {
            continue;
        }
        visit(node, parent);
        if (node.children && node.children.length > 0) {
            walkShown(node.children, node, visit);
        }
    }
};


export const computeMinimapLayout = (
    input: MinimapLayoutInput,
): MinimapLayout => {
    const {
        tree,
        viewSize,
        configuration,
        width,
        height,
        padding,
    } = input;

    const innerWidth = width - 2 * padding;
    const innerHeight = height - 2 * padding;
    const center = { x: width / 2, y: height / 2 };
    const fallback = resolvePlaneFallbackSize(configuration, viewSize);

    const entries: Array<{ plane: TreePlane; parent: TreePlane | undefined }> = [];
    walkShown(tree, undefined, (plane, parent) => {
        entries.push({ plane, parent });
    });

    const box = interaction.camera.worldBounds(tree, {
        fallbackWidth: fallback.width,
        fallbackHeight: fallback.height,
    });

    if (!box || entries.length === 0) {
        return {
            dots: [],
            links: [],
            project: () => ({ ...center }),
            scale: 1,
        };
    }

    const spanX = (box.max.x - box.min.x) || 1;
    const spanY = (box.max.y - box.min.y) || 1;
    const scale = Math.min(innerWidth / spanX, innerHeight / spanY);
    const offsetX = padding + (innerWidth - spanX * scale) / 2;
    const offsetY = padding + (innerHeight - spanY * scale) / 2;
    const project = (point: MinimapPoint): MinimapPoint => ({
        x: offsetX + (point.x - box.min.x) * scale,
        y: offsetY + (point.y - box.min.y) * scale,
    });

    const positions = new Map<string, MinimapPoint>();
    const dots: MinimapDot[] = entries.map(({ plane, parent }) => {
        const worldCenter = interaction.camera.planeCenter({
            location: plane.location,
            width: plane.width || fallback.width,
            height: plane.height || fallback.height,
        });
        const point = project(worldCenter);
        positions.set(plane.planeID, point);
        const cue = depthCue(worldCenter.z);
        const child = !!parent;

        return {
            planeID: plane.planeID,
            route: plane.route,
            x: point.x,
            y: point.y,
            z: worldCenter.z,
            size: cue.size * (child ? CHILD_DOT / DOT : 1),
            opacity: cue.opacity,
            zIndex: 100 + Math.round(worldCenter.z / 10) + (child ? 1 : 0),
            hit: child ? CHILD_HIT : HIT,
            child,
            parentID: parent?.planeID,
        };
    });

    const links: MinimapLink[] = dots
        .filter((dot) => dot.parentID !== undefined && positions.has(dot.parentID))
        .map((dot) => ({
            planeID: dot.planeID,
            from: positions.get(dot.parentID!)!,
            to: { x: dot.x, y: dot.y },
        }));

    return {
        dots,
        links,
        project,
        scale,
    };
};


/**
 * The ring is the VIEWER: the camera eye projected into the map, so it moves with every orbit
 * (the eye swings around the pivot), pan and zoom; clamped to the map's edge when the eye is off
 * it. The tick points from the eye at the pivot — where the viewer looks; the pivot itself is a
 * small mark.
 */
export const computeMinimapRing = (
    layout: MinimapLayout,
    camera: CameraState,
    viewSize: ViewSize,
    frame: MinimapFrame,
): MinimapRing => {
    const margin = frame.padding / 2;
    const clampPoint = (point: MinimapPoint) => {
        const x = clamp(point.x, margin, frame.width - margin);
        const y = clamp(point.y, margin, frame.height - margin);
        return {
            x,
            y,
            clamped: x !== point.x || y !== point.y,
        };
    };

    const eye = interaction.camera.eyeWorld(camera, viewSize);
    const eyePoint = layout.project({ x: eye.x, y: eye.y });
    const pivotPoint = layout.project({ x: camera.pivot.x, y: camera.pivot.y });
    const ring = clampPoint(eyePoint);
    const pivot = clampPoint(pivotPoint);

    const dx = pivotPoint.x - eyePoint.x;
    const dy = pivotPoint.y - eyePoint.y;
    const length = Math.hypot(dx, dy);

    return {
        x: ring.x,
        y: ring.y,
        clamped: ring.clamped,
        tickX: length > 1e-6 ? (dx / length) * TICK : 0,
        tickY: length > 1e-6 ? (dy / length) * TICK : 0,
        pivot,
    };
};


export interface MinimapProjection extends MinimapLayout {
    ring: MinimapRing;
}

/** Layout + ring in one call (tests, hosts). */
export const projectMinimap = (
    input: MinimapLayoutInput & { camera: CameraState },
): MinimapProjection => {
    const layout = computeMinimapLayout(input);
    return {
        ...layout,
        ring: computeMinimapRing(layout, input.camera, input.viewSize, input),
    };
};
// #endregion module
