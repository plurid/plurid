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
    /** How far the full band runs off the plane's edge before it tapers, px. */
    taperRun: number;
    /** The height the band tapers to at the far end, px. */
    taperTip: number;
}

/** The strip's height, px: the band the leash is drawn as. */
const STRIP = BRIDGE_STRIP_HEIGHT;
/** The light film over the strip's own colour, so the chrome's dark still reads over a dark page. */
const FILM = 'rgba(255, 255, 255, 0.16)';

/**
 * A BRIDGE IS A BAND WHERE IT LEAVES THE PLANE AND A THREAD WHERE IT ARRIVES.
 *
 * The wedge, as a clip on the same axis-aligned box: the full strip for `run` px off the plane's
 * edge, then a straight taper to `tip` at the far end. At the resting length the taper is barely
 * there and the bridge reads as the band it always was; a long one - a link scrolled far, a fan's
 * later sibling at `length + i (childWidth + gap)` - stops reading as a plate across the space.
 *
 * `centre` is the band's centre line within the box, `slope` the drop per px travelled away from
 * the plane, and `half` the band's half-height where a VERTICAL edge cuts it (the clip's edges are
 * vertical, so a tilted band is cut `1 / cos` taller, exactly as the old gradient stops were).
 */
const wedge = (
    side: 'start' | 'end',
    run: number,
    centre: string,
    half: string,
    tipHalf: string,
    drop: string,
    runDrop: string,
): string => (side === 'end'
    ? `polygon(
        0 calc(${centre} - ${half}),
        ${run}px calc(${centre} + ${runDrop} - ${half}),
        100% calc(${centre} + ${drop} - ${tipHalf}),
        100% calc(${centre} + ${drop} + ${tipHalf}),
        ${run}px calc(${centre} + ${runDrop} + ${half}),
        0 calc(${centre} + ${half})
    )`
    : `polygon(
        0 calc(${centre} + ${drop} - ${tipHalf}),
        calc(100% - ${run}px) calc(${centre} + ${runDrop} - ${half}),
        100% calc(${centre} - ${half}),
        100% calc(${centre} + ${half}),
        calc(100% - ${run}px) calc(${centre} + ${runDrop} + ${half}),
        0 calc(${centre} + ${drop} + ${tipHalf})
    )`);

/**
 * AND IT FADES AS IT GOES. The stops are in PX, not percentages, so the fade is length-aware for
 * free: a resting bridge is shorter than the far stops and stays as solid as it always was, a long
 * one dissolves toward the parent. Nothing hard-edged is left to cut a plane it crosses, and the
 * far end lands on the parent's face as light rather than as a butt joint.
 */
const fade = (
    side: 'start' | 'end',
): string => `linear-gradient(to ${side === 'end' ? 'right' : 'left'}, rgb(0, 0, 0) 0, rgb(0, 0, 0) 56px, rgba(0, 0, 0, 0.62) 200px, rgba(0, 0, 0, 0.26) 100%)`;

export const StyledPluridPlaneBridge = styled.div<IStyledPluridPlaneBridge>`
    --plurid-leash-fill: ${({
        theme,
        planeControls,
        planeOpacity,
        transparentUI,
        mouseOver,
    }) => {
        if (transparentUI && !mouseOver) {
            return 'var(--plurid-surface)';
        }

        if (planeOpacity === 0) {
            return 'transparent';
        }

        if (!planeControls) {
            return 'var(--plurid-plane)';
        }

        return 'var(--plurid-surface-solid)';
    }};
    --plurid-leash-angle: var(${BRIDGE_ANGLE_VARIABLE}, 0deg);

    /* THE STUB. A strip one bridge length long from the child's edge to its parent's face, FLUSH
       with the plane's top - the top of its controls bar, which on a page hangs above the sheet -
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
    /* untilted: the wedge on a flat stub, the centre line at the box's middle */
    clip-path: ${({ bridgeSide, taperRun, taperTip }) => wedge(
        bridgeSide,
        taperRun,
        '50%',
        `${STRIP / 2}px`,
        `${taperTip / 2}px`,
        '0px',
        '0px',
    )};
    -webkit-mask-image: ${({ bridgeSide }) => fade(bridgeSide)};
    mask-image: ${({ bridgeSide }) => fade(bridgeSide)};

    /* THE LEASH. While the link scrolls, its plane element carries the segment to the link's current
       point (services/logic/link/bridge.ts: a reach and a tilt, clockwise-positive, y down). The
       bridge LEANS toward the link rather than stretching to it, so the box stays about a bridge
       long however far the reader scrolls, and the wedge is drawn across it as a CLIP - never as a
       rotated element: the box stays axis-aligned, exactly as long as the bridge, so it ends AT the
       parent's face and never reaches past it. A plane's layer bounds include its bridge, and a
       layer crossing the parent's plane is split by the browser's 3D sorting, which dropped
       everything outside the child's box (its bridge and its controls bar) whenever the leash
       tilted (Chrome, 2026-09-06). The box is as tall as the drop plus the band's cut at the
       vertical edges; without CSS trigonometry the bridge is the plain stub above. */
    @supports (top: calc(1px / cos(0deg))) {
        /* the far end's vertical offset from the strip's centre: negative when the leash rises */
        --plurid-leash-drop: calc(${({ bridgeSide }) => (bridgeSide === 'end' ? '' : '-1 * ')}var(${BRIDGE_REACH_VARIABLE}, ${({ bridgeLength }) => bridgeLength}px) * sin(var(--plurid-leash-angle)));
        /* the band's half-height where a vertical edge cuts it */
        --plurid-leash-half: calc(${STRIP / 2}px / cos(var(--plurid-leash-angle)));
        /* the same cut at the tapered end */
        --plurid-leash-tip: calc(${({ taperTip }) => taperTip / 2}px / cos(var(--plurid-leash-angle)));
        /* the centre line's drop over the band's own run, the wedge's second point */
        --plurid-leash-run-drop: calc(${({ bridgeSide }) => (bridgeSide === 'end' ? '' : '-1 * ')}${({ taperRun }) => taperRun}px * tan(var(--plurid-leash-angle)));
        /* the band's centre at the plane's edge, within the box */
        --plurid-leash-centre: calc(var(--plurid-leash-half) - min(0px, var(--plurid-leash-drop)));
        top: calc(${({ raise }) => STRIP / 2 - raise}px + min(0px, var(--plurid-leash-drop)) - var(--plurid-leash-half));
        height: calc(max(var(--plurid-leash-drop), -1 * var(--plurid-leash-drop)) + 2 * var(--plurid-leash-half));
        clip-path: ${({ bridgeSide, taperRun }) => wedge(
            bridgeSide,
            taperRun,
            'var(--plurid-leash-centre)',
            'var(--plurid-leash-half)',
            'var(--plurid-leash-tip)',
            'var(--plurid-leash-drop)',
            'var(--plurid-leash-run-drop)',
        )};
    }

    /* the LIVE token, not the constant baked in: the crosslink beam beside this
       one reads the ambient-opacity custom property, so a look that quieted one
       quieted everything except these two (2026-09-14). NOTE no backticks in a
       styled template - they close it, and the rest is silently discarded. */
    opacity: var(--plurid-opacity-ambient, ${CHROME_OPACITY_AMBIENT});
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
