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
    } from '@plurid/plurid-data';

    import {
        BRIDGE_REACH_VARIABLE,
        BRIDGE_ANGLE_VARIABLE,
    } from '~services/logic/link/bridge';
    import {
        CHROME_OPACITY_AMBIENT,
    } from '~services/styled/chrome';
    // #endregion external
// #endregion imports



// #region module
export interface IStyledPluridPlaneBridge {
    theme: Theme;
    planeControls: boolean;
    planeOpacity: number;
    transparentUI: boolean;
    mouseOver: boolean;
    bridgeLength: number;
    /** The plane edge the bridge leaves from (`TreePlane.bridgeSide`). */
    bridgeSide: 'start' | 'end';
    /** How far the plane's top (its controls bar) hangs above the sheet, px: 56 on a page, 0 in the space. */
    raise: number;
}

/** The strip's height, px: the band the leash is drawn as. */
const STRIP = BRIDGE_STRIP_HEIGHT;
/** The light film over the strip's own colour, so the chrome's dark still reads over a dark page. */
const FILM = 'rgba(255, 255, 255, 0.16)';

/**
 * A band of half-width `half` px across an angled gradient: the stops sit `feather` px apart at the
 * edges (a hard stop draws a jagged diagonal), inside the band so the resting strip fills its box.
 */
const band = (
    color: string,
    half: number,
    feather = 1,
): string => `linear-gradient(var(--plurid-leash-angle), transparent calc(50% - ${half}px), ${color} calc(50% - ${half - feather}px), ${color} calc(50% + ${half - feather}px), transparent calc(50% + ${half}px))`;

export const StyledPluridPlaneBridge = styled.div<IStyledPluridPlaneBridge>`
    --plurid-leash-fill: ${({
        theme,
        planeControls,
        planeOpacity,
        transparentUI,
        mouseOver,
    }) => {
        if (transparentUI && !mouseOver) {
            return theme.backgroundColorPrimaryAlpha;
        }

        if (planeOpacity === 0) {
            return 'transparent';
        }

        if (!planeControls) {
            return theme.backgroundColorPrimary;
        }

        return theme.backgroundColorDark;
    }};
    --plurid-leash-angle: var(${BRIDGE_ANGLE_VARIABLE}, 0deg);

    /* THE STUB. A strip one bridge length long from the child's edge to its parent's face, FLUSH
       with the plane's top — the top of its controls bar, which on a page hangs above the sheet —
       and CENTRED on the link's line: the plane is placed half a strip above that line
       (TreePlane.bridgeOffset), so the strip's top is the plane's top and its centre the link
       (the user's rule, 2026-09-06). */
    position: absolute;
    ${({ bridgeLength, bridgeSide }) => (bridgeSide === 'end'
        ? `right: -${bridgeLength}px;`
        : `left: -${bridgeLength}px;`)}
    width: ${({ bridgeLength }) => bridgeLength}px;
    top: ${({ raise }) => -raise}px;
    height: ${STRIP}px;
    background-color: var(--plurid-leash-fill);
    background-image: linear-gradient(${FILM}, ${FILM});

    /* THE LEASH. While the link scrolls, its plane element carries the segment to the link's current
       point (services/logic/link/bridge.ts: a reach and a tilt, clockwise-positive, y down). The
       strip is drawn as a BAND across this box - angled gradients - never as a rotated element: the
       box stays axis-aligned, exactly as long as the bridge, so it ends AT the parent's face and never
       reaches past it. A plane's layer bounds include its bridge, and a layer crossing the parent's
       plane is split by the browser's 3D sorting, which dropped everything outside the child's box
       (its bridge and its controls bar) whenever the leash tilted (Chrome, 2026-09-06). The segment
       pivots about the resting strip's centre — the link's line — and the box is as tall as its
       drop plus the band's cut at the vertical edges; the gradient's centre is the box's centre,
       which is the segment's midpoint. Without CSS trigonometry the bridge is the plain stub. */
    @supports (top: calc(1px / cos(0deg))) {
        /* the far end's vertical offset from the strip's centre: negative when the leash rises */
        --plurid-leash-drop: calc(${({ bridgeSide }) => (bridgeSide === 'end' ? '' : '-1 * ')}var(${BRIDGE_REACH_VARIABLE}, ${({ bridgeLength }) => bridgeLength}px) * sin(var(--plurid-leash-angle)));
        /* the band's half-height where a vertical edge cuts it */
        --plurid-leash-half: calc(${STRIP / 2}px / cos(var(--plurid-leash-angle)));
        top: calc(${({ raise }) => STRIP / 2 - raise}px + min(0px, var(--plurid-leash-drop)) - var(--plurid-leash-half));
        height: calc(max(var(--plurid-leash-drop), -1 * var(--plurid-leash-drop)) + 2 * var(--plurid-leash-half));
        background-color: transparent;
        background-image:
            ${band(FILM, STRIP / 2)},
            ${band('var(--plurid-leash-fill)', STRIP / 2)};
    }

    opacity: ${CHROME_OPACITY_AMBIENT};
    transition: opacity var(--plurid-dock-fade, 240ms) ease;
    /* while the space moves the leash is the thing to follow */
    [data-plurid-motion='tween'] &,
    [data-plurid-motion='gesture'] &,
    [data-plurid-motion='fling'] & {
        opacity: 0.75;
    }
    /* Decoration only. Seen nearly edge-on, a bridge's hit box lands over its parent's links
       (Chrome returned the uv plane's bridge on top of the detail plane's "lod ->", 2026-09-05). */
    pointer-events: none;
`;
// #endregion module
