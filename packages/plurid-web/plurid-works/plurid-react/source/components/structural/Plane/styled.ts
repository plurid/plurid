// #region imports
    // #region libraries
    import {
        PLANE_BAR_HEIGHT,
    } from '@plurid/plurid-data';
    import styled from 'styled-components';

    import {
        Theme,
        decomposeColor,
    } from '@plurid/plurid-themes';
    // #endregion libraries
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
    /* The wrappers above it are pointer-events: none (see Roots / Root): a plane is interactive. */
    pointer-events: auto;
    backface-visibility: ${({ backface }) => (backface === 'hidden' ? 'hidden' : 'visible')};
    ${({ depthFade }) => (depthFade
        ? 'opacity: var(--plurid-plane-fade, 1); filter: blur(var(--plurid-plane-blur, 0px));'
        : '')}

    /* Culled: kept mounted (state intact), not painted, not interactive. Frozen: painted, contained. */
    &[data-plurid-culled='hidden'] {
        visibility: hidden;
        pointer-events: none;
        contain: layout paint style;
    }
    &[data-plurid-culled='frozen'] {
        contain: layout paint style;
    }
    /* Set aside (outside the docked page's lineage): the opacity is inline (0), this is its fade —
       and once faded the plane is gone for the keyboard and the reader too (inert + visibility),
       coming back at once when the attribute goes. None under reduced motion. */
    transition: opacity var(--plurid-dock-fade, 240ms) ease, visibility 0s linear 0s;
    &[data-plurid-aside] {
        visibility: hidden;
        transition: opacity var(--plurid-dock-fade, 240ms) ease, visibility 0s linear var(--plurid-dock-fade, 240ms);
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
            return theme.backgroundColorPrimaryAlpha;
        }

        if (planeOpacity !== 1) {
            const decomposedColor = decomposeColor(theme.backgroundColorPrimary);
            if (decomposedColor) {
                const color = `hsla(${decomposedColor.hue}, ${decomposedColor.saturation}%, ${decomposedColor.lightness}%, ${planeOpacity})`;
                return color;
            }
            return 'transparent';
        }
        return theme.backgroundColorPrimary;
    }};
    box-shadow: ${({
        planeOpacity,
        selected,
        theme,
    }) => {
        // A 3px accent ring marks selection — distinct from the hover/active highlight, and kept
        // even when the plane is fully transparent so a selected-but-faded plane still reads.
        const ring = `0 0 0 3px ${theme.colorPrimary}`;
        if (planeOpacity === 0) {
            return selected ? ring : 'none';
        }
        if (selected) {
            return `${ring}, ${theme.boxShadowUmbra}`;
        }
        return theme.boxShadowUmbra;
    }};
    color: ${({
        theme,
    }) => {
        return theme.colorPrimary;
    }};
    opacity: ${({
        show,
    }) => {
        if (!show) {
            return '0';
        }
        return '1';
    }};
    user-select: ${({
        show,
    }) => {
        if (!show) {
            return 'none';
        }
        return 'auto';
    }};

    position: absolute;
    font-size: 0.9rem;
    font-family: ${
        ({
            theme,
        }: IStyledPluridPlane) => theme.fontFamilySansSerif
    };
    transition: background-color 300ms linear;

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
