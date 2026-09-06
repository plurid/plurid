// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        chromeControl,
        chromeRoot,
        chromeDocked,
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
    import { RAIL_BAND } from '../DockRail/styled';
// #endregion imports



// #region module
export interface IStyledPluridViewcube {
    conceal: boolean;
    mouseOver: boolean;
    isMounted: boolean;
    fadeInTime: number;
    /** The page presentation: the box sits above the rail's band. */
    $page?: boolean;
}

export const StyledPluridViewcube = styled.div<IStyledPluridViewcube>`
    ${chromeRoot}
    /* The arrows and the fit button stay in the DOM (focusable, labelled) and only SHOW while the
       cube is hovered or holds keyboard focus. The dock controls are always shown (faint). */
    ${chromeDocked}
    &[data-plurid-hover='false']:not(:focus-within) button {
        opacity: 0;
    }
    button {
        transition: opacity 150ms ease;
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
        $page,
    }) => {
        if (conceal && !mouseOver) {
            return '-90px';
        }
        // above the rail's band (the box's own bottom row is empty space)
        return $page ? (RAIL_BAND - 20) + 'px' : '0';
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
    height: 175px;
    display: grid;
    grid-template-areas: "PVScale           PVScale         PVScale          PVScale"
                         "PVEmptyOne        PVRotateUp      PVEmptyTwo       PVTranslateY"
                         "PVRotateLeft      PVModel         PVRotateRight    PVTranslateY"
                         "PVEmptyThree      PVRotateDown    PVFitview        PVTranslateY"
                         "PVTranslateX      PVTranslateX    PVTranslateX     PVTranslateX";
    grid-template-rows: 20px 15px 105px 15px 20px;
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

    &:hover {
        opacity: 1;
    }
`;


export interface IStyledPluridViewcubeArrow {
    theme: Theme;
}

export const StyledPluridViewcubeArrow = styled.div<IStyledPluridViewcubeArrow>`
    display: grid;
    place-content: center;

    color: var(--plurid-ink);
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
        outline: 2px solid var(--plurid-focus);
        outline-offset: 1px;
    }
    user-select: none;
    font-size: var(--plurid-font-size-small);
    width: 1.2rem;
    height: 1.2rem;
    border-radius: var(--plurid-radius);
    display: grid;
    place-content: center;
    cursor: pointer;

    &:hover {
        background-color: var(--plurid-hover);
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
        fill: currentColor;
    }
`;
// #endregion module
// #endregion module
