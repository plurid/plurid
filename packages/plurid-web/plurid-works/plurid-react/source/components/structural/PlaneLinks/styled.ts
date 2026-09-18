// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        CHROME_OPACITY_AMBIENT,
    } from '~services/styled/chrome';
    // #endregion external
// #endregion imports



// #region module
/**
 * The edges layer. Lives inside `StyledPluridRoots` (the camera frame) as a sibling of the roots, so
 * it inherits the camera matrix via `preserve-3d` and the beams orbit with the planes. `top/left: 0`
 * pins it to the shared plane origin; `pointer-events: none` keeps it from intercepting plane clicks.
 */
export const StyledPluridPlaneLinks = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0 0;
    transform-style: preserve-3d;
    pointer-events: none;
`;


export interface IStyledPluridPlaneLink {
    theme: Theme;
    length: number;
    thickness: number;
}

export interface IStyledPluridPlaneLeash {
    theme: Theme;
    thickness: number;
    /** The surface a leash is painted from: the plane's own, as a plane's bridge is painted. */
    fill: string;
    /** How far the full band runs off the child's edge before it tapers, px. */
    taperRun: number;
    /** The height the band tapers to where it meets the link, px. */
    taperTip: number;
}

/**
 * The fade along a leash, from the child's edge (`100%`, where the beam ends) back to the link.
 * The stops are in px, so a short leash never reaches them and stays as solid as the band it
 * continues, while a long one dissolves toward its parent.
 */
const LEASH_FADE = 'linear-gradient(to left, rgba(0, 0, 0, 0.26) 0, rgba(0, 0, 0, 0.62) calc(100% - 200px), rgb(0, 0, 0) calc(100% - 56px), rgb(0, 0, 0) 100%)';

/**
 * A single beam. Anchored at its left edge (`transform-origin: 0 0`), sized to the edge length, and
 * positioned/rotated by the inline `transform` from `computeEdgeTransform`.
 */
export const StyledPluridPlaneLink = styled.div<IStyledPluridPlaneLink>`
    position: absolute;
    top: 0;
    left: 0;
    height: ${({ thickness }) => thickness}px;
    width: ${({ length }) => length}px;
    transform-origin: 0 0;
    background-color: var(--plurid-ink);
    border-radius: ${({ thickness }) => thickness}px;
    opacity: var(--plurid-opacity-ambient);
`;


/**
 * A leash: the bridge's strip drawn as a beam - from the link's point on the parent's face to the
 * moved child's edge - with the band's own colours (the chrome's solid surface under a light film),
 * in the roots' frame like every beam, so it rides the camera and follows a drag per commit.
 *
 * It wears the bridge's own shape: the full band for `taperRun` px at the CHILD's edge (the beam
 * runs parent to child, so that is its far end, `100%`), tapering to `taperTip` at the link, and
 * fading along the way. A dragged child's leash is often hundreds of px long, which as a flat
 * 30px plate was the grey wall across the reader's space (2026-09-18); a bridge and a leash read
 * as one object, which was the rule of 2026-09-17.
 */
export const StyledPluridPlaneLeash = styled.div<IStyledPluridPlaneLeash>`
    position: absolute;
    top: 0;
    left: 0;
    height: ${({ thickness }) => thickness}px;
    transform-origin: 0 0;
    background-color: ${({ fill }) => fill};
    background-image: linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.16));
    clip-path: ${({ thickness, taperRun, taperTip }) => `polygon(
        0 calc(50% - ${taperTip / 2}px),
        ${taperRun}px 0,
        100% 0,
        100% ${thickness}px,
        ${taperRun}px ${thickness}px,
        0 calc(50% + ${taperTip / 2}px)
    )`};
    -webkit-mask-image: ${LEASH_FADE};
    mask-image: ${LEASH_FADE};
    /* the LIVE token, not the constant baked in: the crosslink beam beside this
       one reads the ambient-opacity custom property, so a look that quieted one
       quieted everything except these two (2026-09-14). NOTE no backticks in a
       styled template - they close it, and the rest is silently discarded. */
    opacity: var(--plurid-opacity-ambient, ${CHROME_OPACITY_AMBIENT});
    pointer-events: none;
`;
// #endregion module
