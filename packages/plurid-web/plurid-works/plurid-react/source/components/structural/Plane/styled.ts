// #region imports
    // #region libraries
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
    height: auto;
    width: 100%;
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
        fixedHeight,
    }) => {
        const content = fixedHeight ? 'minmax(0, 1fr)' : 'auto';
        if (planeControls) {
            return '56px ' + content;
        }
        return content;
    }};

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
