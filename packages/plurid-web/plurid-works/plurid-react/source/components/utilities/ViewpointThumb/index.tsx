// #region imports
    // #region libraries
    import React from 'react';

    import {
        CameraState,
        ViewSize,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        computeMinimapFootprint,
        MinimapFrame,
        MinimapLayout,
    } from '~components/utilities/Minimap/logic';
    // #endregion external
// #endregion imports



// #region module
/**
 * WHAT A VIEWPOINT COVERS, as a picture: the minimap's own projection of the space (`Minimap/logic`)
 * at thumbnail size — a dot per shown plane, the links between them — under THE REGION THE SAVED
 * CAMERA FRAMES (`computeMinimapFootprint`: the view's four corners at the depth it looks at), with
 * a mark on what it looks at. So a row answers the question a name cannot: which planes is this
 * view of? COMPUTED, never rasterised: a thumbnail is right after any relayout, any spawn and any
 * resize, and costs no canvas, no image and no screenshot.
 *
 * Pure by construction: the LAYOUT is computed once by the list that renders the thumbs (it is the
 * same for every row — only the ring differs), so a drawer of twenty bookmarks projects the tree
 * once. A camera of `null` (a viewpoint this build cannot read) draws the space without a ring.
 */
export const THUMB_FRAME: MinimapFrame = {
    width: 92,
    height: 58,
    padding: 9,
};


export interface ViewpointThumbProperties {
    /** The space, projected at this thumb's size (`computeMinimapLayout` with `THUMB_FRAME`). */
    layout: MinimapLayout;
    /** The viewpoint's camera; `null` draws the space alone. */
    camera: CameraState | null;
    viewSize: ViewSize;
    frame?: MinimapFrame;
}


const ViewpointThumb: React.FC<ViewpointThumbProperties> = (
    properties,
) => {
    const {
        layout,
        camera,
        viewSize,
        frame = THUMB_FRAME,
    } = properties;

    const footprint = camera
        ? computeMinimapFootprint(layout, camera, viewSize)
        : undefined;

    return (
        <svg
            width={frame.width}
            height={frame.height}
            viewBox={`0 0 ${frame.width} ${frame.height}`}
            aria-hidden="true"
            focusable="false"
            data-plurid-viewpoint-thumb=""
        >
            {layout.links.map((link) => (
                <line
                    key={link.planeID}
                    x1={link.from.x}
                    y1={link.from.y}
                    x2={link.to.x}
                    y2={link.to.y}
                    stroke="var(--plurid-line)"
                    strokeWidth={1}
                />
            ))}

            {layout.dots.map((dot) => (
                <circle
                    key={dot.planeID}
                    cx={dot.x}
                    cy={dot.y}
                    r={Math.max(1.5, dot.size / 3)}
                    fill="var(--plurid-ink-muted)"
                    fillOpacity={dot.opacity}
                    data-plurid-thumb-plane={dot.planeID}
                />
            ))}

            {footprint && (
                <>
                    {footprint.area > 1 && (
                        <polygon
                            points={footprint.corners.map((corner) => corner.x + ',' + corner.y).join(' ')}
                            fill="var(--plurid-accent)"
                            fillOpacity={0.12}
                            stroke="var(--plurid-accent)"
                            strokeWidth={1}
                            strokeOpacity={0.7}
                            strokeLinejoin="round"
                            data-plurid-thumb-frame=""
                        />
                    )}
                    <circle
                        cx={footprint.pivot.x}
                        cy={footprint.pivot.y}
                        r={2}
                        fill="var(--plurid-accent)"
                        data-plurid-thumb-look=""
                    />
                </>
            )}
        </svg>
    );
}
// #endregion module



// #region exports
export default ViewpointThumb;
// #endregion exports
