// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        chromeControl,
        chromeRoot,
    } from '~services/styled/chrome';

    import {
        Z_INDEX,
    } from '~data/constants/zIndex';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        fadeInAnimation,
    } from '~services/styled';
    // #endregion external
// #endregion imports



// #region module
export interface IStyledPluridViewcube {
    conceal: boolean;
    mouseOver: boolean;
    isMounted: boolean;
    fadeInTime: number;
    /** The page presentation: a bottom RAIL of round buttons (fit, back, the page / cube toggle). */
    $page?: boolean;
}

export const StyledPluridViewcube = styled.div<IStyledPluridViewcube>`
    ${chromeRoot}
    /* The arrows and the fit button stay in the DOM (focusable, labelled) and only SHOW while the
       cube is hovered or holds keyboard focus. The dock controls are always shown (faint). */
    &[data-plurid-hover='false']:not(:focus-within) button:not([data-plurid-rail-button]) {
        opacity: 0;
    }
    button {
        transition: opacity 150ms ease;
    }
    /* Docked on a page: the cube, its arrows and the fit button vanish (instantly, a site never
       flashes its chrome; 240 ms back in on the reveal) — the rail's dock controls stay, the page's
       one affordance. The box itself lets clicks through to the page meanwhile. */
    & > *,
    [data-plurid-rail] > * {
        transition: opacity 240ms ease;
    }
    [data-plurid-docked] & {
        pointer-events: none;
    }
    [data-plurid-docked] & > :not([data-plurid-rail]),
    [data-plurid-docked] & [data-plurid-rail-button]:not([data-plurid-control^='dock']) {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: none;
    }
    [data-plurid-docked] & [data-plurid-control^='dock'] {
        pointer-events: auto;
    }
    @media (prefers-reduced-motion: reduce) {
        & > * {
            transition: none;
        }
    }

    position: absolute;
    @media (max-width: 800px) {
        top: ${({
            conceal,
            mouseOver,
        }) => {
            if (conceal && !mouseOver) {
                return '-90px';
            }
            return '0';
        }};
    }
    bottom: ${({
        conceal,
        mouseOver,
    }) => {
        if (conceal && !mouseOver) {
            return '-90px';
        }
        return '0';
    }};
    right: ${({
        conceal,
        mouseOver,
    }) => {
        if (conceal && !mouseOver) {
            return '-100px';
        }
        return '0';
    }};
    position: absolute;
    user-select: none;
    transition: all 300ms ease-in-out;
    z-index: ${Z_INDEX.VIEWCUBE};
    height: ${({ $page }) => ($page ? '209px' : '175px')};
    display: grid;
    grid-template-areas: "PVScale           PVScale         PVScale          PVScale"
                         "PVEmptyOne        PVRotateUp      PVEmptyTwo       PVTranslateY"
                         "PVRotateLeft      PVModel         PVRotateRight    PVTranslateY"
                         "PVEmptyThree      PVRotateDown    PVFitview        PVTranslateY"
                         "PVRail            PVRail          PVRail           PVRail";
    /* the page presentation's bottom band holds the rail: 6px gap, 32px buttons, a 16px margin */
    grid-template-rows: 20px 15px 105px 15px ${({ $page }) => ($page ? '54px' : '20px')};
    grid-template-columns: 15px 100px 15px 20px;

    opacity: ${({
        fadeInTime,
    }) => {
        if (fadeInTime) {
            return '0';
        }

        return '1';
    }};
    animation: ${({
        fadeInTime,
        isMounted,
    }) => {
        if (
            isMounted
            && fadeInTime
        ) {
            return fadeInAnimation(fadeInTime);
        }

        return '';
    }};

    :hover {
        opacity: 1;
    }
`;


export interface IStyledPluridViewcubeArrow {
    theme: Theme;
}

export const StyledPluridViewcubeArrow = styled.div<IStyledPluridViewcubeArrow>`
    display: grid;
    place-content: center;

    /* TODO
     * Themed color
     */
    color: white;
`;


export interface IStyledPluridViewcubeArrowIcon {
    theme: Theme;
}

export const StyledPluridViewcubeArrowIcon = styled.button<IStyledPluridViewcubeArrowIcon>`
    ${chromeControl}
    border: 0;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    background: none;

    &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 1px;
    }
    user-select: none;
    font-size: 0.6rem;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 0.6rem;
    display: grid;
    place-content: center;
    cursor: pointer;

    :hover {
        background-color: ${({
            theme,
        }) => {
            return theme.backgroundColorTertiary;
        }};
    }
`;


export interface IStyledFitView {
}

export const StyledFitView = styled.button<IStyledFitView>`
    ${chromeControl}
    border: 0;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    background: none;

    &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 1px;
    }
    grid-area: PVFitview;
    display: grid;
    place-content: center;
    cursor: pointer;
    user-select: none;

    svg {
        height: 0.8rem;
        width: 0.8rem;
        fill: white;
    }
`;
// #endregion module


/**
 * THE RAIL of the page presentation: the viewcube's bottom band, a right-aligned row of round
 * buttons under the cube — fit everything, back to the parent page, and the corner control (a cube
 * while the camera is docked: "there is a space"; a page while it is revealed: "back to the page").
 * The rail's dock controls are the one piece of chrome that never fades with the docked state.
 */
export const StyledDockRail = styled.div`
    grid-area: PVRail;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 16px 16px 0;
`;

/**
 * A rail button: a translucent dark pill with a faint light rim and a white glyph, so it reads over
 * the dark space and over a light page alike (docked, it sits on the PAGE, whose colours are the
 * page's).
 */
export const StyledRailButton = styled.button<{ theme: Theme }>`
    ${chromeControl}
    width: 32px;
    height: 32px;
    flex: none;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 9px;
    background: rgba(12, 14, 18, 0.55);
    color: #fff;
    cursor: pointer;
    opacity: 0.85;
    transition: opacity 150ms ease, background-color 150ms ease, border-color 150ms ease;
    &:hover,
    &:focus-visible {
        opacity: 1;
        background: rgba(12, 14, 18, 0.8);
        border-color: rgba(255, 255, 255, 0.4);
    }
    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colorTertiary};
        outline-offset: 2px;
    }
    svg {
        display: block;
        width: 17px;
        height: 17px;
    }
`;

export const StyledDockToggle = StyledRailButton;
export const StyledDockBack = StyledRailButton;
