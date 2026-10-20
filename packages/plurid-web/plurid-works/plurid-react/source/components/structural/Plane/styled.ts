// #region imports
    // #region libraries
    import {
        PLANE_BAR_HEIGHT,
    } from '@plurid/plurid-data';
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
    import { chromeFocusRing } from '~services/styled/chrome';
// #endregion imports



// #region module
export interface IStyledPluridPlane {
    backface?: 'visible' | 'hidden';
    depthFade?: boolean;
    theme: Theme;
    mouseOver: boolean;
    show: boolean;
    transparentUI: boolean;
    planeControls: boolean;
    planeOpacity: number;
    selected: boolean;
    /** A declared or hand-set height: the content row takes the rest and scrolls inside it. */
    fixedHeight?: boolean;
    /** The controls bar takes a `PLANE_BAR_HEIGHT` row (false: it hangs above the sheet, the page presentation). */
    controlsRow?: boolean;
}

export const StyledPluridPlane = styled.div<IStyledPluridPlane>`
    /* the keyboard is on the plane's anchor: the plane wears the ring */
    &[data-plurid-focus='true'] {
        ${chromeFocusRing(2)}
    }
    /* The wrappers above it are pointer-events: none (see Roots / Root): a plane is interactive. */
    pointer-events: auto;
    backface-visibility: ${({ backface }) => (backface === 'hidden' ? 'hidden' : 'visible')};
    ${({ depthFade }) => (depthFade
        ? 'filter: blur(var(--plurid-plane-blur, 0px));'
        : '')}

    /* Culled: kept mounted (state intact), not painted, not interactive. Detached: the content
       retained or unmounted, the shell not painted. Frozen: painted, contained. */
    &[data-plurid-culled='hidden'],
    &[data-plurid-culled='detached'] {
        visibility: hidden;
        pointer-events: none;
        contain: layout paint style;
    }
    &[data-plurid-culled='frozen'] {
        contain: layout paint style;
    }
    /* Set aside (outside the docked page's lineage): the opacity is inline (0), this is its fade —
       and once faded the plane is gone for the keyboard and the reader too (inert + visibility),
       coming back at once when the attribute goes. None under reduced motion. The background's
       transition is in the same declaration: one of its own further down overrode this one, and a
       plane came back from aside at once instead of fading in (2026-10-20). */
    transition: opacity var(--plurid-dock-fade, 240ms) ease, visibility 0s linear 0s, background-color 300ms linear;
    &[data-plurid-aside] {
        visibility: hidden;
        transition: opacity var(--plurid-dock-fade, 240ms) ease, visibility 0s linear var(--plurid-dock-fade, 240ms), background-color 300ms linear;
    }
    @media (prefers-reduced-motion: reduce) {
        & {
            transition: none !important;
        }
    }

    background-color: ${({
        transparentUI,
        mouseOver,
        theme,
        planeOpacity,
    }) => {
        if (transparentUI && !mouseOver) {
            return 'var(--plurid-surface)';
        }

        if (planeOpacity !== 1) {
            // The plane's colour is a variable, which `decomposeColor` cannot read: every fraction
            // came out fully transparent (2026-10-20). The mix keeps the token and its opacity.
            const percent = Math.round(Math.min(1, Math.max(0, planeOpacity || 0)) * 1000) / 10;
            return `color-mix(in srgb, var(--plurid-plane) ${percent}%, transparent)`;
        }
        return 'var(--plurid-plane)';
    }};
    box-shadow: ${({
        planeOpacity,
        selected,
        theme,
    }) => {
        // A 3px accent ring marks selection — distinct from the hover/active highlight, and kept
        // even when the plane is fully transparent so a selected-but-faded plane still reads.
        const ring = `0 0 0 3px ${'var(--plurid-ink)'}`;
        if (planeOpacity === 0) {
            return selected ? ring : 'none';
        }
        if (selected) {
            return `${ring}, ${'var(--plurid-shadow)'}`;
        }
        return 'var(--plurid-shadow)';
    }};
    color: ${({
        theme,
    }) => {
        return 'var(--plurid-ink)';
    }};
    /* The one opacity of the rule: the depth cue's fade lived in a declaration above this one, which
       this declaration overrode, so a shown plane never faded with distance (2026-10-19). */
    opacity: ${({
        show,
        depthFade,
    }) => {
        if (!show) {
            return '0';
        }
        return depthFade ? 'var(--plurid-plane-fade, 1)' : '1';
    }};
    user-select: ${({
        show,
    }) => {
        if (!show) {
            return 'none';
        }
        return 'auto';
    }};
    /* While the space is in a navigation mode (grab, fly, a transform mode: data-plurid-navigating
       on the View) a drag over a page is the space's, so its text is not selectable then - the View's
       own rule says so, and this plane's auto above would otherwise take it back (2026-09-06). */
    [data-plurid-navigating] &,
    [data-plurid-motion='gesture'] & {
        user-select: none;
    }

    position: absolute;
    font-size: 0.9rem;
    font-family: ${
        ({
            theme,
        }: IStyledPluridPlane) => 'var(--plurid-font)'
    };

    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: ${({
        planeControls,
        controlsRow,
        fixedHeight,
    }) => {
        const content = fixedHeight ? 'minmax(0, 1fr)' : 'auto';
        if (planeControls && controlsRow !== false) {
            return PLANE_BAR_HEIGHT + 'px ' + content;
        }
        return content;
    }};

    /* Docked on THIS page (the page presentation) the sheet has no drop shadow: it IS the page. */
    &[data-plurid-page='docked'] {
        box-shadow: none;
    }

    transform-origin: 0 0 0;
`;


export const StyledFocusAnchor = styled.a`
    position: absolute;
    top: 0;
    left: 0;
    height: 0;
    width: 0;
    pointer-events: none;
    user-select: none;
`;
// #endregion module
