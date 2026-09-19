// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries

    // #region external
    import {
        BRIDGE_STRIP_HEIGHT,
        BRIDGE_OPACITY_REST,
        BRIDGE_OPACITY_LIVE,
    } from '@plurid/plurid-data';

    import {
        BRIDGE_REACH_VARIABLE,
        BRIDGE_ANGLE_VARIABLE,
    } from '~services/logic/link/bridge';
    // #endregion external
// #endregion imports



// #region module
export interface IStyledPluridPlaneBridge {
    theme: Theme;
    planeOpacity: number;
    mouseOver: boolean;
    bridgeLength: number;
    /** The plane edge the bridge leaves from (`TreePlane.bridgeSide`). */
    bridgeSide: 'start' | 'end';
    /** How far the plane's top (its controls bar) hangs above the sheet, px: 56 on a page, 0 in the space. */
    raise: number;
    /** The line's width, px (`space.bridge.thickness`). */
    thickness: number;
    /** Whether the line rests quiet and comes up when it matters (`space.bridge.quiet`). */
    quiet: boolean;
}

/** The strip the PLACEMENT is built on: the plane hangs half of it above the link's line. */
const STRIP = BRIDGE_STRIP_HEIGHT;

/**
 * A band of half-width `half` px across an angled gradient: the stops sit `feather` px apart at the
 * edges (a hard stop draws a jagged diagonal), inside the band so the resting line fills its box.
 */
const band = (
    color: string,
    half: string,
    feather = '0.6px',
): string => `linear-gradient(var(--plurid-leash-angle), transparent calc(50% - ${half}), ${color} calc(50% - ${half} + ${feather}), ${color} calc(50% + ${half} - ${feather}), transparent calc(50% + ${half}))`;

export const StyledPluridPlaneBridge = styled.div<IStyledPluridPlaneBridge>`
    --plurid-leash-angle: var(${BRIDGE_ANGLE_VARIABLE}, 0deg);

    /* A BRIDGE IS A LINE. It ran one bridge length from the child's edge to its parent's face as a
       30px band, CENTRED on the link's line - the plane is placed half a strip above that line
       (TreePlane.bridgeOffset), which is what used to put the band's top at the plane's top. The
       placement is unchanged; only what is drawn on that line is. A band was a plate across the
       space and a band tapering to a thread read as an arrowhead, so it is a hairline of one width
       at every length now, the same object as the crosslink beam beside it (2026-09-19). */
    position: absolute;
    ${({ bridgeLength, bridgeSide }) => (bridgeSide === 'end'
        ? `right: -${bridgeLength}px;`
        : `left: -${bridgeLength}px;`)}
    width: ${({ bridgeLength }) => bridgeLength}px;
    top: ${({ raise, thickness }) => STRIP / 2 - raise - thickness / 2}px;
    height: ${({ thickness }) => thickness}px;
    background-color: var(--plurid-ink);

    /* THE LEASH. While the link scrolls, its plane element carries the segment to the link's current
       point (services/logic/link/bridge.ts: a reach and a tilt, clockwise-positive, y down). The
       bridge LEANS toward the link rather than stretching to it, so the box stays about a bridge
       long however far the reader scrolls, and the line is drawn as a BAND across this box - never
       as a rotated element: the box stays axis-aligned, exactly as long as the bridge, so it ends
       AT the parent's face and never reaches past it. A plane's layer bounds include its bridge,
       and a layer crossing the parent's plane is split by the browser's 3D sorting, which dropped
       everything outside the child's box (its bridge and its controls bar) whenever the leash
       tilted (Chrome, 2026-09-06). The box is as tall as the drop plus the line's cut at the
       vertical edges; without CSS trigonometry the bridge is the plain stub above. */
    @supports (top: calc(1px / cos(0deg))) {
        /* the far end's vertical offset from the link's line: negative when the leash rises */
        --plurid-leash-drop: calc(${({ bridgeSide }) => (bridgeSide === 'end' ? '' : '-1 * ')}var(${BRIDGE_REACH_VARIABLE}, ${({ bridgeLength }) => bridgeLength}px) * sin(var(--plurid-leash-angle)));
        /* the line's half-width where a vertical edge cuts it */
        --plurid-leash-half: calc(${({ thickness }) => thickness / 2}px / cos(var(--plurid-leash-angle)));
        top: calc(${({ raise }) => STRIP / 2 - raise}px + min(0px, var(--plurid-leash-drop)) - var(--plurid-leash-half));
        height: calc(max(var(--plurid-leash-drop), -1 * var(--plurid-leash-drop)) + 2 * var(--plurid-leash-half));
        background-color: transparent;
        background-image: ${band('var(--plurid-ink)', 'var(--plurid-leash-half)')};
    }

    /* QUIET UNTIL IT MATTERS. A still space should be still: the line rests barely there and comes
       up while the camera moves (the ancestor's motion attribute) or while its own plane is under
       the pointer. A plane drawn at no opacity at all keeps no bridge. */
    opacity: ${({ planeOpacity, quiet, mouseOver }) => {
        if (planeOpacity === 0) {
            return 0;
        }
        if (!quiet || mouseOver) {
            return BRIDGE_OPACITY_LIVE;
        }
        return BRIDGE_OPACITY_REST;
    }};
    transition: opacity 160ms ease;
    [data-plurid-motion='tween'] &,
    [data-plurid-motion='gesture'] &,
    [data-plurid-motion='fling'] & {
        opacity: ${({ planeOpacity }) => (planeOpacity === 0 ? 0 : BRIDGE_OPACITY_LIVE)};
    }

    /* Decoration only. Seen nearly edge-on, a bridge's hit box lands over its parent's links
       (Chrome returned the uv plane's bridge on top of the detail plane's "lod ->", 2026-09-05). */
    pointer-events: none;
`;
// #endregion module
